"""Route business logic: list, detail, create, update, delete.

Routes carry an ordered list of stops, optional shaping waypoints, and an
optional schedule (fixed or frequency). Details are serialized to the API schema
explicitly because the ORM attribute names differ from the response field names.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from src.api import schemas
from src.models.entities import (
    Route,
    RouteStop,
    Schedule,
    ScheduleType,
    Stop,
    TransportMode,
    Waypoint,
)
from src.services.errors import NotFoundError, ValidationError


def _detail_options():
    return [
        selectinload(Route.route_stops).selectinload(RouteStop.stop),
        selectinload(Route.waypoints),
        selectinload(Route.schedule),
    ]


def validate_schedule(data: schemas.ScheduleInput) -> None:
    """Enforce fixed vs frequency schedule constraints."""
    if data.type == ScheduleType.fixed:
        if not data.departures or data.service_days is None:
            raise ValidationError(
                "fixed schedules require departures and service_days"
            )
    elif data.type == ScheduleType.frequency:
        if (
            data.headway_minutes is None
            or data.start_time is None
            or data.end_time is None
        ):
            raise ValidationError(
                "frequency schedules require headway_minutes, start_time, and end_time"
            )


def _to_route_detail(route: Route) -> schemas.RouteDetail:
    return schemas.RouteDetail(
        id=route.id,
        number=route.number,
        name=route.name,
        mode=route.mode,
        color=route.color,
        stops=[
            schemas.RouteStop(
                stop_id=rs.stop_id,
                sequence=rs.sequence,
                arrival_time=rs.arrival_time,
                departure_time=rs.departure_time,
                stop=schemas.Stop(
                    id=rs.stop.id,
                    name=rs.stop.name,
                    lat=rs.stop.lat,
                    lng=rs.stop.lng,
                ),
            )
            for rs in route.route_stops
        ],
        waypoints=[
            schemas.Waypoint(sequence=w.sequence, lat=w.lat, lng=w.lng)
            for w in route.waypoints
        ],
        schedule=(
            schemas.Schedule(
                type=route.schedule.type,
                service_days=route.schedule.service_days,
                departures=route.schedule.departures,
                headway_minutes=route.schedule.headway_minutes,
                start_time=route.schedule.start_time,
                end_time=route.schedule.end_time,
            )
            if route.schedule
            else None
        ),
    )


def _apply_details(db: Session, route: Route, data: schemas.RouteInput) -> None:
    # Explicitly delete existing children and flush so inserts that follow do
    # not collide with the old rows' unique constraints.
    for stop_link in list(route.route_stops):
        db.delete(stop_link)
    for waypoint in list(route.waypoints):
        db.delete(waypoint)
    if route.schedule is not None:
        db.delete(route.schedule)
    db.flush()

    for item in data.stops:
        stop = db.get(Stop, item.stop_id)
        if stop is None:
            raise NotFoundError(f"stop {item.stop_id}")
        route.route_stops.append(
            RouteStop(
                stop_id=item.stop_id,
                sequence=item.sequence,
                arrival_time=item.arrival_time,
                departure_time=item.departure_time,
            )
        )

    for w in data.waypoints:
        route.waypoints.append(
            Waypoint(sequence=w.sequence, lat=w.lat, lng=w.lng)
        )

    if data.schedule is not None:
        validate_schedule(data.schedule)
        route.schedule = Schedule(
            type=data.schedule.type,
            service_days=data.schedule.service_days,
            departures=data.schedule.departures,
            headway_minutes=data.schedule.headway_minutes,
            start_time=data.schedule.start_time,
            end_time=data.schedule.end_time,
        )


def list_routes(
    db: Session, mode: TransportMode | None = None
) -> list[schemas.RouteDetail]:
    stmt = select(Route).options(*_detail_options()).order_by(Route.number)
    if mode is not None:
        stmt = stmt.where(Route.mode == mode)
    routes = db.execute(stmt).scalars().all()
    return [_to_route_detail(r) for r in routes]


def get_route(db: Session, route_id: str) -> schemas.RouteDetail:
    route = db.get(Route, route_id, options=_detail_options())
    if route is None:
        raise NotFoundError(f"route {route_id}")
    return _to_route_detail(route)


def create_route(db: Session, data: schemas.RouteInput) -> schemas.RouteDetail:
    route = Route(
        number=data.number, name=data.name, mode=data.mode, color=data.color
    )
    _apply_details(db, route, data)
    db.add(route)
    db.commit()
    return get_route(db, route.id)


def update_route(
    db: Session, route_id: str, data: schemas.RouteInput
) -> schemas.RouteDetail:
    route = db.get(Route, route_id)
    if route is None:
        raise NotFoundError(f"route {route_id}")
    route.number = data.number
    route.name = data.name
    route.mode = data.mode
    route.color = data.color
    _apply_details(db, route, data)
    db.commit()
    return get_route(db, route_id)


def delete_route(db: Session, route_id: str) -> None:
    route = db.get(Route, route_id)
    if route is None:
        raise NotFoundError(f"route {route_id}")
    db.delete(route)
    db.commit()

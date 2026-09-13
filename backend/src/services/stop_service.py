"""Stop business logic: list, detail (with serving routes), create."""

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from src.api import schemas
from src.models.entities import RouteStop, Stop
from src.services.errors import NotFoundError


def list_stops(db: Session) -> list[schemas.Stop]:
    stops = db.execute(select(Stop).order_by(Stop.name)).scalars().all()
    return [schemas.Stop.model_validate(s) for s in stops]


def get_stop(db: Session, stop_id: str) -> schemas.StopDetail:
    stop = db.get(
        Stop,
        stop_id,
        options=[selectinload(Stop.route_stops).selectinload(RouteStop.route)],
    )
    if stop is None:
        raise NotFoundError(f"stop {stop_id}")

    routes = [
        schemas.Route(
            id=rs.route.id,
            number=rs.route.number,
            name=rs.route.name,
            mode=rs.route.mode,
            color=rs.route.color,
        )
        for rs in stop.route_stops
    ]
    return schemas.StopDetail(
        id=stop.id, name=stop.name, lat=stop.lat, lng=stop.lng, routes=routes
    )


def create_stop(db: Session, data: schemas.StopInput) -> schemas.Stop:
    stop = Stop(name=data.name, lat=data.lat, lng=data.lng)
    db.add(stop)
    db.commit()
    db.refresh(stop)
    return schemas.Stop.model_validate(stop)

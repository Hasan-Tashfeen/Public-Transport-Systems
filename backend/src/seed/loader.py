"""Idempotently load the bundled Karachi BRT dataset on first run."""

import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.config import is_seed_disabled
from src.models.entities import (
    Route,
    RouteStop,
    Schedule,
    ScheduleType,
    Stop,
    TransportMode,
)

_SEED_FILE = Path(__file__).with_name("karachi_brt.json")


def _load_data() -> dict:
    with _SEED_FILE.open(encoding="utf-8") as handle:
        return json.load(handle)


def seed_if_empty(db: Session) -> bool:
    """Populate the database from the bundled dataset if it has no routes.

    Returns True when seeding occurred and False when it was skipped (disabled or
    the database already contains routes).
    """
    if is_seed_disabled():
        return False
    if db.execute(select(Route.id).limit(1)).first() is not None:
        return False

    data = _load_data()
    for line in data.get("lines", []):
        stops = [
            Stop(
                name=item["name"],
                area=item.get("area"),
                lat=item["lat"],
                lng=item["lng"],
            )
            for item in line.get("stops", [])
        ]
        db.add_all(stops)
        db.flush()

        route = Route(
            number=line["number"],
            name=line.get("name"),
            mode=TransportMode(line["mode"]),
            color=line["color"],
        )
        for sequence, stop in enumerate(stops):
            route.route_stops.append(RouteStop(stop_id=stop.id, sequence=sequence))

        schedule = line.get("schedule")
        if schedule:
            route.schedule = Schedule(
                type=ScheduleType(schedule["type"]),
                service_days=schedule.get("service_days"),
                departures=schedule.get("departures"),
                headway_minutes=schedule.get("headway_minutes"),
                start_time=schedule.get("start_time"),
                end_time=schedule.get("end_time"),
            )
        db.add(route)

    db.commit()
    return True

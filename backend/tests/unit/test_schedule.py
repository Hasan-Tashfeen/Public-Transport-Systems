"""Unit tests for schedule validation rules."""

import pytest

from src.api import schemas
from src.models.entities import ScheduleType
from src.services.errors import ValidationError
from src.services.route_service import validate_schedule


def test_fixed_schedule_requires_departures_and_days():
    with pytest.raises(ValidationError):
        validate_schedule(schemas.ScheduleInput(type=ScheduleType.fixed))


def test_fixed_schedule_valid():
    validate_schedule(
        schemas.ScheduleInput(
            type=ScheduleType.fixed,
            service_days=[0, 1, 2],
            departures=["08:00", "09:00"],
        )
    )


def test_frequency_schedule_requires_headway_and_hours():
    with pytest.raises(ValidationError):
        validate_schedule(schemas.ScheduleInput(type=ScheduleType.frequency))


def test_frequency_schedule_valid():
    validate_schedule(
        schemas.ScheduleInput(
            type=ScheduleType.frequency,
            headway_minutes=10,
            start_time="06:00",
            end_time="23:00",
        )
    )

"""Pydantic schemas mirroring `contracts/openapi.yaml`."""

from pydantic import BaseModel, ConfigDict, Field

from src.models.entities import ScheduleType, TransportMode


class RouteBase(BaseModel):
    number: str
    name: str | None = None
    mode: TransportMode
    color: str


class StopInput(BaseModel):
    name: str
    lat: float
    lng: float


class Stop(StopInput):
    model_config = ConfigDict(from_attributes=True)
    id: str


class RouteStopInput(BaseModel):
    stop_id: str
    sequence: int
    arrival_time: str | None = None
    departure_time: str | None = None


class RouteStop(RouteStopInput):
    model_config = ConfigDict(from_attributes=True)
    stop: Stop


class WaypointInput(BaseModel):
    sequence: int
    lat: float
    lng: float


class Waypoint(WaypointInput):
    model_config = ConfigDict(from_attributes=True)


class ScheduleInput(BaseModel):
    type: ScheduleType
    service_days: list[int] | None = None
    departures: list[str] | None = None
    headway_minutes: int | None = None
    start_time: str | None = None
    end_time: str | None = None


class Schedule(ScheduleInput):
    model_config = ConfigDict(from_attributes=True)


class Route(RouteBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class RouteInput(RouteBase):
    stops: list[RouteStopInput] = Field(default_factory=list)
    waypoints: list[WaypointInput] = Field(default_factory=list)
    schedule: ScheduleInput | None = None


class RouteDetail(Route):
    stops: list[RouteStop] = Field(default_factory=list)
    waypoints: list[Waypoint] = Field(default_factory=list)
    schedule: Schedule | None = None


class StopDetail(Stop):
    routes: list[Route] = Field(default_factory=list)


class SearchResults(BaseModel):
    routes: list[Route] = Field(default_factory=list)
    stops: list[Stop] = Field(default_factory=list)

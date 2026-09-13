"""SQLAlchemy entities for the transport route map.

Entities mirror the data model in `specs/001-public-transport-routes/data-model.md`.
"""

import uuid
from datetime import datetime
from enum import StrEnum

from sqlalchemy import (
    JSON,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base


class TransportMode(StrEnum):
    bus = "bus"
    tram = "tram"
    metro = "metro"
    rail = "rail"


class ScheduleType(StrEnum):
    fixed = "fixed"
    frequency = "frequency"


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    number: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    mode: Mapped[TransportMode] = mapped_column(
        SAEnum(TransportMode, native_enum=False, length=20), nullable=False
    )
    color: Mapped[str] = mapped_column(String(9), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    route_stops: Mapped[list["RouteStop"]] = relationship(
        back_populates="route",
        cascade="all, delete-orphan",
        order_by="RouteStop.sequence",
    )
    waypoints: Mapped[list["Waypoint"]] = relationship(
        back_populates="route",
        cascade="all, delete-orphan",
        order_by="Waypoint.sequence",
    )
    schedule: Mapped["Schedule | None"] = relationship(
        back_populates="route", cascade="all, delete-orphan", uselist=False
    )


class Stop(Base):
    __tablename__ = "stops"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    route_stops: Mapped[list["RouteStop"]] = relationship(
        back_populates="stop", cascade="all, delete-orphan"
    )


class RouteStop(Base):
    __tablename__ = "route_stops"
    __table_args__ = (
        UniqueConstraint("route_id", "stop_id", name="uq_route_stop"),
        UniqueConstraint("route_id", "sequence", name="uq_route_sequence"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    route_id: Mapped[str] = mapped_column(
        ForeignKey("routes.id"), nullable=False
    )
    stop_id: Mapped[str] = mapped_column(ForeignKey("stops.id"), nullable=False)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    arrival_time: Mapped[str | None] = mapped_column(String(5), nullable=True)
    departure_time: Mapped[str | None] = mapped_column(String(5), nullable=True)

    route: Mapped["Route"] = relationship(back_populates="route_stops")
    stop: Mapped["Stop"] = relationship(back_populates="route_stops")


class Waypoint(Base):
    __tablename__ = "waypoints"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    route_id: Mapped[str] = mapped_column(
        ForeignKey("routes.id"), nullable=False
    )
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)

    route: Mapped["Route"] = relationship(back_populates="waypoints")


class Schedule(Base):
    __tablename__ = "schedules"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    route_id: Mapped[str] = mapped_column(
        ForeignKey("routes.id"), nullable=False, unique=True
    )
    type: Mapped[ScheduleType] = mapped_column(
        SAEnum(ScheduleType, native_enum=False, length=20), nullable=False
    )
    service_days: Mapped[list[int] | None] = mapped_column(JSON, nullable=True)
    departures: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    headway_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    start_time: Mapped[str | None] = mapped_column(String(5), nullable=True)
    end_time: Mapped[str | None] = mapped_column(String(5), nullable=True)

    route: Mapped["Route"] = relationship(back_populates="schedule")

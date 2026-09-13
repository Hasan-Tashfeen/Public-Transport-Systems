"""Database engine, session factory, and dependency wiring."""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.config import get_database_url
from src.models.base import Base

engine = None
SessionLocal = None


def init_db(url: str | None = None) -> None:
    """Build the engine, session factory, and create all tables.

    `url` is optional and used by tests to point at an in-memory or temporary
    database instead of the configured default.
    """
    global engine, SessionLocal
    database_url = url or get_database_url()

    connect_args: dict = {}
    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False

    if database_url.startswith("sqlite:///") and not database_url.startswith(
        "sqlite:///:memory:"
    ):
        # Ensure the directory for a file-based SQLite DB exists.
        db_path = database_url.removeprefix("sqlite:///")
        directory = os.path.dirname(db_path)
        if directory:
            os.makedirs(directory, exist_ok=True)

    engine = create_engine(database_url, connect_args=connect_args)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    from src import models  # noqa: F401  (registers all tables)

    Base.metadata.create_all(engine)


def get_db():
    """FastAPI dependency yielding a database session."""
    if SessionLocal is None:
        raise RuntimeError("Database not initialized; call init_db() first")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

"""Shared pytest fixtures: an isolated in-memory database and API client."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src import models  # noqa: F401  (register tables)
from src.db import get_db
from src.main import app
from src.models.base import Base

PLANNER_TOKEN = "test-token"


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture()
def client(db_session, monkeypatch):
    monkeypatch.setenv("PLANNER_TOKEN", PLANNER_TOKEN)

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers():
    return {"Authorization": f"Bearer {PLANNER_TOKEN}"}


@pytest.fixture()
def create_stop(client, auth_headers):
    def _create(name="Central Station", lat=0.0, lng=0.0):
        response = client.post(
            "/stops",
            json={"name": name, "lat": lat, "lng": lng},
            headers=auth_headers,
        )
        assert response.status_code == 201
        return response.json()

    return _create

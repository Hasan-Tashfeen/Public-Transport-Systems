"""Unit tests for the Karachi BRT seed loader."""

from sqlalchemy import select

from src.models.entities import Route, TransportMode
from src.seed.loader import seed_if_empty


def test_seed_loads_brt_lines_once(db_session, monkeypatch):
    monkeypatch.delenv("SEED_DISABLED", raising=False)

    assert seed_if_empty(db_session) is True
    routes = db_session.execute(select(Route)).scalars().all()
    assert len(routes) == 2
    assert all(route.mode is TransportMode.brt for route in routes)

    for route in routes:
        sequences = [link.sequence for link in route.route_stops]
        assert sequences == list(range(len(sequences)))

    # A second run is a no-op because routes already exist.
    assert seed_if_empty(db_session) is False


def test_seed_disabled(db_session, monkeypatch):
    monkeypatch.setenv("SEED_DISABLED", "1")
    assert seed_if_empty(db_session) is False

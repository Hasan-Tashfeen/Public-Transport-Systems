"""Unit tests for the Karachi place service."""

from src.services import place_service


def _feature(name, lat, lng, **props):
    return {
        "geometry": {"type": "Point", "coordinates": [lng, lat]},
        "properties": {"name": name, **props},
    }


class _Response:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


def test_short_query_returns_empty():
    assert place_service.search("s") == []


def test_search_filters_out_of_bbox(monkeypatch):
    outside = _feature("Lahore Fort", 31.58, 74.30, city="Lahore")
    inside = _feature("Sea View", 24.80, 67.03, city="Karachi")
    monkeypatch.setattr(
        place_service.httpx,
        "get",
        lambda *args, **kwargs: _Response({"features": [outside, inside]}),
    )
    place_service._cache.clear()
    results = place_service.search("sea", limit=5)
    assert [r.name for r in results] == ["Sea View"]


def test_search_returns_empty_on_upstream_error(monkeypatch):
    def boom(*args, **kwargs):
        raise place_service.httpx.ConnectError("down")

    monkeypatch.setattr(place_service.httpx, "get", boom)
    place_service._cache.clear()
    assert place_service.search("seaview") == []


def test_search_uses_cache(monkeypatch):
    calls = {"count": 0}
    inside = _feature("Sea View", 24.80, 67.03, city="Karachi")

    def fake_get(*args, **kwargs):
        calls["count"] += 1
        return _Response({"features": [inside]})

    monkeypatch.setattr(place_service.httpx, "get", fake_get)
    place_service._cache.clear()
    place_service.search("cache test")
    place_service.search("cache test")
    assert calls["count"] == 1

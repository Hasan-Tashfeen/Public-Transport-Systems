"""Contract tests for the place suggestion endpoint."""

from src.api import schemas
from src.services import place_service


def test_places_suggests_matching_karachi_places(client, monkeypatch):
    monkeypatch.setattr(
        place_service,
        "_fetch",
        lambda q, limit: [
            schemas.PlaceSuggestion(
                name="Sea View", area="Clifton, Karachi", lat=24.80, lng=67.03
            )
        ],
    )
    response = client.get("/places", params={"q": "sea view"})
    assert response.status_code == 200
    body = response.json()
    assert body[0]["name"] == "Sea View"
    assert body[0]["area"] == "Clifton, Karachi"


def test_places_empty_result_is_ok(client, monkeypatch):
    monkeypatch.setattr(place_service, "_fetch", lambda q, limit: [])
    response = client.get("/places", params={"q": "zzzz"})
    assert response.status_code == 200
    assert response.json() == []


def test_places_requires_min_two_chars(client):
    response = client.get("/places", params={"q": "s"})
    assert response.status_code == 422

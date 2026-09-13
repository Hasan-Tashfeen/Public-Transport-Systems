"""Contract tests for stop endpoints."""


def test_list_stops(client, auth_headers):
    client.post(
        "/stops",
        json={"name": "Central", "lat": 0.0, "lng": 0.0},
        headers=auth_headers,
    )
    response = client.get("/stops")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Central"


def test_create_stop_requires_auth(client):
    response = client.post("/stops", json={"name": "X", "lat": 0.0, "lng": 0.0})
    assert response.status_code == 401


def test_get_stop_with_routes(client, auth_headers, create_stop):
    stop = create_stop("Hub", 1.0, 1.0)
    other = create_stop("North", 2.0, 2.0)
    client.post(
        "/routes",
        json={
            "number": "7",
            "mode": "bus",
            "color": "#ff0000",
            "stops": [
                {"stop_id": stop["id"], "sequence": 0},
                {"stop_id": other["id"], "sequence": 1},
            ],
        },
        headers=auth_headers,
    )

    response = client.get(f"/stops/{stop['id']}")
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Hub"
    assert len(body["routes"]) == 1
    assert body["routes"][0]["mode"] == "bus"


def test_get_stop_not_found(client):
    assert client.get("/stops/nope").status_code == 404

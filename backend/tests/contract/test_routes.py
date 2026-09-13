"""Contract tests for route endpoints."""


def _route_payload(stop_ids, mode="bus", schedule=None):
    return {
        "number": "7",
        "name": "Airport Express",
        "mode": mode,
        "color": "#ff0000",
        "stops": [
            {"stop_id": stop_ids[0], "sequence": 0},
            {"stop_id": stop_ids[1], "sequence": 1},
        ],
        "waypoints": [{"sequence": 0, "lat": 0.0, "lng": 0.0}],
        "schedule": schedule,
    }


def test_list_routes_empty(client):
    response = client.get("/routes")
    assert response.status_code == 200
    assert response.json() == []


def test_list_routes_with_mode_filter(client, auth_headers, create_stop):
    stop_a = create_stop("A", 0.0, 0.0)
    stop_b = create_stop("B", 1.0, 1.0)
    stop_c = create_stop("C", 2.0, 2.0)

    client.post(
        "/routes",
        json=_route_payload([stop_a["id"], stop_b["id"]], mode="bus"),
        headers=auth_headers,
    )
    client.post(
        "/routes",
        json=_route_payload(
            [stop_a["id"], stop_c["id"]], mode="minibus", schedule=None
        ),
        headers=auth_headers,
    )

    bus_only = client.get("/routes", params={"mode": "bus"})
    assert bus_only.status_code == 200
    assert len(bus_only.json()) == 1
    assert bus_only.json()[0]["mode"] == "bus"

    all_routes = client.get("/routes")
    assert len(all_routes.json()) == 2


def test_create_route_requires_auth(client, create_stop):
    stop = create_stop()
    response = client.post(
        "/routes",
        json=_route_payload([stop["id"], stop["id"]], mode="bus"),
    )
    assert response.status_code == 401


def test_create_route(client, auth_headers, create_stop):
    stop_a = create_stop("A", 0.0, 0.0)
    stop_b = create_stop("B", 1.0, 1.0)

    response = client.post(
        "/routes",
        json=_route_payload([stop_a["id"], stop_b["id"]], mode="bus"),
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["mode"] == "bus"
    assert len(body["stops"]) == 2
    assert body["stops"][0]["stop"]["name"] == "A"


def test_create_route_with_unknown_stop(client, auth_headers):
    response = client.post(
        "/routes",
        json=_route_payload(["missing", "missing"], mode="bus"),
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_get_route(client, auth_headers, create_stop):
    stop_a = create_stop("Terminal", 0.0, 0.0)
    stop_b = create_stop("Depot", 1.0, 1.0)
    created = client.post(
        "/routes",
        json=_route_payload([stop_a["id"], stop_b["id"]], mode="brt"),
        headers=auth_headers,
    ).json()

    response = client.get(f"/routes/{created['id']}")
    assert response.status_code == 200
    assert response.json()["number"] == "7"


def test_get_route_not_found(client):
    response = client.get("/routes/nope")
    assert response.status_code == 404


def test_update_route(client, auth_headers, create_stop):
    stop_a = create_stop("A", 0.0, 0.0)
    stop_b = create_stop("B", 1.0, 1.0)
    created = client.post(
        "/routes",
        json=_route_payload([stop_a["id"], stop_b["id"]], mode="bus"),
        headers=auth_headers,
    ).json()

    payload = _route_payload([stop_a["id"], stop_b["id"]], mode="minibus")
    payload["number"] = "7R"
    response = client.patch(
        f"/routes/{created['id']}", json=payload, headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["mode"] == "minibus"
    assert response.json()["number"] == "7R"


def test_delete_route(client, auth_headers, create_stop):
    stop_a = create_stop("A", 0.0, 0.0)
    stop_b = create_stop("B", 1.0, 1.0)
    created = client.post(
        "/routes",
        json=_route_payload([stop_a["id"], stop_b["id"]], mode="bus"),
        headers=auth_headers,
    ).json()

    response = client.delete(f"/routes/{created['id']}", headers=auth_headers)
    assert response.status_code == 204
    assert client.get(f"/routes/{created['id']}").status_code == 404

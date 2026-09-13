"""Contract tests for the search endpoint."""


def test_search_routes_and_stops(client, auth_headers, create_stop):
    stop = create_stop("Riverside", 0.0, 0.0)
    client.post(
        "/routes",
        json={
            "number": "22",
            "name": "Riverside Loop",
            "mode": "bus",
            "color": "#00ff00",
            "stops": [{"stop_id": stop["id"], "sequence": 0}],
        },
        headers=auth_headers,
    )

    response = client.get("/search", params={"q": "river"})
    assert response.status_code == 200
    body = response.json()
    assert any(r["name"] == "Riverside Loop" for r in body["routes"])
    assert any(s["name"] == "Riverside" for s in body["stops"])


def test_search_no_matches(client):
    response = client.get("/search", params={"q": "zzz"})
    assert response.status_code == 200
    assert response.json() == {"routes": [], "stops": []}

# Quickstart: Karachi Transit Map

Phase 1 output for `/sp.plan`. End-to-end validation that the feature works after
implementation.

## Prerequisites

- Python 3.11+ and Node 18+ (Node 20 recommended)
- Network access to OpenStreetMap tiles and the Photon geocoder
- No API keys required

## 1. Backend

```powershell
# from backend/
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn src.main:app --reload          # http://localhost:8000, /docs
```

On first boot the app creates the SQLite database and, if it has no routes, loads the
Karachi Breeze **Green** and **Orange** line seed data (`seed_if_empty()`).

Environment (all optional; safe dev defaults):

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `sqlite:///./data/app.db` | Database (set to Postgres in prod) |
| `PLANNER_TOKEN` | `dev-token` | Bearer token for editing endpoints |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed browser origins |
| `GEOCODER_URL` | `https://photon.komoot.io` | OSM geocoder base URL |
| `KARACHI_BBOX` | `66.75,24.70,67.45,25.20` | `minLon,minLat,maxLon,maxLat` filter |
| `GEOCODER_USER_AGENT` | app identifier | Polite User-Agent sent upstream |

Verify:

```powershell
pytest -q
ruff format --check .; ruff check .; mypy src
```

Quick API smoke test:

```powershell
curl "http://localhost:8000/health"
curl "http://localhost:8000/routes"                    # seeded BRT routes
curl "http://localhost:8000/places?q=sea%20view&limit=5"   # Karachi places
```

## 2. Frontend

```powershell
# from frontend/
npm.cmd install
npm.cmd run dev                        # Vite :5173, proxies /api -> :8000
```

Checks:

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run format:check
npm.cmd run typecheck
```

## 3. Validate the feature

1. Open `http://localhost:5173`. The map opens centered on Karachi and shows the
   seeded BRT routes, color-coded by mode.
2. Use the mode filter (BRT / bus / minibus) and confirm only matching routes remain.
3. As a planner (`VITE_PLANNER_TOKEN=dev-token`), open the route editor and start
   typing `sea view`. Confirm real Karachi places appear beneath the field; select one
   and confirm a stop is created at those coordinates.
4. Save a route with at least five stops, confirm it appears in the rider view with
   stops in order, then edit and delete it.
5. Open a route and a stop to confirm ordered stops, terminals, serving routes, and the
   schedule (fixed vs frequency) render correctly.
6. Search for a route number and a stop name and confirm results are selectable.
7. Resize to a mobile width and confirm there is no horizontal scrolling.

## Design reference

UI work MUST follow `design-system/karachi-transit/pages/map.md`, which overrides
`design-system/karachi-transit/MASTER.md` with the MTA-inspired wayfinding direction.

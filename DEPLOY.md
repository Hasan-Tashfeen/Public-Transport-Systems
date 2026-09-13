# Deployment Guide

Production topology for feature `001-public-transport-routes`:

| Tier | Host | Config |
|------|------|--------|
| Frontend (React + Vite) | Vercel | `frontend/vercel.json` |
| Backend (FastAPI) | Render | `backend/render.yaml` |
| Database | Supabase (Postgres) | env var only |

SQLite is the local default; Postgres is used only when `DATABASE_URL` is set.
Tables are created automatically on first boot by `init_db()` (`create_all`) — no
manual migration step is required for the pilot.

## 1. Supabase (database)

1. Create a project at <https://supabase.com>.
2. Go to **Project Settings → Database** and copy the **Session pooler**
   connection string (port `5432`), e.g.:
   `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`
3. Append `?sslmode=require` if it is not already present.

## 2. Render (backend)

1. Push this repo to GitHub (already done; see `git remote -v`).
2. In Render, **New → Blueprint** and select the repository. It reads
   `backend/render.yaml` (web service, Python, `uvicorn src.main:app`).
3. Set these environment variables on the service:
   - `DATABASE_URL` → the Supabase string from step 1.
   - `CORS_ORIGINS` → `https://<your-app>.vercel.app` (the deployed frontend URL).
   - `PLANNER_TOKEN` → a random secret (e.g. `openssl rand -hex 24`).
4. Deploy. Note the resulting backend URL (e.g.
   `https://transport-routes-backend.onrender.com`).

## 3. Vercel (frontend)

1. In Vercel, **Add New → Project** and import the repository.
2. Set **Root Directory** to `frontend` (Vercel then uses `frontend/vercel.json`
   for the Vite build and the SPA rewrite).
3. Add environment variables (inlined at build time):
   - `VITE_API_BASE` → the Render backend URL from step 2.
   - `VITE_PLANNER_TOKEN` → the same value as `PLANNER_TOKEN` on Render.
4. Deploy and open the `*.vercel.app` URL.

## Environment reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | Render | Postgres connection string (Supabase) |
| `CORS_ORIGINS` | Render | Allowed browser origins (comma-separated) |
| `PLANNER_TOKEN` | Render | Bearer token required by editing endpoints |
| `VITE_API_BASE` | Vercel | Backend base URL (default `/api`) |
| `VITE_PLANNER_TOKEN` | Vercel | Editor auth token sent to the backend |
| `GEOCODER_URL` | Render | OpenStreetMap geocoder for Karachi place suggestions |
| `GEOCODER_USER_AGENT` | Render | Polite User-Agent sent to the geocoder |
| `KARACHI_BBOX` | Render | `min_lon,min_lat,max_lon,max_lat` search area |
| `KARACHI_CENTER` | Render | Default map center `lat,lng` |
| `SEED_DISABLED` | Render | Set `1` to skip loading the bundled BRT seed data |

## Map data & attribution

The map uses OpenStreetMap raster tiles and an OpenStreetMap-based geocoder
(Photon by default). Keep the visible OpenStreetMap attribution on the map. The
public Photon demo server is rate-limited; if usage grows, set `GEOCODER_URL` to a
self-hosted Photon instance. Place search is restricted to `KARACHI_BBOX`.

## Caveats

- **Auth is pilot-grade, not production security.** `VITE_PLANNER_TOKEN` is
  bundled into the frontend bundle, so anyone can read it and call editing
  endpoints. Replace with real auth before any public launch.
- The default branch is `001-public-transport-routes`; if Vercel or Render
  defaults to `main`, set the deploy branch in their dashboards.

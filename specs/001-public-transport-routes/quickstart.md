# Quickstart: City Public Transport Route Map

How to run the backend API and frontend app locally for development.

## Prerequisites

- Python 3.11+
- Node.js 20+
- (optional) a package manager: pip/uv and npm

## Backend (FastAPI)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
alembic upgrade head
uvicorn src.main:app --reload
```

- API base: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Database: `backend/data/app.db` (SQLite, auto-created on first run)

Run tests and checks:

```powershell
pytest
ruff check .
mypy src
```

## Frontend (React + Vite)

```powershell
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173
- Vite proxies `/api` to the backend; point `VITE_API_BASE` at the backend URL
  if it is not on `localhost:8000`.

Run tests and checks:

```powershell
npm run test
npm run lint
npm run typecheck
```

## Environment configuration

Copy the sample env files and fill in values (no secrets are committed):

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

- `backend/.env`: `DATABASE_URL`, `CORS_ORIGINS`, `PLANNER_TOKEN` (dev auth)
- `frontend/.env`: `VITE_API_BASE`

## Planner authorization (dev)

Editing endpoints require a bearer token. In dev, set `PLANNER_TOKEN` and send:

```http
Authorization: Bearer <PLANNER_TOKEN>
```

## End-to-end sanity check

1. Start the backend, then create a route and two stops via `/docs` or curl.
2. Open the frontend; confirm the route renders on the map, color-coded by mode.
3. Edit the route in the editor, save, and confirm the change persists after reload.

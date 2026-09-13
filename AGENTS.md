# AGENTS.md

This repo is a **Spec-Driven Development (SDD)** workspace (SpecKit Plus). Its first feature, `001-public-transport-routes`, is a real two-tier web app: the work product is both the SDD artifacts (`specs/`, `history/`, `.specify/`) *and* the application code (`backend/`, `frontend/`).

## Authoritative rules

- `opencode.md` is the full agent protocol (PHR creation, ADR suggestions, execution contract, architect guidelines). Read it before doing SDD work; it overrides this file.
- `.specify/memory/constitution.md` (v1.0.0) is the ratified constitution; its six principles (clean/modular, separation of concerns, self-documenting, testing discipline, YAGNI, idiomatic style) govern all code.

## Repository layout

- `backend/` — FastAPI (Python 3.11) REST API. Layered: `src/models` (SQLAlchemy entities), `src/services` (business logic; raises `services/errors.py` `NotFoundError`/`ValidationError`), `src/api` (routers + Pydantic schemas), `src/db.py` (engine/session + `get_db` dependency), `src/config.py` (env config), `src/main.py` (app factory).
- `frontend/` — React 18 + TypeScript + Vite + Leaflet. `src/pages`, `src/components`, `src/services` (`api.ts` mirrors the REST contract), `src/types`.
- `specs/<NNN-name>/` — per-feature `spec.md`, `plan.md`, `tasks.md`, `contracts/openapi.yaml`, `data-model.md`, `quickstart.md`.
- `history/prompts/` + `history/adr/` — PHRs and ADRs. `.specify/` — templates + PowerShell scripts. `.opencode/command/` — slash commands. `DEPLOY.md` — production topology.

## Developer commands

Backend (run from `backend/`; package is a `src`-layout, imports are `src.*`):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn src.main:app --reload          # http://localhost:8000, /docs
```

Backend checks (must run from `backend/`, not repo root — pytest `pythonpath=["."]`):

```powershell
pytest                                            # testpaths=tests (contract/ + unit/)
pytest tests/contract/test_routes.py -k <name>    # single test
ruff format --check .
ruff check .
mypy src
```

Frontend (run from `frontend/`):

```powershell
npm.cmd install
npm.cmd run dev                         # Vite :5173, proxies /api -> :8000
```

Frontend checks (`npm.cmd`, not `npm` — see Gotchas):

```powershell
npm.cmd run test                        # vitest run (jsdom)
npm.cmd run test -- tests/MapView.test.tsx   # single file
npm.cmd run lint                        # eslint src
npm.cmd run format:check                # prettier --check .
npm.cmd run typecheck                   # tsc --noEmit
npm.cmd run build                       # typecheck + vite build
```

`.github/workflows/ci.yml` runs the full sequence above (lint, format, types, tests) for both tiers on every push and PR.

## Gotchas

- **`npm` fails in this PowerShell** (execution policy blocks `npm.ps1`). Use `npm.cmd run <script>`.
- **Auth**: editing endpoints (`POST/PATCH/DELETE`) require `Authorization: Bearer <PLANNER_TOKEN>`; reads are open. Dev default `dev-token`; tests use `test-token` via `monkeypatch` in `backend/tests/conftest.py`. `require_planner` reads the token per request, so env changes take effect immediately.
- **Backend routes have no `/api` prefix**: `/routes`, `/stops`, `/search`, `/places`, `/health`. The frontend calls `/api/...`; the Vite dev proxy strips `/api`, and prod `VITE_API_BASE` points at the backend origin with no `/api`.
- **Backend does not auto-load `.env`** (no `load_dotenv`; `src/config.py` reads real env vars). Export vars or start with `uvicorn --env-file .env`. `backend/.env.example` defaults to local SQLite (Postgres `DATABASE_URL` is commented) and documents the Karachi/geocoder vars.
- **Database**: local default is SQLite at `backend/data/app.db`, auto-created by `init_db()` (`Base.metadata.create_all`) at startup. Postgres is used only when `DATABASE_URL` is set. `alembic upgrade head` exists but is optional for dev.
- **REST contract is duplicated in three places** — keep in sync: `specs/001-public-transport-routes/contracts/openapi.yaml`, `backend/src/api/schemas.py`, `frontend/src/types/api.ts`.
- **Frontend env**: Vite auto-loads `frontend/.env`. `VITE_API_BASE` defaults to `/api`; `VITE_PLANNER_TOKEN` is bundled into the build (pilot-grade auth only, see `DEPLOY.md`).
- Backend uses `StrEnum` and `X | None` syntax → requires Python 3.11+.

## Deployment

`DEPLOY.md` documents the full flow: Vercel frontend (`frontend/vercel.json`), Render backend (`backend/render.yaml`), Supabase Postgres (`DATABASE_URL`). The default deploy branch is `001-public-transport-routes`, not `main`.

## SDD workflow (slash commands in `.opencode/command/sp.*.md`)

Run in order; read each command's `.md` before executing.

1. `/sp.constitution` → `.specify/memory/constitution.md` (filled, v1.0.0)
2. `/sp.specify` → feature branch + `specs/<NNN-name>/spec.md`
3. `/sp.clarify` → resolves spec ambiguities (max 5 questions)
4. `/sp.plan` → `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
5. `/sp.tasks` → `tasks.md`
6. `/sp.analyze`, `/sp.checklist` — optional gates
7. `/sp.implement` → executes `tasks.md`
8. `/sp.adr` → `history/adr/`; `/sp.git.commit_pr` → commit + PR

Also: `/sp.phr`, `/sp.reverse-engineer`, `/sp.taskstoissues`.

## Feature / branch convention

- Feature branches are named `NNN-short-name` (e.g. `001-public-transport-routes`); scripts exit on error otherwise. Current branch: `001-public-transport-routes`.
- Active feature dir is resolved from the current branch name, or the `SPECIFY_FEATURE` env var (non-git fallback). Helpers: `.specify/scripts/powershell/common.ps1`.

## Scripts are PowerShell; PHR has no script

- All scripts live under `.specify/scripts/powershell/`:
  - `check-prerequisites.ps1` — `-Json`, `-RequireTasks -IncludeTasks`, `-PathsOnly`
  - `create-new-feature.ps1 -Json "<description>" [-Number N] [-ShortName name]`
  - `setup-plan.ps1 -Json`
  - `update-agent-context.ps1 [-AgentType opencode]`
- **Gotcha:** command files reference `.specify/scripts/bash/create-phr.sh`, which does **not** exist. Create PHRs agent-natively: read `.specify/templates/phr-template.prompt.md`, fill all `{{PLACEHOLDERS}}`, and write the file with the `write` tool.

## PHR is mandatory after every request

- Record a Prompt History Record under `history/prompts/` after every user request, routed by stage:
  - `constitution` → `history/prompts/constitution/`
  - feature stages (`spec`, `plan`, `tasks`, `red`, `green`, `refactor`, `explainer`, `misc`) → `history/prompts/<feature-name>/`
  - `general` → `history/prompts/general/`
- Filename: `<ID>-<slug>.<stage>.prompt.md` (e.g. `0001-public-transport-route-map-spec.spec.prompt.md`). Preserve the full prompt verbatim in `PROMPT_TEXT`. Skip PHR only for `/sp.phr` itself.

## AGENTS.md is auto-managed

`/sp.plan` runs `update-agent-context.ps1 -AgentType opencode`, which injects tech entries under the `## Active Technologies` and `## Recent Changes` headings below (and updates the `**Last updated**` date) from `plan.md` fields; all other content is preserved verbatim. Keep those headings if you want the script to inject.

## Active Technologies
- Python 3.11 (backend), TypeScript 5.5 (frontend) + FastAPI, SQLAlchemy 2.x, Pydantic v2, Uvicorn, httpx (geocoder client); React 18, Vite 5, Leaflet, react-leaflet, react-router-dom (002-karachi-transit-map)
- SQLite (dev) / PostgreSQL (prod) via SQLAlchemy; bundled JSON seed dataset (002-karachi-transit-map)

## Recent Changes

- 002-karachi-transit-map: Karachi OSM map, BRT/bus/minibus modes, bundled BRT seed data, Photon place autocomplete (`GET /places`), MTA-style UI.

**Last updated**: 2026-09-13

## Git / repo state

- `origin` is `https://github.com/Hasan-Tashfeen/Public-Transport-Systems.git`; `001-public-transport-routes` is pushed. Current branch is `002-karachi-transit-map` (not yet pushed).
- `.venv/` and `frontend/node_modules/` are present locally but gitignored.
- `.opencode/` holds the command plugin machinery (`@opencode-ai/plugin` dep); do not edit `node_modules/`.

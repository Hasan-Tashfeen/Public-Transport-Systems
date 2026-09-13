# AGENTS.md

This repo is a **Spec-Driven Development (SDD) workflow** (SpecKit Plus) whose first feature, `001-public-transport-routes`, is implemented as a real two-tier web app. The work product is both the SDD artifacts (`specs/`, `history/`, `.specify/`) *and* the application code (`backend/`, `frontend/`).

## Authoritative rules

- `opencode.md` is the full agent protocol (PHR creation, ADR suggestions, execution contract, architect guidelines). Read it before doing SDD work; it is the source of truth over this file.
- `.specify/memory/constitution.md` (v1.0.0) is the ratified project constitution; its six principles (clean/modular, separation of concerns, self-documenting, testing discipline, YAGNI, idiomatic style) govern all code.

## Repository layout

- `backend/` — FastAPI (Python 3.11) REST API. Layered: `src/models` (SQLAlchemy entities), `src/services` (business logic; raises `services/errors.py` `NotFoundError`/`ValidationError`), `src/api` (routers + Pydantic schemas), `src/db.py` (engine/session + `get_db` dependency), `src/main.py` (app factory).
- `frontend/` — React 18 + TypeScript + Vite + Leaflet. `src/pages`, `src/components`, `src/services` (`api.ts` mirrors the REST contract), `src/types`.
- `specs/<NNN-name>/` — per-feature `spec.md`, `plan.md`, `tasks.md`, `contracts/`, etc.
- `history/prompts/` and `history/adr/` — Prompt History Records and ADRs.
- `.specify/` — templates and PowerShell scripts. `.opencode/command/` — slash commands.

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
pytest                                  # testpaths=tests
pytest tests/contract/test_routes.py -k <name>   # single test
ruff check .
mypy src
```

Frontend (run from `frontend/`):

```powershell
npm install
npm run dev                             # Vite :5173, proxies /api -> :8000
```

Frontend checks:

```powershell
npm run test        # vitest run (jsdom)
npm run lint        # eslint src
npm run typecheck   # tsc --noEmit
npm run build       # typecheck + vite build
```

## Gotchas

- **Auth**: editing endpoints (`POST/PATCH/DELETE`) require `Authorization: Bearer <PLANNER_TOKEN>` (dev default `dev-token`; tests use `test-token` via monkeypatch in `tests/conftest.py`).
- **Database**: SQLite at `backend/data/app.db`, auto-created by `init_db()` (`Base.metadata.create_all`) on app startup — no migration required for dev. `alembic upgrade head` exists but is optional.
- **Env**: `.env` files are gitignored; copy `backend/.env.example` / `frontend/.env.example`. No secrets committed.
- **Frontend**: `VITE_API_BASE` defaults to `/api`; Vite strips the `/api` prefix when proxying to `localhost:8000`. `VITE_PLANNER_TOKEN` sets the editor auth token.
- Backend uses `StrEnum` and `X | None` syntax → requires Python 3.11+.

## SDD workflow (slash commands in `.opencode/command/sp.*.md`)

Run in order; read each command's `.md` before executing.

1. `/sp.constitution` → `.specify/memory/constitution.md` (now filled, v1.0.0)
2. `/sp.specify` → feature branch + `specs/<NNN-name>/spec.md`
3. `/sp.clarify` → resolves spec ambiguities (max 5 questions)
4. `/sp.plan` → `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
5. `/sp.tasks` → `tasks.md`
6. `/sp.analyze`, `/sp.checklist` — optional gates
7. `/sp.implement` → executes `tasks.md`
8. `/sp.adr` → `history/adr/`; `/sp.git.commit_pr` → commit + PR

Also: `/sp.phr`, `/sp.reverse-engineer`, `/sp.taskstoissues`.

## Feature / branch convention

- Feature branches are named `NNN-short-name` (e.g. `001-public-transport-routes`); scripts exit on error otherwise.
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

`/sp.plan` runs `update-agent-context.ps1 -AgentType opencode`, which appends tech entries under `## Active Technologies` and `## Recent Changes` (and updates a `**Last updated**` line) from `plan.md` fields; all other content is preserved verbatim. Keep the two headings if you want the script to inject.

## Other notes

- Git repo has **zero commits**; currently on branch `001-public-transport-routes` with everything staged/untracked.
- `.opencode/` holds the command plugin machinery (`@opencode-ai/plugin` dep); don't edit `node_modules/`.

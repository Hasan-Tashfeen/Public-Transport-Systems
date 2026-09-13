---
id: 0008
title: Enforce CI Format Lint Gates
stage: green
date: 2026-09-13
surface: agent
model: deepseek-flash
feature: 001-public-transport-routes
branch: 001-public-transport-routes
user: unknown
command: none
labels: [ci, formatting, lint, constitution, quality-gates]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .github/workflows/ci.yml
  - frontend/package.json
  - AGENTS.md
  - backend/alembic/env.py
  - backend/alembic/versions/0001_initial.py
  - backend/src/api/auth.py
  - backend/src/models/entities.py
  - backend/src/services/route_service.py
  - backend/src/services/search_service.py
  - frontend/src/components/MapView.tsx
  - frontend/src/components/ModeFilter.tsx
  - frontend/src/components/RouteEditor.tsx
  - frontend/src/components/ScheduleView.tsx
  - frontend/src/components/SearchBar.tsx
  - frontend/src/index.css
  - frontend/src/pages/MapPage.tsx
  - frontend/src/pages/RouteDetailPage.tsx
  - frontend/tests/MapView.test.tsx
tests:
  - backend: ruff format --check . (26 files formatted)
  - backend: ruff check . (passed)
  - backend: mypy src (passed)
  - backend: pytest -q (19 passed)
  - frontend: npm.cmd run format:check (passed)
  - frontend: npm.cmd run lint (passed)
  - frontend: npm.cmd run typecheck (passed)
  - frontend: npm.cmd run test (6 passed)
  - CI yaml parsed with yaml.safe_load (OK)
---

## Prompt

fix the critical

## Response snapshot

Resolved critical finding C1 from the cross-artifact analysis: no CI enforcing
lint/format/static analysis (Constitution Principle VI / Code Quality Standards).
Added `.github/workflows/ci.yml` with backend (python 3.11: ruff format --check,
ruff check, mypy, pytest) and frontend (node 20: npm ci, format:check, lint,
typecheck, test) jobs. Added `format` and `format:check` scripts to
`frontend/package.json`. To make the gates green, formatted the repo: `ruff
format .` (6 files) and `prettier --write .` (9 files). Updated AGENTS.md to
document the new enforced checks. Verified the full sequence locally; all pass.

## Outcome

- ✅ Impact: Constitution VI now satisfied — lint, format, static analysis, and tests are enforced in CI; C2 (unenforced formatter) also resolved.
- 🧪 Tests: backend 19 passed / ruff / mypy clean; frontend 6 passed / lint / typecheck / format clean.
- 📁 Files: CI workflow, frontend package.json, AGENTS.md, plus 15 files reformatted.
- 🔁 Next prompts: Approve remediation for remaining HIGH findings I1/I2/C3; then re-run `/sp.analyze`.
- 🧠 Reflection: Wiring the format check required actually normalizing existing formatting, otherwise the new pipeline would have been red on first run.

## Evaluation notes (flywheel)

- Failure modes observed: Existing files were not format-clean; a naive CI addition would have failed immediately.
- Graders run and results (PASS/FAIL): PASS (all documented CI steps verified locally)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none

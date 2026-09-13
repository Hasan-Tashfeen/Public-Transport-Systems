---
id: 0004
title: Karachi Transit Map Implementation
stage: green
date: 2026-09-13
surface: agent
model: deepseek-flash
feature: 002-karachi-transit-map
branch: 002-karachi-transit-map
user: unknown
command: /sp.implement
labels: [karachi, implementation, brt, place-autocomplete, photon, mta-style, seed-data]
links:
  spec: specs/002-karachi-transit-map/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-karachi-transit-map/tasks.md
  - backend/pyproject.toml
  - backend/src/models/entities.py
  - backend/src/api/schemas.py
  - backend/src/api/places.py
  - backend/src/api/stops.py
  - backend/src/config.py
  - backend/src/main.py
  - backend/src/services/place_service.py
  - backend/src/services/route_service.py
  - backend/src/services/stop_service.py
  - backend/src/seed/__init__.py
  - backend/src/seed/loader.py
  - backend/src/seed/karachi_brt.json
  - backend/tests/conftest.py
  - backend/tests/contract/test_routes.py
  - backend/tests/contract/test_places.py
  - backend/tests/unit/test_place_service.py
  - backend/tests/unit/test_seed.py
  - backend/.env.example
  - frontend/src/constants/karachi.ts
  - frontend/src/types/api.ts
  - frontend/src/services/api.ts
  - frontend/src/services/editor.ts
  - frontend/src/index.css
  - frontend/src/components/MapView.tsx
  - frontend/src/components/ModeFilter.tsx
  - frontend/src/components/PlaceAutocomplete.tsx
  - frontend/src/components/RouteEditor.tsx
  - frontend/src/components/ScheduleView.tsx
  - frontend/src/components/SearchBar.tsx
  - frontend/src/pages/MapPage.tsx
  - frontend/src/pages/RouteDetailPage.tsx
  - frontend/src/pages/StopDetailPage.tsx
  - frontend/tests/MapView.test.tsx
  - frontend/tests/PlaceAutocomplete.test.tsx
  - frontend/tests/RouteDetailPage.test.tsx
  - frontend/tests/StopDetailPage.test.tsx
  - frontend/tests/ScheduleView.test.tsx
  - frontend/tests/SearchBar.test.tsx
  - DEPLOY.md
  - AGENTS.md
tests:
  - backend: pytest -q (28 passed)
  - backend: ruff format --check / ruff check / mypy src (clean)
  - frontend: npm.cmd run test (17 passed)
  - frontend: format:check / lint / typecheck (clean)
---

## Prompt

User invoked `/sp.implement` (standard command outline: run `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`; check checklists status; load tasks.md/plan.md/data-model/contracts/research/quickstart; verify ignore files; execute tasks phase-by-phase with TDD, marking tasks complete; validate and report). Context: implement Karachi v2 — OpenStreetMap map, live Karachi place suggestions, MTA-style UI, modes BRT/bus/minibus, preloaded BRT routes.

## Response snapshot

Executed all 44 tasks across 9 phases. Checklist requirements.md had 0 incomplete
items, so implementation proceeded. Ignore files (.gitignore, frontend/.eslintignore,
frontend/.prettierignore) already present; no Docker/terraform detected.

Backend: changed `TransportMode` to `brt|bus|minibus`; added `Stop.area`; added
`GET /places` with a Photon-backed `place_service` (Karachi bbox filter, TTL cache,
timeout, graceful empty-result fallback) and `PlaceSuggestion` schema; added an
idempotent `seed_if_empty()` loader with a bundled Karachi Breeze Green + Orange
dataset; wired seed on app startup with `SEED_DISABLED` support; updated conftest and
existing tests for the new modes; added contract/unit tests for `/places` and seeding.

Frontend: added Karachi constants (center/bounds/modes/MTA colors), MTA/Swiss design
tokens and fonts, updated types and API client (`searchPlaces`, stop `area`), built an
accessible `PlaceAutocomplete` combobox (debounced, ARIA listbox, area + manual
fallback) and integrated it into the editor; centered/bounded the Leaflet map on
Karachi; restyled map, route detail, stop detail, schedule, and search with MTA
signage; added component tests.

Marked all tasks [X]. Verified the full CI sequence: backend ruff format/check, mypy,
28 pytest passed; frontend prettier check, eslint, tsc, 17 vitest passed. Updated
`DEPLOY.md`, `backend/.env.example`, and `AGENTS.md`.

## Outcome

- ✅ Impact: Karachi v2 delivered — OSM map centered on Karachi, BRT/bus/minibus modes, seeded real BRT lines, real-place stop autocomplete, and an MTA-inspired UI; all CI gates green.
- 🧪 Tests: backend 28 passed; frontend 17 passed; lint/format/types clean.
- 📁 Files: ~40 files (backend models/services/api/seed/tests; frontend constants/types/services/components/pages/tests; docs).
- 🔁 Next prompts: `/sp.analyze` (optional), `/sp.adr`, or `/sp.git.commit_pr` to commit and open a PR.
- 🧠 Reflection: The breaking mode-enum change was handled atomically across contract, schemas, types, and tests; seeding is disabled in tests to keep them deterministic.

## Evaluation notes (flywheel)

- Failure modes observed: one mypy error on the httpx params dict (fixed by annotating the mapping); an erroneous SearchBar rewrite was self-corrected before checks.
- Graders run and results (PASS/FAIL): PASS (full CI sequence green for both tiers)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): run a live `uvicorn` smoke test against the public Photon instance to validate real "Sea View" suggestions.

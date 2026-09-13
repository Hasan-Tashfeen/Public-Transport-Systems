---

description: "Task list for feature 001-public-transport-routes"
---

# Tasks: City Public Transport Route Map

**Input**: Design documents from `/specs/001-public-transport-routes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Included — the constitution (Principle IV) mandates automated tests written first (Red-Green-Refactor) where feasible.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths in descriptions

## Path Conventions

- Web app: `backend/src/`, `frontend/src/`, tests under `backend/tests/` and `frontend/tests/`
- See `plan.md` for the full layout.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize backend project: create `backend/pyproject.toml` with FastAPI, SQLAlchemy 2.x, Pydantic v2, Uvicorn, Alembic dependencies and a minimal `backend/src/main.py` app factory
- [X] T002 [P] Initialize frontend project: create `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/src/main.tsx`, and `frontend/src/App.tsx` with React 18 + TypeScript + Vite + Leaflet + react-leaflet
- [X] T003 [P] Configure backend tooling: add Ruff, mypy, and pytest configuration to `backend/pyproject.toml`
- [X] T004 [P] Configure frontend tooling: add ESLint, Prettier, Vitest, and React Testing Library config to `frontend/package.json` and `frontend/vite.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Setup SQLAlchemy engine/session and Alembic migration environment in `backend/src/db.py` and `backend/alembic/`
- [X] T006 [P] Create SQLAlchemy models for TransportMode, Route, Stop, RouteStop, Waypoint, and Schedule in `backend/src/models/base.py`, `backend/src/models/entities.py`
- [X] T007 [P] Create Pydantic schemas mirroring `contracts/openapi.yaml` (Route, RouteInput, RouteDetail, Stop, StopInput, StopDetail, Schedule, SearchResults) in `backend/src/api/schemas.py`
- [X] T008 [P] Implement planner bearer-token authorization dependency in `backend/src/api/auth.py` (reads `PLANNER_TOKEN` from env)
- [X] T009 Wire FastAPI routers, CORS, and error handling into `backend/src/main.py`; register health check
- [X] T010 [P] Create frontend API client and TypeScript types in `frontend/src/services/api.ts` and `frontend/src/types/api.ts`; add base Leaflet map component in `frontend/src/components/MapView.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View all routes on a city map (Priority: P1) 🎯 MVP

**Goal**: Riders open the app and see every route drawn on the map, color-coded by mode, with a mode filter.

**Independent Test**: Load the app with sample route data; confirm every bus, tram, metro, and rail route renders in its correct color and the mode filter shows/hides correctly.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T011 [P] [US1] Contract test for `GET /routes` (with and without `mode` filter) in `backend/tests/contract/test_routes.py`
- [X] T012 [P] [US1] Component test for route rendering and mode filtering in `frontend/tests/MapView.test.tsx`

### Implementation for User Story 1

- [X] T013 [US1] Implement route list service (`list_routes`) in `backend/src/services/route_service.py`
- [X] T014 [US1] Implement `GET /routes` endpoint with optional `mode` query filter in `backend/src/api/routes.py`
- [X] T015 [US1] Render routes as color-coded polylines and add a mode filter control in `frontend/src/components/MapView.tsx` and `frontend/src/pages/MapPage.tsx` (include empty state)

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Map out (create and edit) routes (Priority: P1)

**Goal**: Planners create a route by placing ordered stops and shaping the path with waypoints on the map, and can edit or delete it.

**Independent Test**: Create a route with at least five stops (and waypoints) on the map, save it, confirm it appears in the rider view, then edit and delete it.

### Tests for User Story 2 ⚠️

- [X] T016 [P] [US2] Contract tests for `POST /routes`, `PATCH /routes/{id}`, `DELETE /routes/{id}` in `backend/tests/contract/test_routes.py`

### Implementation for User Story 2

- [X] T017 [US2] Implement route CRUD service (create/update/delete route with ordered stops, waypoints, and schedule) in `backend/src/services/route_service.py`
- [X] T018 [US2] Implement `POST /routes`, `PATCH /routes/{id}`, `DELETE /routes/{id}` endpoints in `backend/src/api/routes.py`
- [X] T019 [US2] Build the route editor with click-to-place stops and waypoint shaping in `frontend/src/components/RouteEditor.tsx` and `frontend/src/pages/RouteEditorPage.tsx`
- [X] T020 [P] [US2] Component test for editor save/delete flow in `frontend/tests/RouteEditor.test.tsx`

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - View a single route and its stops (Priority: P2)

**Goal**: Riders select a route to see its path highlighted and its stops listed in travel order with terminals marked.

**Independent Test**: Select any route; confirm the path highlights and the ordered stop list matches the planner's definition with first/last stops marked as terminals.

### Tests for User Story 3 ⚠️

- [X] T021 [P] [US3] Contract test for `GET /routes/{id}` returning ordered stops, waypoints, and schedule in `backend/tests/contract/test_routes.py`

### Implementation for User Story 3

- [X] T022 [US3] Implement route detail service and `GET /routes/{id}` endpoint in `backend/src/services/route_service.py` and `backend/src/api/routes.py`
- [X] T023 [US3] Build route detail UI (highlight path, ordered stop list, terminal markers) in `frontend/src/pages/RouteDetailPage.tsx`

**Checkpoint**: User Story 3 works independently

---

## Phase 6: User Story 4 - View a stop and its serving routes (Priority: P2)

**Goal**: Riders select a stop to see which routes serve it and in which modes.

**Independent Test**: Select any stop; confirm the list of serving routes (and modes) is complete and correct.

### Tests for User Story 4 ⚠️

- [X] T024 [P] [US4] Contract test for `GET /stops/{id}` and `GET /stops` in `backend/tests/contract/test_stops.py`

### Implementation for User Story 4

- [X] T025 [US4] Implement stop service and `GET /stops`, `GET /stops/{id}` endpoints in `backend/src/services/stop_service.py` and `backend/src/api/stops.py`
- [X] T026 [US4] Build stop detail UI (click stop → serving routes with modes) in `frontend/src/pages/StopDetailPage.tsx`

**Checkpoint**: User Story 4 works independently

---

## Phase 7: User Story 5 - View a route's schedule (Priority: P2)

**Goal**: Riders view a route's timetable as fixed departure times or frequency/headway.

**Independent Test**: Open a fixed-timetable route and a frequency route; confirm each renders the correct schedule form (departure times vs headway + operating hours), and "schedule not available" for routes without one.

### Tests for User Story 5 ⚠️

- [X] T027 [P] [US5] Service/validation test for fixed vs frequency schedule constraints in `backend/tests/unit/test_schedule.py`

### Implementation for User Story 5

- [X] T028 [US5] Render schedule (fixed timetable vs frequency) in `frontend/src/components/ScheduleView.tsx`, wired into `frontend/src/pages/RouteDetailPage.tsx`

**Checkpoint**: User Story 5 works independently

---

## Phase 8: User Story 6 - Search routes and stops (Priority: P3)

**Goal**: Riders search by route name/number or stop name and jump to results.

**Independent Test**: Type a partial route number or stop name; confirm matching routes and stops are suggested and selectable.

### Tests for User Story 6 ⚠️

- [X] T029 [P] [US6] Contract test for `GET /search` in `backend/tests/contract/test_search.py`

### Implementation for User Story 6

- [X] T030 [US6] Implement search service and `GET /search` endpoint in `backend/src/services/search_service.py` and `backend/src/api/search.py`
- [X] T031 [US6] Build search UI with suggestions in `frontend/src/components/SearchBar.tsx`, wired into `frontend/src/pages/MapPage.tsx`

**Checkpoint**: All user stories independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T032 [P] Validate `quickstart.md` end-to-end (backend up, sample route/stop created, frontend renders it)
- [X] T033 [P] Verify responsive layout (no horizontal scroll on desktop and mobile) across `frontend/src/pages/`
- [X] T034 [P] Add PWA manifest and app metadata in `frontend/public/manifest.webmanifest`
- [X] T035 [P] Security and input-validation hardening across `backend/src/api/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; no story dependencies (MVP)
- **User Story 2 (P1)**: Starts after Foundational; independent (create/edit)
- **User Story 3 (P2)**: Starts after Foundational; uses route detail endpoint
- **User Story 4 (P2)**: Starts after Foundational; independent (stop lookup)
- **User Story 5 (P2)**: Depends on US3 detail endpoint for schedule data
- **User Story 6 (P3)**: Starts after Foundational; independent (search)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services, services before endpoints
- Backend endpoint before frontend UI that consumes it
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational completes, US1, US2, US4, US6 can start in parallel
- Tests marked [P] within a story can run in parallel with each other
- Backend and frontend tasks within a story are sequential only where the frontend consumes a specific endpoint

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Contract test for GET /routes in backend/tests/contract/test_routes.py"
Task: "Component test for route rendering in frontend/tests/MapView.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (view map) → Test → Demo (MVP)
3. Add US2 (editor) → Test → Demo (full create-and-view loop)
4. Add US3 + US4 (detail views) → Test → Demo
5. Add US5 (schedules) → Test → Demo
6. Add US6 (search) → Test → Demo

### Parallel Team Strategy

- Developer A: User Story 1 + 3 (view flows)
- Developer B: User Story 2 (editor)
- Developer C: User Story 4 + 5 + 6 (stop/schedule/search)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence

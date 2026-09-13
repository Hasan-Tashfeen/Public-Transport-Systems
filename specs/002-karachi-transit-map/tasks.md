---

description: "Task list for feature 002-karachi-transit-map"
---

# Tasks: Karachi Transit Map

**Input**: Design documents from `/specs/002-karachi-transit-map/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Included — the constitution (Principle IV) mandates automated tests written first (Red-Green-Refactor) where feasible.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths are included in each task description

## Path Conventions

- Web app: `backend/src/`, `frontend/src/`; tests under `backend/tests/` and `frontend/tests/`
- Design system: `design-system/karachi-transit/`; contract: `specs/002-karachi-transit-map/contracts/openapi.yaml`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, design tokens, and Karachi constants

- [X] T001 Add `httpx` to runtime dependencies in `backend/pyproject.toml`
- [X] T002 [P] Add MTA/Swiss design tokens, Inter + Barlow Condensed fonts, and base styles in `frontend/src/index.css` per `design-system/karachi-transit/pages/map.md`
- [X] T003 [P] Create Karachi constants (center, bbox, modes, MTA mode colors) in `frontend/src/constants/karachi.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mode change, contract sync, geocoder config, and seed infrastructure that ALL stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Change `TransportMode` enum to `brt | bus | minibus` in `backend/src/models/entities.py`
- [X] T005 [P] Update Pydantic schemas: mode enum, optional `Stop.area`, and `PlaceSuggestion` in `backend/src/api/schemas.py`
- [X] T006 [P] Update frontend types: mode union, `Stop.area`, and `PlaceSuggestion` in `frontend/src/types/api.ts`
- [X] T007 Add Karachi and geocoder settings (`KARACHI_CENTER`, `KARACHI_BBOX`, `GEOCODER_URL`, `GEOCODER_USER_AGENT`, `SEED_DISABLED`) in `backend/src/config.py`
- [X] T008 [P] Create the Karachi Breeze Green + Orange seed dataset (station names; approximate coordinates resolved via OSM) in `backend/src/seed/karachi_brt.json`
- [X] T009 Implement idempotent `seed_if_empty()` in `backend/src/seed/loader.py` (skips when routes exist or `SEED_DISABLED` is set)
- [X] T010 Wire `seed_if_empty()` into the app lifespan in `backend/src/main.py`
- [X] T011 Update `backend/tests/conftest.py` to set `SEED_DISABLED` and use the isolated in-memory DB so tests are deterministic
- [X] T012 Update existing backend tests for the `brt | bus | minibus` mode set (replace `tram`/`metro`/`rail` in `backend/tests/contract/test_routes.py` and audit `test_stops.py`, `test_search.py`)
- [X] T013 [P] Update `frontend/src/services/api.ts` to mirror the v2 contract (mode union, `searchPlaces()`, stop `area`)

**Checkpoint**: Foundation ready — all user stories can now proceed

---

## Phase 3: User Story 1 - View Karachi's transit network on a map (Priority: P1) 🎯 MVP

**Goal**: Map centered on Karachi showing BRT/bus/minibus routes color-coded, with a mode filter and a clear empty state.

**Independent Test**: Load the app; confirm the map is centered on Karachi, the seeded BRT routes render in mode colors, and the mode filter shows/hides routes correctly.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T014 [P] [US1] Contract test for `GET /routes` (seeded BRT routes + `mode` filter) in `backend/tests/contract/test_routes.py`
- [X] T015 [P] [US1] Component test for Karachi-centered map and mode filtering in `frontend/tests/MapView.test.tsx`

### Implementation for User Story 1

- [X] T016 [US1] Center and bound the Leaflet map on Karachi with OSM tiles and attribution in `frontend/src/components/MapView.tsx`
- [X] T017 [US1] Apply MTA mode colors, route bullets, and a labeled mode legend in `frontend/src/components/ModeFilter.tsx` and `frontend/src/components/MapView.tsx`
- [X] T018 [US1] Render seeded BRT routes on first load and add the Karachi empty state in `frontend/src/pages/MapPage.tsx`

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Map routes using real Karachi place suggestions (Priority: P1)

**Goal**: While typing a stop name, suggest real Karachi places (e.g., "Sea View"); selecting one sets stop name/coords; manual entry works when suggestions are unavailable.

**Independent Test**: Type "sea view" in the editor, confirm real Karachi places appear, select one, and confirm a stop is created with the right name/coords/area.

### Tests for User Story 2 ⚠️

- [X] T019 [P] [US2] Unit test for `place_service` (Karachi bbox filter, cache, timeout, empty-result fallback) in `backend/tests/unit/test_place_service.py`
- [X] T020 [P] [US2] Contract test for `GET /places` (matching places, min length, empty result is 200) in `backend/tests/contract/test_places.py`
- [X] T021 [P] [US2] Component test for the autocomplete (typing, suggestions, selection, no-results, keyboard nav) in `frontend/tests/PlaceAutocomplete.test.tsx`

### Implementation for User Story 2

- [X] T022 [US2] Implement `place_service` (Photon client, Karachi bbox filter, TTL cache, timeout, graceful fallback) in `backend/src/services/place_service.py`
- [X] T023 [US2] Implement `GET /places` and register the router in `backend/src/api/places.py` and `backend/src/main.py`
- [X] T024 [US2] Build the accessible `PlaceAutocomplete` combobox (ARIA listbox, debounce ≥2 chars, area as secondary text, manual fallback) in `frontend/src/components/PlaceAutocomplete.tsx`
- [X] T025 [US2] Integrate `PlaceAutocomplete` into the route editor so selections set name, coordinates, and area in `frontend/src/components/RouteEditor.tsx` and `frontend/src/pages/RouteEditorPage.tsx`

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - View a single route and its stops (Priority: P2)

**Goal**: Selecting a route highlights its path and lists ordered stops with terminals marked.

**Independent Test**: Select any route; confirm the path highlights and the ordered stop list matches with first/last stops marked as terminals.

### Tests for User Story 3 ⚠️

- [X] T026 [P] [US3] Contract test for `GET /routes/{route_id}` returning ordered stops, waypoints, and schedule in `backend/tests/contract/test_routes.py`
- [X] T027 [P] [US3] Component test for `RouteDetailPage` ordered stops and terminal markers in `frontend/tests/RouteDetailPage.test.tsx`

### Implementation for User Story 3

- [X] T028 [US3] Render the highlighted path, ordered stop list, and terminal markers with MTA styling in `frontend/src/pages/RouteDetailPage.tsx`

**Checkpoint**: User Story 3 works independently

---

## Phase 6: User Story 4 - View a stop and its serving routes (Priority: P2)

**Goal**: Selecting a stop lists every serving route and its mode, including the stop's area.

**Independent Test**: Select any stop; confirm all serving routes and modes are listed, with the area shown.

### Tests for User Story 4 ⚠️

- [X] T029 [P] [US4] Contract test for `GET /stops/{stop_id}` serving routes and modes in `backend/tests/contract/test_stops.py`
- [X] T030 [P] [US4] Component test for `StopDetailPage` serving routes in `frontend/tests/StopDetailPage.test.tsx`

### Implementation for User Story 4

- [X] T031 [US4] Show the stop area and serving routes/modes with MTA bullets in `frontend/src/pages/StopDetailPage.tsx`

**Checkpoint**: User Story 4 works independently

---

## Phase 7: User Story 5 - View a route's schedule (Priority: P2)

**Goal**: Render a route's fixed timetable or frequency/headway, with service days/hours and a "schedule not available" state.

**Independent Test**: Open a fixed route and a frequency route; confirm each renders the correct form, and an unscheduled route shows "schedule not available".

### Tests for User Story 5 ⚠️

- [X] T032 [P] [US5] Unit test for fixed vs frequency schedule validation in `backend/tests/unit/test_schedule.py`
- [X] T033 [P] [US5] Component test for `ScheduleView` fixed/frequency/empty states in `frontend/tests/ScheduleView.test.tsx`

### Implementation for User Story 5

- [X] T034 [US5] Apply MTA signage styling to fixed vs frequency schedules and the no-schedule state in `frontend/src/components/ScheduleView.tsx`

**Checkpoint**: User Story 5 works independently

---

## Phase 8: User Story 6 - Search routes and stops (Priority: P3)

**Goal**: Search routes/stops by name or number and jump to results.

**Independent Test**: Type a known route number and a Karachi stop name; confirm matching results are returned and selectable, with a friendly no-results state.

### Tests for User Story 6 ⚠️

- [X] T035 [P] [US6] Contract test for `GET /search` in `backend/tests/contract/test_search.py`
- [X] T036 [P] [US6] Component test for `SearchBar` suggestions and no-results in `frontend/tests/SearchBar.test.tsx`

### Implementation for User Story 6

- [X] T037 [US6] Restyle search with MTA signage and Karachi context in `frontend/src/components/SearchBar.tsx` and `frontend/src/pages/MapPage.tsx`

**Checkpoint**: All user stories independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T038 [P] Add a seed unit test (idempotent load, `brt` mode, contiguous stop sequences) in `backend/tests/unit/test_seed.py`
- [X] T039 Accessibility pass: 4.5:1 contrast, visible focus, keyboard navigation, `prefers-reduced-motion` across `frontend/src`
- [X] T040 Responsive pass: no horizontal scroll at 375/768/1024/1440 px across `frontend/src`
- [X] T041 [P] Document OSM attribution/tile usage and geocoder env vars in `DEPLOY.md` and `backend/.env.example`
- [X] T042 Validate `quickstart.md` end-to-end (backend up, seed loaded, "sea view" suggestion, route saved, mobile layout)
- [X] T043 Run the full CI sequence (`ruff format --check`, `ruff check`, `mypy`, `pytest`; `npm.cmd run format:check/lint/typecheck/test`) and fix failures
- [X] T044 [P] Update `AGENTS.md` `## Recent Changes` and record any new commands/config

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phases 3–8)**: All depend on Foundational completion; can proceed in parallel or in priority order
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no story dependencies (MVP)
- **US2 (P1)**: Starts after Foundational; independent, integrates with the existing editor
- **US3 (P2)**: Starts after Foundational; uses the route detail endpoint
- **US4 (P2)**: Starts after Foundational; independent stop lookup
- **US5 (P2)**: Starts after Foundational; uses route detail schedule data
- **US6 (P3)**: Starts after Foundational; independent search

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services, services before endpoints
- Backend endpoint before the frontend that consumes it
- Story complete before moving to the next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational completes, US1, US2, US3, US4, US6 can start in parallel; US5 depends on US3's endpoint
- Tests marked [P] within a story can run in parallel with each other

---

## Parallel Example: User Story 2

```bash
# Launch all US2 tests together before implementation:
Task: "Unit test for place_service in backend/tests/unit/test_place_service.py"
Task: "Contract test for GET /places in backend/tests/contract/test_places.py"
Task: "Component test for PlaceAutocomplete in frontend/tests/PlaceAutocomplete.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm the Karachi map + seeded BRT routes render independently

### Incremental Delivery

1. Setup + Foundational → foundation ready (modes, seed, contract)
2. US1 → Karachi map renders (MVP)
3. US2 → real-place autocomplete and route creation (completes the create-and-view loop)
4. US3 + US4 → route and stop detail
5. US5 → schedules
6. US6 → search
7. Polish → accessibility, responsive, CI, docs

### Parallel Team Strategy

- Developer A: US1 + US3 (viewing flows)
- Developer B: US2 (autocomplete + editor)
- Developer C: US4 + US5 + US6 (stop/schedule/search)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps a task to a specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- The mode-enum change (T004) is breaking: update contract, backend schemas, frontend types, and tests together
- Seeding must be disabled in tests (T011) so results stay deterministic
- Commit after each task or logical group

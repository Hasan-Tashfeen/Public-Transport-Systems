# Implementation Plan: Karachi Transit Map

**Branch**: `002-karachi-transit-map` | **Date**: 2026-09-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-karachi-transit-map/spec.md`

## Summary

Specialize the existing two-tier transit app for Karachi, Pakistan: an OpenStreetMap
basemap centered on Karachi, three transport modes (BRT, bus, minibus), a preloaded
editable set of real Karachi Breeze BRT routes/stops, and a stop-name field that
suggests real Karachi places as the planner types (e.g., "Sea View" → the actual Sea
View). The UI adopts a New York MTA-inspired wayfinding system (Swiss/Minimal,
high-contrast signage typography, per-mode route bullets).

Technical approach: reuse the existing FastAPI + SQLAlchemy backend and React + Vite
+ Leaflet frontend. Change the mode enum to `brt | bus | minibus`; add a backend
`GET /places` proxy over an OpenStreetMap geocoder (Photon) restricted to the Karachi
bounding box; add an idempotent seed loader for the BRT dataset; and correct the v1
OpenAPI drift so the contract matches the snake_case actually served.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.5 (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy 2.x, Pydantic v2, Uvicorn, httpx (geocoder client); React 18, Vite 5, Leaflet, react-leaflet, react-router-dom
**Storage**: SQLite (dev) / PostgreSQL (prod) via SQLAlchemy; bundled JSON seed dataset
**Testing**: pytest + httpx TestClient (backend); Vitest + React Testing Library (frontend)
**Target Platform**: Web (responsive desktop and mobile browsers)
**Project Type**: web (frontend + backend)
**Performance Goals**: Karachi map and preloaded routes render in <3s on broadband; place suggestions p95 <500ms warm, <1.5s cold
**Constraints**: Karachi bounding box only; requires network access to OSM tiles and the geocoder; no geocoder API key; no real-time data; pilot bearer-token auth unchanged
**Scale/Scope**: one city; 3 modes; ~2 seeded BRT lines; tens of routes; hundreds of stops

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|-----------|------------|
| I. Clean, Modular Code | PASS — new `place_service` module and seed loader are isolated; existing models/services/api layering preserved; new `PlaceAutocomplete` component is self-contained. |
| II. Separation of Concerns & Clear Interfaces | PASS — geocoder is hidden behind `place_service` and a single `GET /places` contract; frontend never calls the geocoder directly; UI, logic, and I/O stay separated. |
| III. Readability & Self-Documenting Code | PASS — descriptive names; no new dead code; configuration is env-driven. |
| IV. Testing Discipline | PASS — tests planned for `place_service` (mocked geocoder), `GET /places` contract, seed loader, and the autocomplete component before implementation. |
| V. Simplicity & YAGNI | PASS — reuses the existing Leaflet/Tile stack and schema; no real-time, no multi-city, no auth overhaul; the single new external dependency (geocoder) is required by the spec and keyless. |
| VI. Best Practices & Idiomatic Style | PASS — lint/format/mypy/tsc/pytest/vitest are enforced in CI; geocoder URL/User-Agent/bbox are env-configured; no secrets introduced. |

**Gate result**: PASS — no violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/002-karachi-transit-map/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── base.py              # unchanged
│   │   └── entities.py          # TransportMode -> brt|bus|minibus; Stop.area (optional)
│   ├── services/
│   │   ├── place_service.py     # NEW: Photon-backed Karachi place search (+ cache)
│   │   ├── route_service.py     # unchanged
│   │   ├── stop_service.py      # unchanged
│   │   └── search_service.py    # unchanged
│   ├── api/
│   │   ├── places.py            # NEW: GET /places
│   │   ├── schemas.py           # PlaceSuggestion; modes; route inputs
│   │   └── (routes|stops|search|auth).py
│   ├── seed/
│   │   ├── __init__.py
│   │   ├── loader.py            # NEW: seed_if_empty()
│   │   └── karachi_brt.json     # NEW: Green + Orange line dataset
│   ├── config.py                # NEW: geocoder + Karachi bbox/center settings
│   ├── db.py                    # unchanged
│   └── main.py                  # wire /places router + seed on lifespan
├── tests/
│   ├── contract/                # test_places.py (NEW) + existing
│   └── unit/                    # test_place_service.py, test_seed.py (NEW)
└── pyproject.toml               # add httpx runtime dep

frontend/
├── src/
│   ├── components/
│   │   ├── PlaceAutocomplete.tsx  # NEW: accessible combobox for stop names
│   │   └── (MapView|ModeFilter|RouteEditor|ScheduleView|SearchBar).tsx
│   ├── constants/
│   │   └── karachi.ts           # NEW: center, bbox, modes, MTA-derived mode colors
│   ├── services/
│   │   └── api.ts               # add searchPlaces(); modes
│   ├── types/
│   │   └── api.ts               # PlaceSuggestion; mode union
│   ├── pages/                   # map centered on Karachi; editor uses autocomplete
│   └── index.css                # MTA/Swiss design tokens
└── tests/                       # PlaceAutocomplete.test.tsx (NEW) + existing

design-system/karachi-transit/
├── MASTER.md                    # generated by ui-ux-pro-max
└── pages/map.md                 # NEW override: MTA wayfinding direction
```

**Structure Decision**: The repository's existing web layout (`backend/`, `frontend/`)
is retained; this feature adds one backend module (`place_service` + `places` router +
`seed`), one frontend component (`PlaceAutocomplete`) plus Karachi/MTA constants, and
a persisted design system. No project boundary changes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

None — Constitution Check passes with no violations.

## Post-Design Constitution Re-check

Re-evaluated after Phase 1 (data-model, contracts, quickstart): **PASS**, no new
violations. The v1 contract drift identified earlier (camelCase OpenAPI vs snake_case
implementation) is corrected by this feature's contract, and the new external
geocoder is isolated, keyless, cached, and gracefully degradable.

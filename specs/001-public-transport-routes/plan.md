# Implementation Plan: City Public Transport Route Map

**Branch**: `001-public-transport-routes` | **Date**: 2026-09-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-public-transport-routes/spec.md`

## Summary

A responsive web application that shows every public transport route (bus, tram,
metro, rail) drawn on a city map, and lets authorized planners map out and edit
those routes and their schedules. Riders view routes/stops/schedules; planners
create and maintain the underlying route data via an on-map editor.

**Technical approach**: A two-tier web app — a FastAPI (Python) REST backend
serving route/stop/schedule data from a relational store, and a React +
TypeScript single-page frontend rendering the map with Leaflet (OpenStreetMap
tiles) and providing the on-map editor. Paths are captured as ordered stops plus
optional intermediate waypoints (no PostGIS required; no spatial queries in
scope). Schedules support both fixed timetables and frequency/headway.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.4 (frontend)  
**Primary Dependencies**: FastAPI, SQLAlchemy 2.x, Pydantic v2, Uvicorn (backend); React 18, Vite, Leaflet, react-leaflet (frontend)  
**Storage**: SQLite via SQLAlchemy ORM (pilot); PostGIS deferred — no spatial queries in scope  
**Testing**: pytest + httpx (backend); Vitest + React Testing Library (frontend)  
**Target Platform**: Web (modern desktop and mobile browsers, responsive)  
**Project Type**: web (frontend + backend)  
**Performance Goals**: Full map with all routes renders < 3s on broadband; typical read API p95 < 200ms  
**Constraints**: Responsive (no horizontal scrolling); no hardcoded secrets; deterministic, fast tests; lint/format/typecheck enforced  
**Scale/Scope**: Single city pilot; 4 modes; tens of routes; hundreds of stops; a handful of planner accounts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|-----------|------------|
| I. Clean, Modular Code | PASS — backend split into models/services/api layers; frontend into components/pages/services |
| II. Separation of Concerns & Clear Interfaces | PASS — REST contract separates client and server; business logic isolated from persistence and presentation |
| III. Readability & Self-Documenting Code | PASS — descriptive naming; lint/format enforced; no dead code committed |
| IV. Testing Discipline | PASS — pytest + Vitest/React Testing Library; tests written with each task (TDD where feasible) |
| V. Simplicity & YAGNI | PASS — SQLite over PostGIS (no spatial queries); Leaflet over bespoke rendering; no speculative features |
| VI. Best Practices & Idiomatic Style | PASS — idiomatic FastAPI/React; Ruff + ESLint + Prettier + mypy + tsc enforced; env-based config |

**Gate result**: PASS — no violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-public-transport-routes/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # SQLAlchemy entities (Route, Stop, RouteStop, Schedule, Waypoint)
│   ├── services/        # business logic (route/stop/schedule CRUD, validation)
│   ├── api/             # FastAPI routers + schemas (Pydantic)
│   ├── db.py            # engine/session wiring
│   ├── config.py        # env-driven configuration
│   └── main.py          # app factory + entrypoint
├── tests/
│   ├── contract/        # API contract tests
│   ├── integration/     # DB + service integration tests
│   └── unit/            # service/validation unit tests
├── pyproject.toml       # deps + Ruff/mypy/pytest config
└── alembic/             # DB migrations

frontend/
├── src/
│   ├── components/      # map, route list, editor, schedule views
│   ├── pages/           # map viewer page, route editor page, route/stop detail
│   ├── services/        # API client + types
│   ├── types/           # shared TS interfaces (mirror contracts)
│   ├── App.tsx
│   └── main.tsx
├── tests/               # Vitest + React Testing Library
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**Structure Decision**: Web application (Option 2) — a `backend/` (FastAPI REST
API) and a `frontend/` (React SPA) at the repository root, matching the "web
application" layout. No native mobile apps; responsiveness handled by the SPA.
Backend follows the layered structure (models/services/api); frontend separates
components, pages, and API client services.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified.

None — Constitution Check passes with no violations.

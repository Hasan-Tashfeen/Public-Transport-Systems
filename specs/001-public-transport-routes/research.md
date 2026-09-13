# Research: City Public Transport Route Map

Phase 0 output for `/sp.plan`. Resolves the technical unknowns in the plan's
Technical Context and documents the reasoning behind each technology choice.

## R1 — Backend framework

- **Decision**: FastAPI (Python 3.11).
- **Rationale**: Async-first, first-class OpenAPI/Pydantic validation, idiomatic
  for small REST APIs, and pairs naturally with SQLAlchemy. Reduces boilerplate
  for the CRUD-heavy route/stop/schedule resources this feature needs.
- **Alternatives considered**: Django + DRF (heavier, admin-oriented, more than
  needed); Node/Express or NestJS (would add a second language and duplicate
  tooling for a small pilot).

## R2 — Storage and geospatial handling

- **Decision**: SQLite via SQLAlchemy 2.x ORM. Store stop/waypoint coordinates as
  plain latitude/longitude floats; route paths as ordered waypoint rows. No
  PostGIS/PostgreSQL in this phase.
- **Rationale**: The requirements need only relational lookups (routes serving a
  stop, ordered stops of a route) — no spatial queries (radius search, snapping,
  routing). SQLite is the simplest store that satisfies YAGNI and runs with zero
  external infrastructure for the pilot.
- **Alternatives considered**: PostgreSQL + PostGIS (correct long-term for
  spatial queries, but speculative now and adds operational cost); SpatiaLite
  (spatial SQLite, still more than needed).

## R3 — Map rendering

- **Decision**: Leaflet + react-leaflet with OpenStreetMap (OSM) raster tiles.
- **Rationale**: Free, no API key, battle-tested, and sufficient for drawing
  polylines (routes) and markers (stops) plus click-to-place editing. Minimal
  bundle cost relative to Mapbox/Google.
- **Alternatives considered**: Mapbox GL JS (higher quality but requires a
  token/billing and richer setup); Google Maps JS (licensing); MapLibre GL (good,
  vector tiles, but heavier than needed for the pilot).

## R4 — Frontend stack

- **Decision**: React 18 + TypeScript 5.4 + Vite.
- **Rationale**: Vite gives fast dev/iteration; TypeScript matches the
  self-documenting, typed-contract goals; React is the team's idiomatic choice
  and pairs directly with react-leaflet.
- **Alternatives considered**: Svelte/Vue (fine, but React has the broadest
  ecosystem for map libraries); server-rendered templates (poor fit for an
  interactive map editor).

## R5 — Testing strategy

- **Decision**: pytest + httpx for backend (unit, integration, contract); Vitest
  + React Testing Library for frontend components/services.
- **Rationale**: Matches each stack's idiomatic test tooling; keeps tests fast,
  deterministic, and independent per Constitution Principle IV.
- **Alternatives considered**: Playwright/Cypress end-to-end (deferred — valuable
  but heavier; add when the map editor interaction warrants it).

## R6 — Schedule model (fixed + frequency)

- **Decision**: A single `Schedule` entity with a `type` discriminator
  (`fixed` vs `frequency`), carrying departure times + service days for fixed,
  and headway minutes + operating hours for frequency.
- **Rationale**: The clarification confirmed both models are needed. One entity
  with a discriminated set of optional fields keeps the API and UI uniform while
  supporting both representations without over-modeling.
- **Alternatives considered**: Two separate tables (more JOINs for little gain);
  storing schedules as freeform text (not queryable/validatable).

## R7 — Route path capture (stops + waypoints)

- **Decision**: Routes are defined by ordered stops; optional intermediate
  `Waypoint` rows shape the polyline between stops to follow real streets.
- **Rationale**: Matches the clarification. Keeps stops as the primary
  sequencing anchor (for timetables and stop lists) while allowing realistic
  paths, decoupling geometry from service topology.
- **Alternatives considered**: Freehand polylines only (loses the ordered-stop
  semantics needed for schedules/stop lists); straight lines only (unrealistic
  rendering).

## R8 — Authorization model

- **Decision**: Defer detailed auth to planning of implementation; plan assumes a
  lightweight role flag (`planner` vs `rider`) enforced at the API layer, with a
  simple bearer token/dev login for the pilot.
- **Rationale**: The spec only requires that editing be restricted to authorized
  planners. A full identity provider is out of scope for the pilot (YAGNI).
- **Alternatives considered**: Full OAuth/OIDC (speculative for pilot); no auth
  (violates FR-003/FR-004 authorization).

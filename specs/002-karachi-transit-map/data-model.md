# Data Model: Karachi Transit Map

Phase 1 output for `/sp.plan`. Entities derive from the feature spec's Key Entities and
the Karachi scope (modes BRT/bus/minibus; real-place stop suggestions; seeded BRT data).

## Entities

### TransportMode (enum)

- `brt` | `bus` | `minibus`
- Determines route coloring/labeling (FR-001, FR-018). Replaces the v1 enum
  (`bus|tram|metro|rail`) — a breaking change with no data migration (R5).

### Route

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | primary key |
| `number` | string | display number/name, e.g. "G" or "Green" |
| `name` | string | optional label, e.g. "Karachi Breeze Green Line" |
| `mode` | enum(TransportMode) | exactly one (FR-010) |
| `color` | string | hex color, MTA-derived for seeded lines |
| `created_at` | datetime | |
| `updated_at` | datetime | |

- Uniqueness: (`number`, `mode`) unique, so bus 7 and minibus 7 stay distinct.
- Relationships: many `RouteStop` (ordered), many `Waypoint` (ordered), 0..1 `Schedule`.

### Stop

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | primary key |
| `name` | string | required (FR-011) |
| `area` | string | optional, e.g. "Clifton, Karachi"; shown for disambiguation |
| `lat` | float | latitude, within the Karachi bbox |
| `lng` | float | longitude |
| `created_at` | datetime | |
| `updated_at` | datetime | |

- `area` is populated from the selected place suggestion (R2) when available.
- Relationships: many-to-many with Route via `RouteStop`.

### RouteStop (ordered join)

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | primary key |
| `route_id` | FK → Route | |
| `stop_id` | FK → Stop | |
| `sequence` | int | 0-based order along the route |
| `arrival_time` | string (HH:MM) | nullable, fixed schedules |
| `departure_time` | string (HH:MM) | nullable |

- Uniqueness: (`route_id`, `stop_id`), (`route_id`, `sequence`).
- `sequence = 0` and the last stop are terminals (FR-012).

### Waypoint

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | primary key |
| `route_id` | FK → Route | |
| `sequence` | int | order along the path |
| `lat` | float | |
| `lng` | float | |

- Optional intermediate points shaping the polyline between stops (FR-004). A route may
  have zero waypoints (straight segments).

### Schedule

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | primary key |
| `route_id` | FK → Route | one schedule per route |
| `type` | enum(`fixed`, `frequency`) | |
| `service_days` | JSON array of 0–6 (Mon–Sun) | fixed |
| `departures` | JSON array of "HH:MM" | fixed |
| `headway_minutes` | int | frequency |
| `start_time` | string (HH:MM) | frequency operating hours |
| `end_time` | string (HH:MM) | frequency operating hours |

- Validation: `fixed` requires `service_days` + `departures`; `frequency` requires
  `headway_minutes` + `start_time` + `end_time`. A route may have no schedule (FR-014).

### PlaceSuggestion (transient — NOT persisted)

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | place name, e.g. "Sea View" |
| `area` | string, nullable | administrative area/locality for disambiguation |
| `lat` | float | within the Karachi bbox |
| `lng` | float | |

- Produced by `GET /places` from the OSM geocoder (R2/R3); becomes a `Stop` only when a
  planner selects it and saves (FR-006–FR-008).

### SeedDataset (bundled JSON, not a runtime entity)

- `backend/src/seed/karachi_brt.json`: Karachi Breeze Green and Orange lines with
  ordered stops (names + approximate coordinates + mode = `brt`).
- Loaded by `seed_if_empty()` when the database has no routes (FR-016); fully editable
  after load.

## Relationships

```text
Route 1 ──── * RouteStop * ──── 1 Stop
Route 1 ──── * Waypoint
Route 1 ──── 0..1 Schedule
PlaceSuggestion ──(selected)──> Stop
```

## Validation rules (from requirements)

- Route: unique identifier, a number, exactly one mode (FR-010).
- Stop: name and location; coordinates MUST fall within the Karachi bounding box
  (FR-008, FR-011).
- RouteStop sequences contiguous, starting at 0.
- Place search: minimum 2 characters; results limited to Karachi; empty result is a
  valid, non-error response (FR-006, FR-008, FR-009).
- Route deletion removes dependent RouteStops, Waypoints, and Schedule (FR-005).

## State transitions

- `Route`: `draft` (saved with <2 stops, per edge case) → `active` (≥2 stops) →
  `deleted` (hard delete). Draft routes MUST NOT break map rendering.
- `PlaceSuggestion` has no persisted state.

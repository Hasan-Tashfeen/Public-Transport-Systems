# Data Model: City Public Transport Route Map

Phase 1 output for `/sp.plan`. Entities are derived from the feature spec's
"Key Entities" section and the clarification decisions (fixed+frequency
schedules; stops + waypoints).

## Entities

### TransportMode (enum)

- `bus` | `tram` | `metro` | `rail`
- Determines route coloring and labeling (FR-001, FR-011).

### Route

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | primary key |
| `number` | string | display name/number, e.g. "7" |
| `name` | string | optional human label, e.g. "Airport Express" |
| `mode` | enum(TransportMode) | exactly one (FR-005) |
| `color` | string | hex color for rendering |
| `created_at` | datetime | |
| `updated_at` | datetime | |

- Uniqueness: (`number`, `mode`) is unique so bus 7 vs tram 7 stay distinct.
- Relationships: has many `RouteStop` (ordered) and many `Waypoint` (ordered).

### Stop

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | primary key |
| `name` | string | required (FR-006) |
| `lat` | float | latitude |
| `lng` | float | longitude |
| `created_at` | datetime | |
| `updated_at` | datetime | |

- Relationships: many-to-many with Route via `RouteStop`.

### RouteStop (join, ordered)

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | primary key |
| `route_id` | FK → Route | |
| `stop_id` | FK → Stop | |
| `sequence` | int | 0-based order along route |
| `arrival_time` | string (HH:MM) | nullable, for fixed schedules |
| `departure_time` | string (HH:MM) | nullable |

- Uniqueness: (`route_id`, `stop_id`), (`route_id`, `sequence`).
- First (`sequence=0`) and last stops are terminals (User Story 3).

### Waypoint

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | primary key |
| `route_id` | FK → Route | |
| `sequence` | int | order along the path |
| `lat` | float | |
| `lng` | float | |

- Optional intermediate points that shape the polyline between stops (FR-003,
  FR-012). A route may have zero waypoints (straight segments).

### Schedule

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | primary key |
| `route_id` | FK → Route | one schedule per route |
| `type` | enum(`fixed`,`frequency`) | |
| `service_days` | JSON array of 0–6 (Mon–Sun) | for fixed |
| `departures` | JSON array of "HH:MM" | for fixed |
| `headway_minutes` | int | for frequency |
| `start_time` | string (HH:MM) | for frequency operating hours |
| `end_time` | string (HH:MM) | for frequency operating hours |

- Validation: `fixed` requires `service_days` + `departures`; `frequency`
  requires `headway_minutes` + `start_time` + `end_time`. A route may have no
  schedule (UI shows "schedule not available").

## Relationships

```
Route 1 ──── * RouteStop * ──── 1 Stop
Route 1 ──── * Waypoint
Route 1 ──── 0..1 Schedule
```

## State transitions

- `Route`: `draft` (saved with no stops, per edge case) → `active` (≥ 2 stops)
  → `deleted` (soft-delete or hard-delete). Drafts must not break map rendering.
- No other entities have meaningful state machines.

## Validation rules (from requirements)

- Route must have a unique identifier, a number, and exactly one mode (FR-005).
- Stop must have a name and a location (FR-006).
- RouteStop sequences must be contiguous and start at 0.
- Route deletion updates/removes dependent RouteStops and Waypoints (User Story 2).

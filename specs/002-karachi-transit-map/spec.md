# Feature Specification: Karachi Transit Map

**Feature Branch**: `002-karachi-transit-map`
**Created**: 2026-09-13
**Status**: Draft
**Input**: User description: "Tailor the public transport route map specifically for the city of Karachi, Pakistan. Use OpenStreetMap for the Karachi map. When a planner starts writing a stop name, suggest actual matching places in Karachi (e.g., typing 'Sea View' suggests the real Sea View). Use an MTA/New York transit-inspired visual style. Modes: BRT, bus, minibus. Preload real BRT routes and stops."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Karachi's transit network on a map (Priority: P1)

As a Karachi rider, I can open the app and immediately see the city's BRT, bus, and
minibus routes drawn on a map of Karachi, color-coded and labeled by mode, so I
understand which services exist and where they go.

**Why this priority**: This is the core promise of the product, specialized to
Karachi. Without it there is nothing to look at.

**Independent Test**: Load the app with the preloaded BRT data and confirm the map
is centered on Karachi and every BRT, bus, and minibus route renders in its correct
mode color; toggling the mode filter shows/hides routes correctly.

**Acceptance Scenarios**:

1. **Given** the app loads for the first time, **When** a rider opens it, **Then**
   the map is centered on Karachi and the preloaded BRT routes and stops are visible.
2. **Given** all routes are shown, **When** the rider filters by a single mode
   (BRT, bus, or minibus), **Then** only routes of that mode remain visible.
3. **Given** no route data exists (data cleared), **When** the rider opens the app,
   **Then** a clear empty state is shown instead of a blank map.

---

### User Story 2 - Map routes using real Karachi place suggestions (Priority: P1)

As a transit planner, I can create a route by typing stop names and having the app
suggest real places in Karachi (for example, typing "Sea View" suggests the actual
Sea View), then place those stops in order on the map, so the data I enter matches
real Karachi locations.

**Why this priority**: Accurate, recognizable Karachi place names are what make the
map trustworthy and usable; this is the primary way data enters the system.

**Independent Test**: Type a partial name of a known Karachi landmark (e.g., "Sea
View"), confirm a matching real place appears in the suggestions with its area, and
confirm selecting it creates a stop at the correct coordinates.

**Acceptance Scenarios**:

1. **Given** a planner is entering a stop name, **When** they type at least two
   characters of a real Karachi place name, **Then** the app suggests matching
   places within or near Karachi, each showing its name and area.
2. **Given** suggestions are shown, **When** the planner selects one, **Then** the
   stop's name and geographic coordinates are set from that place.
3. **Given** the planner types a name with no matching Karachi place, **When** no
   suggestions are available, **Then** a friendly no-results state is shown and the
   planner can still set the stop location manually.
4. **Given** a route has ordered stops, **When** the planner saves it, **Then** the
   route is stored with its ordered stops, shaped path, and single mode.

---

### User Story 3 - View a single route and its stops (Priority: P2)

As a rider, I can select a route to see its full path highlighted and its stops
listed in travel order, so I can follow a specific service end to end.

**Why this priority**: Once routes are visible, riders need detail on a chosen route
to actually use it.

**Independent Test**: Select any route and confirm the path highlights and the
ordered stop list matches the planner's definition with first/last stops marked as
terminals.

**Acceptance Scenarios**:

1. **Given** a rider selects a route, **When** the detail view opens, **Then** the
   route's path is highlighted and its stops are listed in travel order.
2. **Given** a route with multiple stops, **When** the rider views the list,
   **Then** the first and last stops are clearly marked as terminals.

---

### User Story 4 - View a stop and its serving routes (Priority: P2)

As a rider, I can select a stop to see which routes serve it and in which modes, so
I can plan transfers and connections.

**Why this priority**: Stop-level lookup is the natural companion to route detail
and supports trip planning.

**Independent Test**: Select any stop and confirm all serving routes and their modes
are listed correctly.

**Acceptance Scenarios**:

1. **Given** a stop served by multiple routes, **When** a rider selects it, **Then**
   all serving routes and their modes are listed.
2. **Given** a stop served by a single route, **When** a rider selects it, **Then**
   that route is shown.

---

### User Story 5 - View a route's schedule (Priority: P2)

As a rider, I can view a route's timetable (departure times or service frequency,
with service days or operating hours), so I know when the service runs.

**Why this priority**: Schedules turn a route map into something usable for actual
travel.

**Independent Test**: Open a fixed-timetable route and a frequency route and confirm
each renders its correct schedule form, and that a route without a schedule shows a
"scheduled not available" state instead of an error.

**Acceptance Scenarios**:

1. **Given** a route with a fixed timetable, **When** a rider opens it, **Then**
   specific departure times and service days are shown.
2. **Given** a route defined by service frequency, **When** a rider opens it,
   **Then** the headway (e.g., "every 10 minutes") and operating hours are shown.
3. **Given** a route with no schedule, **When** a rider opens it, **Then** a
   "schedule not available" state is shown.

---

### User Story 6 - Search routes and stops (Priority: P3)

As a rider, I can search by route number/name or stop name, so I can jump directly
to what I need without scanning the whole map.

**Why this priority**: Search is a convenience that becomes valuable once many
routes exist.

**Independent Test**: Type a known route number or Karachi stop name and confirm the
correct result is returned and selectable.

**Acceptance Scenarios**:

1. **Given** route and stop data exists, **When** a rider searches a partial name or
   number, **Then** matching routes and stops are suggested.
2. **Given** a search with no matches, **When** the rider submits it, **Then** a
   friendly "no results" message is shown.

---

### Edge Cases

- The place-suggestion service is unavailable (offline or rate-limited): the planner
  MUST still be able to place a stop and set its name/coordinates manually, with a
  clear, non-blocking notice.
- Several real places share a name (e.g., multiple "Sea View" entries): suggestions
  MUST disambiguate by area and coordinates so the planner can choose correctly.
- A place that matches the text but lies outside Karachi MUST NOT be suggested.
- Typing very few characters (fewer than two) MUST NOT trigger a search.
- A route saved with fewer than two stops (draft) MUST NOT break the map view.
- Overlapping or intersecting route paths MUST remain visually distinguishable.
- A schedule with no service on a given day MUST display correctly.
- Two routes sharing the same number but different modes (e.g., bus 7 vs minibus 7)
  MUST remain distinct.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all routes on an interactive map of Karachi,
  color-coded and labeled by transport mode (BRT, bus, minibus).
- **FR-002**: The map MUST open centered on Karachi at a zoom level that shows the
  city and its routes by default.
- **FR-003**: Riders MUST be able to filter the displayed routes by transport mode.
- **FR-004**: Authorized planners MUST be able to create a route by defining its
  ordered stops and path on the map, shaping the path with optional intermediate
  waypoints.
- **FR-005**: Authorized planners MUST be able to edit and delete existing routes.
- **FR-006**: While a planner types a stop name, the system MUST suggest real places
  within or near Karachi whose names match the typed text, showing each place's name
  and area.
- **FR-007**: Selecting a suggestion MUST set the stop's name and geographic
  coordinates from that place.
- **FR-008**: Place suggestions MUST be restricted to the Karachi area; matches
  outside Karachi MUST be excluded.
- **FR-009**: When place suggestions are unavailable, the system MUST allow manual
  stop entry (name and location) without blocking route creation.
- **FR-010**: Each route MUST have a unique identifier, a display number/name, and
  exactly one transport mode.
- **FR-011**: Each stop MUST have a name and a geographic location.
- **FR-012**: System MUST show a route's ordered stops and highlighted path when the
  route is selected, marking first and last stops as terminals.
- **FR-013**: System MUST show, for a selected stop, every route that serves it and
  its mode.
- **FR-014**: System MUST display a route's schedule when available, supporting both
  fixed departure times and service frequency (headway), including service days or
  operating hours.
- **FR-015**: Riders MUST be able to search for routes and stops by name or number.
- **FR-016**: The system MUST preload a real, editable set of Karachi BRT routes and
  their stops so the map is populated on first use.
- **FR-017**: The user interface MUST follow a New York transit (MTA)-inspired
  wayfinding style: high-contrast signage typography, per-mode route bullets/line
  colors, and clearly legible labels.
- **FR-018**: The system MUST distinguish modes and routes without relying on color
  alone (labels, icons/bullets, or patterns in addition to color).

### Key Entities *(include if feature involves data)*

- **Transport Mode**: One of BRT, bus, or minibus; determines route coloring and
  labeling.
- **Route**: A named/numbered service line with a single mode, a display color, and
  an ordered path (stops joined by optional intermediate waypoints); relates to many
  stops through RouteStop.
- **Stop**: A named boarding/alighting point with a geographic location; related to
  many routes.
- **RouteStop**: The ordered position of a Stop on a Route, including its sequence
  number and optional scheduled arrival/departure times.
- **Waypoint**: An optional intermediate coordinate used to shape a route's path
  between stops.
- **Schedule**: A route's timetable, expressed as fixed departure times and/or a
  service frequency (headway), with the days or operating hours on which service
  runs.
- **Place Suggestion**: A transient (not persisted) candidate place returned while a
  planner types a stop name; has a name, area, and coordinates. It becomes a Stop
  only when selected and saved.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On first load, the map opens centered on Karachi and shows the
  preloaded BRT routes within 3 seconds on a typical broadband connection.
- **SC-002**: When a planner types at least two characters of a known Karachi
  landmark (e.g., "Sea View"), the intended real place appears among the top five
  suggestions.
- **SC-003**: A planner can map out and save a new route with at least five stops in
  under 5 minutes.
- **SC-004**: 100% of saved routes render on the map with their stops in the correct
  order.
- **SC-005**: 90% of pilot users find a specific route or stop using search on their
  first attempt.
- **SC-006**: The app is usable on desktop and mobile screen sizes without horizontal
  scrolling.
- **SC-007**: Text and route labels meet a 4.5:1 contrast ratio, and every mode/route
  remains distinguishable without relying on color alone.

## Assumptions

- The app serves a single fixed city: Karachi, Pakistan.
- Supported transport modes are exactly BRT, bus, and minibus.
- The map basemap and place suggestions are provided by OpenStreetMap-based services,
  requiring network access.
- The preloaded BRT routes/stops are a best-effort real dataset and remain fully
  editable by planners.
- Route and stop data is entered manually by authorized planners; no automated
  transit feed import is required for this release.
- No real-time vehicle positions are in scope; this release covers static routes,
  stops, and schedules only.
- Editing (create/update/delete) is restricted to authorized planners; viewing and
  search are open to all users.

## Dependencies

- A network-accessible OpenStreetMap tile source for the Karachi basemap.
- A network-accessible, Karachi-restricted place-search service for stop-name
  suggestions.
- Publicly available information about Karachi BRT lines and stops to seed the
  initial dataset.

# Feature Specification: City Public Transport Route Map

**Feature Branch**: `001-public-transport-routes`
**Created**: 2026-09-13
**Status**: Draft
**Input**: User description: "public transport system for my city in which the routes will show up of all the transport vehicles"

## Clarifications

### Session 2026-09-13

- Q: How should route schedules be represented? → A: Both fixed timetables
  (specific departure times, primarily for metro/rail) and frequency/headway
  (e.g., "every 10 minutes", primarily for bus/tram).
- Q: How should a route's path be captured? → A: Planner places ordered stops;
  the path is drawn through them and can be shaped with optional intermediate
  waypoints to follow real streets.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View all routes on a city map (Priority: P1)

As a rider, I can open the app and see every public transport route drawn on a
city map, color-coded by transport mode, so I can understand what services exist
and where they go.

**Why this priority**: This is the core promise of the product — "routes show
up for all transport vehicles." Without it there is nothing to look at.

**Independent Test**: Can be fully tested by loading the app with a sample
route set and confirming every bus, tram, metro, and rail route renders on the
map in its correct color, delivering immediate value even with no other
features.

**Acceptance Scenarios**:

1. **Given** route data exists for the city, **When** a rider opens the app,
   **Then** all routes are visible on the map, color-coded by mode (bus, tram,
   metro, rail).
2. **Given** the map is showing all routes, **When** the rider selects a single
   mode filter (e.g., "metro"), **Then** only routes of that mode remain visible.
3. **Given** no route data has been entered yet, **When** the rider opens the
   app, **Then** a clear empty state is shown explaining that routes have not
   been mapped yet.

---

### User Story 2 - Map out (create and edit) routes (Priority: P1)

As a transit planner, I can create a new route by plotting its path and ordered
stops directly on the map, and later edit or delete it, so the system holds
accurate, up-to-date route data for every transport mode.

**Why this priority**: This is how route data gets into the system in the first
place; without an editor the viewer has nothing to display.

**Independent Test**: Can be fully tested by creating a route with at least
five stops on the map, saving it, and confirming it then appears in the rider
view, delivering a complete create-and-view loop.

**Acceptance Scenarios**:

1. **Given** a planner opens the route editor, **When** they place stops in
   order and shape the path with intermediate waypoints on the map, **Then** the
   system saves the route with its ordered stops, shaped path, and mode.
2. **Given** an existing route, **When** the planner moves or reorders a stop,
   **Then** the saved route reflects the change and re-renders on the map.
3. **Given** an existing route, **When** the planner deletes it, **Then** the
   route is removed from the map and stop serving it are updated.

---

### User Story 3 - View a single route and its stops (Priority: P2)

As a rider, I can select a route to see its full path highlighted and its stops
listed in travel order, so I can follow a specific service end to end.

**Why this priority**: Once routes are visible, riders need detail on a chosen
route to actually use it.

**Independent Test**: Can be fully tested by selecting any route and confirming
the path highlights and the ordered stop list matches the planner's definition.

**Acceptance Scenarios**:

1. **Given** a rider selects a route, **When** the detail view opens, **Then**
   the route's path is highlighted and its stops are listed in travel order.
2. **Given** a route with multiple stops, **When** the rider views the list,
   **Then** the first and last stops are clearly marked as terminals.

---

### User Story 4 - View a stop and its serving routes (Priority: P2)

As a rider, I can select a stop to see which routes serve it and in which modes,
so I can plan transfers and connections.

**Why this priority**: Stop-level lookup is the natural companion to route-level
detail and supports trip planning.

**Independent Test**: Can be fully tested by selecting any stop and confirming
the list of serving routes (and modes) is complete and correct.

**Acceptance Scenarios**:

1. **Given** a stop served by multiple routes, **When** a rider selects it,
   **Then** all serving routes and their modes are listed.
2. **Given** a stop served by only one route, **When** a rider selects it,
   **Then** that single route is shown.

---

### User Story 5 - View a route's schedule (Priority: P2)

As a rider, I can view a route's timetable (departure times and service days),
so I know when the service runs.

**Why this priority**: Static schedules are part of the agreed scope and turn a
route map into something usable for actual travel.

**Independent Test**: Can be fully tested by opening a route with a defined
schedule and confirming its departure times and service days display correctly.

**Acceptance Scenarios**:

1. **Given** a route with a fixed timetable, **When** a rider opens its
   timetable, **Then** specific departure times and service days are shown.
2. **Given** a route defined by service frequency, **When** a rider opens its
   timetable, **Then** the headway (e.g., "every 10 minutes") and operating
   hours are shown.
3. **Given** a route with no schedule yet, **When** a rider opens its timetable,
   **Then** a "schedule not available" state is shown rather than an error.

---

### User Story 6 - Search routes and stops (Priority: P3)

As a rider, I can search by route name/number or stop name, so I can jump
directly to what I need without scanning the whole map.

**Why this priority**: Search is a convenience that becomes valuable once many
routes exist, so it is prioritized after the core viewing and editing flows.

**Independent Test**: Can be fully tested by typing a known route number or stop
name and confirming the correct result is returned and selectable.

**Acceptance Scenarios**:

1. **Given** route and stop data exists, **When** a rider searches a partial
   name or number, **Then** matching routes and stops are suggested.
2. **Given** a search with no matches, **When** the rider submits it, **Then**
   a friendly "no results" message is shown.

---

### Edge Cases

- A single stop served by routes in multiple modes (e.g., a bus+tram interchange).
- Two routes sharing the same number in different modes (e.g., bus 7 vs tram 7)
  must remain distinct.
- A route saved as a draft with no stops yet — it must not break the map view.
- Overlapping or intersecting route paths must remain distinguishable.
- An empty city (no routes) must show a clear empty state, not a blank screen.
- A schedule with no service on a given day must display correctly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all routes on a city map, color-coded and
  labeled by transport mode (bus, tram, metro, rail).
- **FR-002**: Riders MUST be able to filter the displayed routes by transport mode.
- **FR-003**: Authorized planners MUST be able to create a route by defining its
  ordered stops and path on a map, shaping the path with optional intermediate
  waypoints.
- **FR-004**: Authorized planners MUST be able to edit and delete existing routes.
- **FR-005**: Each route MUST have a unique identifier, a display name/number,
  and exactly one transport mode.
- **FR-006**: Each stop MUST have a name and a geographic location.
- **FR-007**: System MUST show a route's ordered stops and highlighted path when
  the route is selected.
- **FR-008**: System MUST show, for a selected stop, every route that serves it
  and its mode.
- **FR-009**: System MUST display a route's schedule when available, supporting
  both fixed departure times and service frequency (headway), including service
  days or operating hours.
- **FR-010**: Riders MUST be able to search for routes and stops by name or number.
- **FR-011**: System MUST distinguish routes by transport mode throughout the
  user interface.
- **FR-012**: Authorized planners MUST be able to shape a route's path between
  stops using intermediate waypoints.

### Key Entities *(include if feature involves data)*

- **Transport Mode**: bus, tram, metro, or rail; determines route coloring and
  labeling.
- **Route**: A named/numbered service line with a single mode, a display color,
  and an ordered path (stops joined by optional intermediate waypoints); relates
  to many stops through RouteStop.
- **Stop**: A named boarding/alighting point with a geographic location; related
  to many routes.
- **RouteStop**: The ordered position of a Stop on a Route, including its
  sequence number and scheduled arrival/departure times.
- **Schedule**: The timetable for a route, expressed as fixed departure times
  and/or a service frequency (headway), with the days of the week or operating
  hours on which service runs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A rider can locate and view any route within 30 seconds of
  opening the app.
- **SC-002**: A planner can map out and save a new route with at least five
  stops in under 5 minutes.
- **SC-003**: 100% of saved routes appear on the map with their stops in the
  correct order.
- **SC-004**: The full city map with all routes renders within 3 seconds on a
  typical broadband connection.
- **SC-005**: 90% of pilot users find a specific route or stop using search on
  their first attempt.
- **SC-006**: The app is usable on both desktop and mobile screen sizes without
  horizontal scrolling.

## Assumptions

- The city is a single, fixed operating area configured by the planner; the app
  serves one city at a time.
- Route data is entered manually by authorized planners using the on-map editor;
  no automated feed import is required for the initial release.
- No real-time vehicle positions are in scope; this release covers static routes
  and schedules only.
- Editing (create/update/delete) is restricted to authorized planner accounts;
  viewing is open to all pilot users.
- The system is delivered as a single responsive web application usable on
  desktop and mobile browsers (no separate native apps).

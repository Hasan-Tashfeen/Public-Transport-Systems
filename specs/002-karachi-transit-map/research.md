# Research: Karachi Transit Map

Phase 0 output for `/sp.plan`. Each decision resolves an unknown from the plan's
Technical Context. Format: Decision / Rationale / Alternatives considered.

## R1 — Basemap and Karachi viewport

- **Decision**: Keep Leaflet + OpenStreetMap raster tiles (standard OSM tile layer)
  with visible attribution. Initialize the map at downtown Karachi (approx lat
  24.8607, lng 67.0011) at zoom 12, and constrain panning to the Karachi bounding box
  (approx lon 66.75–67.45, lat 24.70–25.20; exact values env/configurable) so the view
  stays on the city.
- **Rationale**: Reuses the existing Leaflet/react-leaflet stack (YAGNI); OSM is the
  user-mandated source; a bound keeps a single-city product coherent and prevents
  "Sea View" style disambiguation from resolving to another country.
- **Alternatives considered**: MapLibre + vector tiles (new stack, heavier); Google
  Maps (API key/licensing, not requested); world-zoom OSM (off-scope, confusing).

## R2 — Place-autocomplete provider

- **Decision**: A backend proxy endpoint `GET /places?q=&limit=` that queries Photon
  (default `https://photon.komoot.io`) restricted to the Karachi bounding box and
  biased toward the city center, returning the top N (default 5) results.
- **Rationale**: Photon is explicitly designed for search-as-you-type and supports
  bounding-box filtering and location bias. The public Nominatim instance **prohibits
  autocomplete** and enforces ~1 request/second. Proxying through the backend lets us
  apply the bbox, cache results, throttle, and keep the frontend contract stable
  (no CORS coupling, easy to mock in tests).
- **Alternatives considered**: Direct public Nominatim (policy violation);
  self-hosted Photon/Nominatim (real ops burden, YAGNI for a pilot); bundled static
  place list (goes stale and cannot cover arbitrary Karachi place names).

## R3 — Geocoder integration pattern

- **Decision**: `place_service.search(query, limit)` with: minimum 2 characters;
  Karachi bbox filter; `lang=en`; a configurable polite `User-Agent`; a 3–5s request
  timeout; an in-memory TTL cache (24h) keyed by normalized `query|limit`; and
  graceful failure that returns an empty list (never a 5xx) so the editor falls back
  to manual stop entry.
- **Rationale**: Satisfies FR-006–FR-009 while protecting the public demo server and
  keeping the planner flow non-blocking. Deterministic, mockable behavior keeps tests
  fast.
- **Alternatives considered**: No cache (rate-limit/battery risk); frontend-direct
  calls (no cache, CORS and quota exposure); external managed geocoder (key/secret,
  not desired).

## R4 — Karachi BRT seed dataset

- **Decision**: Seed the operational Karachi Breeze lines — **Green Line** (the
  published 22-station sequence, Numaish → Abdullah Chowk Terminal) and **Orange Line**
  (Orangi / AO Chowk area) — as real, fully editable routes and stops, stored in
  `backend/src/seed/karachi_brt.json` and loaded idempotently when the database has no
  routes. Station names come from public Karachi Breeze information; coordinates are
  geocoded from OSM during implementation and recorded as approximate.
- **Rationale**: Satisfies FR-016 and gives a credible populated map on first run,
  while staying editable so planners correct any approximation.
- **Alternatives considered**: Empty start (rejected by the user); seeding all six
  lines including under-construction ones (out of scope; only Green and Orange are
  operational).

## R5 — Mode set and data migration

- **Decision**: Change `TransportMode` from `bus|tram|metro|rail` to
  `brt|bus|minibus`, and update the OpenAPI contract, backend schema, and frontend
  types together. No data migration: the pilot database is recreated and reseeded
  fresh.
- **Rationale**: Matches the agreed Karachi scope; v1 holds no production data, so a
  breaking enum change is safe and simpler than a compatibility shim.
- **Alternatives considered**: Keep tram/metro (they do not operate in Karachi);
  add BRT only (user also wants minibus).

## R6 — MTA-inspired design system

- **Decision**: Adopt the ui-ux-pro-max Swiss/Minimal flat style; body font **Inter**,
  signage/heading font **Barlow Condensed**; transit-blue primary `#2563EB`;
  MTA-derived mode colors — BRT green `#00933C`, bus blue `#0039A6`, minibus orange
  `#FF6319`; circular route bullets with route numbers; high-contrast black-on-white
  signage; no color-only indicators; ≥4.5:1 text contrast. Persist the direction as an
  override at `design-system/karachi-transit/pages/map.md`.
- **Rationale**: Directly matches the requested "style of New York transportation"
  and the skill's accessibility checklist. The generated Master file's neubrutalist
  display font and marketing "Product Demo + Features" page pattern are inappropriate
  for an interactive wayfinding tool, so the page override supersedes them.
- **Alternatives considered**: Neubrutalist Master defaults (too loud for wayfinding);
  a dark signage theme (hurts basemap legibility).

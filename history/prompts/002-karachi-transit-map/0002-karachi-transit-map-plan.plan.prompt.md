---
id: 0002
title: Karachi Transit Map Plan
stage: plan
date: 2026-09-13
surface: agent
model: deepseek-flash
feature: 002-karachi-transit-map
branch: 002-karachi-transit-map
user: unknown
command: /sp.plan
labels: [karachi, planning, openstreetmap, photon, mta-style, seed-data, contracts]
links:
  spec: specs/002-karachi-transit-map/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-karachi-transit-map/plan.md
  - specs/002-karachi-transit-map/research.md
  - specs/002-karachi-transit-map/data-model.md
  - specs/002-karachi-transit-map/contracts/openapi.yaml
  - specs/002-karachi-transit-map/quickstart.md
  - design-system/karachi-transit/MASTER.md
  - design-system/karachi-transit/pages/map.md
  - AGENTS.md
tests:
  - none (planning stage)
---

## Prompt

User invoked `/sp.plan` with the standard command body: "Setup: Run `.specify/scripts/powershell/setup-plan.ps1 -Json` ... Load FEATURE_SPEC and constitution ... Fill Technical Context ... Phase 0: Generate research.md ... Phase 1: Generate data-model.md, contracts/, quickstart.md ... Update agent context by running the agent script ... Re-evaluate Constitution Check post-design ... Stop and report." (Full command outline as provided.)

Context carried from the prior request: tailor v2 for Karachi, Pakistan; use
OpenStreetMap for the Karachi map; suggest real Karachi places while typing a stop
name (e.g., "Sea View"); MTA/New York transit-inspired UI; modes BRT/bus/minibus;
preload real BRT routes/stops.

## Response snapshot

Ran `setup-plan.ps1 -Json` (FEATURE_SPEC/IMPL_PLAN/SPECS_DIR resolved; plan template
copied). Read the spec and constitution. Filled `plan.md` (Technical Context,
Constitution Check PASS, project structure, post-design re-check). Phase 0: wrote
`research.md` with six decisions (OSM basemap + Karachi bbox; Photon backend proxy for
autocomplete since public Nominatim forbids autocomplete; geocoder caching/timeout/
fallback pattern; Karachi Breeze Green+Orange seed dataset; `brt|bus|minibus` mode
change with no migration; MTA-inspired Swiss design system). Phase 1: wrote
`data-model.md` (modes changed, optional `Stop.area`, transient `PlaceSuggestion`),
`contracts/openapi.yaml` (snake_case contract fixing v1 drift; new `GET /places`),
`quickstart.md`, and persisted the design system (`design-system/karachi-transit/MASTER.md`
plus a `pages/map.md` override for the MTA wayfinding direction). Ran
`update-agent-context.ps1 -AgentType opencode` (injected tech entries into AGENTS.md)
and corrected the AGENTS.md current-branch note.

## Outcome

- ✅ Impact: Full technical plan, research, data model, API contract, quickstart, and design system for Karachi v2; constitution passes pre- and post-design.
- 🧪 Tests: none (planning stage)
- 📁 Files: plan.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md, design-system/*, AGENTS.md
- 🔁 Next prompts: `/sp.tasks` to generate tasks.md, then `/sp.implement`.
- 🧠 Reflection: The main technical risk is third-party geocoder reliability; mitigating it with a backend proxy, Karachi bbox filtering, caching, and a manual-entry fallback keeps the planner flow robust.

## Evaluation notes (flywheel)

- Failure modes observed: The ui-ux-pro-max design-system auto-pick produced neubrutalist fonts and a marketing page pattern, unsuitable for a map tool; corrected via a page-specific override.
- Graders run and results (PASS/FAIL): PASS (Constitution Check passes; all Phase 0/1 artifacts present)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none

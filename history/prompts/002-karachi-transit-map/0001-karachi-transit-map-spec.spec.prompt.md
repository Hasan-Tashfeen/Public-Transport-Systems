---
id: 0001
title: Karachi Transit Map Spec
stage: spec
date: 2026-09-13
surface: agent
model: deepseek-flash
feature: 002-karachi-transit-map
branch: 002-karachi-transit-map
user: unknown
command: /sp.specify
labels: [karachi, transit, openstreetmap, mta-style, brt, place-autocomplete]
links:
  spec: specs/002-karachi-transit-map/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-karachi-transit-map/spec.md
  - specs/002-karachi-transit-map/checklists/requirements.md
tests:
  - none
---

## Prompt

okay now okay now lets start working on v2. now i want to tailor this specifically for the city of akrachi, pakistan. use openstreets map for the map of karachi. another thing i want to add is that when i start wrting a stop name, beneath it it should suggest actual stops with the same name, for example, when i start writing sea view, it should suggest the actal place sea view in karachi. use ui-ux-promax skill to make a beautiful ui in the style of newyork transportation.

Clarifying answers provided during the request:
- Transport modes: brt, bus, minibus
- Seed data: preload real BRT routes/stops
- Stop suggestions: live OpenStreetMap place search (recommended)

## Response snapshot

Started the v2 SDD flow with `/sp.specify`. Loaded the `ui-ux-pro-max` skill and ran
design-system/domain searches, which recommended a Minimal/Swiss style, a public
transit palette (transit blue #2563EB + per-line colors), and signage typography
(Inter / Barlow Condensed) — consistent with the requested MTA-inspired direction.
Created feature branch `002-karachi-transit-map` and `specs/002-karachi-transit-map/spec.md`
with 6 prioritized user stories, 18 functional requirements, Karachi-specific edge
cases, success criteria (including place-suggestion and contrast/legibility targets),
assumptions, and dependencies. Added `checklists/requirements.md` (all items pass).
Note: `create-new-feature.ps1` errored after branch creation on a PowerShell 5.1
`Join-Path` call while creating `history/prompts/<branch>/`; the branch and spec were
created and the prompts directory was created manually.

## Outcome

- ✅ Impact: Karachi-tailored v2 spec authored; feature branch 002 created; ready for planning.
- 🧪 Tests: none (spec stage)
- 📁 Files: specs/002-karachi-transit-map/spec.md, specs/002-karachi-transit-map/checklists/requirements.md
- 🔁 Next prompts: `/sp.clarify` (optional) or `/sp.plan`; then `/sp.tasks`; then `/sp.implement`.
- 🧠 Reflection: Asking the three scope questions (modes, seed data, suggestion source) before writing prevented rework; the utility script has a PS 5.1 bug worth avoiding.

## Evaluation notes (flywheel)

- Failure modes observed: `create-new-feature.ps1` uses `Join-Path` with 4 segments, unsupported in Windows PowerShell 5.1 → aborts before JSON output.
- Graders run and results (PASS/FAIL): PASS (spec + checklist written, all quality items pass)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): patch the script to nested `Join-Path` calls if reused.

---
id: 0003
title: Karachi Transit Map Tasks
stage: tasks
date: 2026-09-13
surface: agent
model: deepseek-flash
feature: 002-karachi-transit-map
branch: 002-karachi-transit-map
user: unknown
command: /sp.tasks
labels: [karachi, tasks, brt, place-autocomplete, mta-style, testing]
links:
  spec: specs/002-karachi-transit-map/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-karachi-transit-map/tasks.md
tests:
  - none (task generation)
---

## Prompt

User invoked `/sp.tasks` (standard command outline: run `check-prerequisites.ps1 -Json`, load plan.md/spec.md and optional design docs, generate tasks organized by user story with strict checklist format, dependencies, parallel examples, and implementation strategy; then create a PHR).

Context: Karachi v2 — OpenStreetMap map, live Karachi place suggestions for stop names, MTA-style UI, modes BRT/bus/minibus, preloaded real BRT routes.

## Response snapshot

Ran `check-prerequisites.ps1 -Json` (FEATURE_DIR resolves; docs available). Generated
`specs/002-karachi-transit-map/tasks.md` with 44 tasks across 9 phases: Setup (3),
Foundational (10), US1 (5), US2 (7), US3 (3), US4 (3), US5 (3), US6 (3), Polish (7).
Tests are included per Constitution Principle IV. Confirmed via grep that existing
route tests use `tram`/`metro`/`rail`, so task T012 explicitly updates them for the new
mode set; T011 disables seeding in tests for determinism.

## Outcome

- ✅ Impact: Executable, dependency-ordered task list for Karachi v2, organized by independently testable user story.
- 🧪 Tests: none at generation time; test tasks embedded in each story
- 📁 Files: specs/002-karachi-transit-map/tasks.md
- 🔁 Next prompts: `/sp.analyze` (optional) or `/sp.implement`.
- 🧠 Reflection: The breaking mode-enum change ripples into contract, schemas, frontend types, and existing tests — captured as explicit foundational tasks to avoid partial migrations.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS (all 44 tasks follow the checklist format with IDs, story labels, and file paths)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none

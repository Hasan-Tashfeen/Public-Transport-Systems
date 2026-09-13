---
id: 0002
title: Clarify Routes Schedule and Geometry
stage: spec
date: 2026-09-13
surface: agent
model: deepseek-v4-pro
feature: 001-public-transport-routes
branch: 001-public-transport-routes
user: unknown
command: /sp.clarify
labels: [clarify, spec, schedule, route-geometry]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-public-transport-routes/spec.md
tests:
  - none
---

## Prompt

/sp.clarify (no additional command input)

Clarification answers provided by user:
- Q1 (schedule model): Both fixed + frequency
- Q2 (route geometry): Stops + waypoints

## Response snapshot

Ran a structured ambiguity scan of the spec, asked two high-impact clarifying
questions (schedule representation and route path capture), and integrated both
answers into the spec: schedule supports fixed timetables and frequency/headway;
route paths are defined by ordered stops shaped with optional waypoints. Added a
Clarifications section, expanded FR-003/FR-009, added FR-012, and updated User
Stories 2 and 5 plus the Route and Schedule entities.

## Outcome

- ✅ Impact: Two ambiguities resolved and integrated; spec ready for planning.
- 🧪 Tests: none
- 📁 Files: specs/001-public-transport-routes/spec.md
- 🔁 Next prompts: Run `/sp.plan`.
- 🧠 Reflection: Remaining categories (scale/volume, auth mechanism, concurrent
  edits) were low-impact for a pilot and deferred to planning with defaults.

## Evaluation notes (flywheel)

- Failure modes observed: A stray `/sp.specify` (empty) was re-issued mid-session;
  confirmed with user to resume clarify rather than duplicate the feature.
- Graders run and results (PASS/FAIL): none
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none

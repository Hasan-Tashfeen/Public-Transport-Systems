---
id: 0001
title: Reconcile Agents Md With Repo
stage: general
date: 2026-09-13
surface: agent
model: deepseek-flash
feature: none
branch: 001-public-transport-routes
user: unknown
command: none
labels: [agents-md, tooling, documentation, onboarding]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - AGENTS.md
tests:
  - backend: pytest -q (19 passed)
  - backend: ruff check . (passed)
  - backend: mypy src (passed)
  - frontend: npm.cmd run test (6 passed)
  - frontend: npm.cmd run lint (passed)
  - frontend: npm.cmd run typecheck (passed)
---

## Prompt

Create or update `AGENTS.md` for this repository.

The goal is a compact instruction file that helps future OpenCode sessions avoid mistakes and ramp up quickly. Every line should answer: "Would an agent likely miss this without help?" If not, leave it out.

User-provided focus or constraints (honor these):


## How to investigate

Read the highest-value sources first:
- `README*`, root manifests, workspace config, lockfiles
- build, test, lint, formatter, typecheck, and codegen config
- CI workflows and pre-commit / task runner config
- existing instruction files (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`)
- repo-local OpenCode config such as `opencode.json`

If architecture is still unclear after reading config and docs, inspect a small number of representative code files to find the real entrypoints, package boundaries, and execution flow. Prefer reading the files that explain how the system is wired together over random leaf files.

Prefer executable sources of truth over prose. If docs conflict with config or scripts, trust the executable source and only keep what you can verify.

## What to extract

Look for the highest-signal facts for an agent working in this repo:
- exact developer commands, especially non-obvious ones
- how to run a single test, a single package, or a focused verification step
- required command order when it matters, such as `lint -> typecheck -> test`
- monorepo or multi-package boundaries, ownership of major directories, and the real app/library entrypoints
- framework or toolchain quirks: generated code, migrations, codegen, build artifacts, special env loading, dev servers, infra deploy flow
- repo-specific style or workflow conventions that differ from defaults
- testing quirks: fixtures, integration test prerequisites, snapshot workflows, required services, flaky or expensive suites
- important constraints from existing instruction files worth preserving

Good `AGENTS.md` content is usually hard-earned context that took reading multiple files to infer.

## Questions

Only ask the user questions if the repo cannot answer something important. Use the `question` tool for one short batch at most.

Good questions:
- undocumented team conventions
- branch / PR / release expectations
- missing setup or test prerequisites that are known but not written down

Do not ask about anything the repo already makes clear.

## Writing rules

Include only high-signal, repo-specific guidance such as:
- exact commands and shortcuts the agent would otherwise guess wrong
- architecture notes that are not obvious from filenames
- conventions that differ from language or framework defaults
- setup requirements, environment quirks, and operational gotchas
- references to existing instruction sources that matter

Exclude:
- generic software advice
- long tutorials or exhaustive file trees
- obvious language conventions
- speculative claims or anything you could not verify
- content better stored in another file referenced via `opencode.json` `instructions`

When in doubt, omit.

Prefer short sections and bullets. If the repo is simple, keep the file simple. If the repo is large, summarize the few structural facts that actually change how an agent should work.

If `AGENTS.md` already exists at `C:\Hasan\spec_driven_development`, improve it in place rather than rewriting blindly. Preserve verified useful guidance, delete fluff or stale claims, and reconcile it with the current codebase.

## Response snapshot

Investigated the SDD workspace and two-tier app, then reconciled the existing
`AGENTS.md` with the current repo. Verified every documented command by running
it: backend `pytest` (19 passed), `ruff check .`, `mypy src`; frontend
`npm.cmd run test` (6 passed), `lint`, `typecheck`. Key corrections/additions:
removed the stale "zero commits" claim (repo now has two commits pushed to
origin); documented that `npm` is blocked by PowerShell execution policy and
`npm.cmd` must be used; documented that the backend does not auto-load `.env`
and that `backend/.env.example` contains an uncommented Postgres `DATABASE_URL`
placeholder; added the no-`/api`-prefix routing rule; added the three-way REST
contract sync invariant; added a Deployment section pointing at `DEPLOY.md`;
and added the `## Active Technologies` / `## Recent Changes` /
`**Last updated**` markers so `update-agent-context.ps1` can inject.

## Outcome

- ✅ Impact: AGENTS.md is now verified against the running codebase; stale and misleading guidance removed.
- 🧪 Tests: backend pytest 19 passed, ruff/mypy clean; frontend vitest 6 passed, lint/typecheck clean.
- 📁 Files: AGENTS.md
- 🔁 Next prompts: Use `/sp.plan` or `/sp.implement` as needed; keep AGENTS.md accurate.
- 🧠 Reflection: Most value came from executing the documented commands rather than trusting prose; that surfaced the `npm.ps1` and `.env` gotchas.

## Evaluation notes (flywheel)

- Failure modes observed: Initial directory listing was flooded by `.opencode/node_modules`; tightened filters to project files.
- Graders run and results (PASS/FAIL): PASS (all documented commands verified)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none

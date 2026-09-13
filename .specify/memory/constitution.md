<!--
  ============================================================================
  SYNC IMPACT REPORT (constitution amendment)
  ============================================================================
  Version change: (unfilled template, no prior version) -> 1.0.0
  Bump rationale: Initial constitution established from the template; all
    principles, standards, and governance defined for the first time.

  Modified principles: none (all six newly defined)
  Added sections:
    - Core Principles (I - VI)
    - Code Quality Standards
    - Development Workflow
    - Governance
  Removed sections: none

  Templates requiring updates:
    [x] .specify/templates/plan-template.md - reviewed; "Constitution Check"
        gate is generic and populated from this file at plan time (no change).
    [x] .specify/templates/spec-template.md - reviewed; mandatory sections
        (User Scenarios, Requirements, Success Criteria) remain aligned.
    [x] .specify/templates/tasks-template.md - reviewed; task categorization
        (setup -> foundational -> user stories -> polish) already reflects the
        testing, quality, and security disciplines mandated here.
    [x] .opencode/command/*.md - reviewed; no stale agent-specific references.
    [x] Runtime docs - none present (no README/docs to update).

  Deferred TODOs: none.
  ============================================================================
-->

# Spec-Driven Development Constitution

## Core Principles

### I. Clean, Modular Code

Every unit of code MUST be small, focused, and organized into cohesive modules
with a single, clear responsibility. Modules MUST be independently testable,
reusable, and composable, with minimal and explicit dependencies between them.
A module's purpose MUST be obvious from its name and interface.

Rationale: Clean, modular code reduces cognitive load, limits the blast radius
of any change, and makes behavior independently verifiable.

### II. Separation of Concerns & Clear Interfaces

Modules MUST communicate through well-defined, explicit interfaces (function
signatures, APIs, or contracts) rather than shared mutable state or hidden side
effects. Inputs, outputs, and error conditions MUST be explicit. Business logic
MUST be kept separate from presentation, persistence, and I/O.

Rationale: Clear boundaries make components swappable, testable, and easier to
reason about in isolation.

### III. Readability & Self-Documenting Code

Names MUST be descriptive and unambiguous, conveying intent without requiring
comments. Comments MUST explain *why*, never *what*. Dead code, unused imports,
and misleading comments MUST NOT be committed. Code MUST read as its own
primary documentation.

Rationale: Code is read far more often than written; clarity is a non-negotiable
cost reduction.

### IV. Testing Discipline

Behavior MUST be verified with automated tests. Tests MUST be written first
(Red-Green-Refactor) where feasible. Contract changes, integration points, and
regression fixes MUST include a corresponding test. Tests MUST be fast,
deterministic, and independent of one another.

Rationale: Automated, first-class tests are the primary guard against
regression and the enabler of confident refactoring.

### V. Simplicity & YAGNI

Solutions MUST be the simplest that satisfy the current requirement. Speculative
features, premature abstraction, and unused generality MUST NOT be added. Each
dependency MUST be justified; prefer standard-library and battle-tested
libraries over bespoke code.

Rationale: Complexity not needed today is debt; it MUST be deferred until the
requirement actually exists.

### VI. Best Practices & Idiomatic Style

Code MUST follow the idiomatic conventions of its language and framework.
Static analysis, linting, and formatting MUST be configured and enforced in CI.
Security best practices MUST be followed: no hardcoded secrets, validated
inputs, least privilege. Established patterns MUST be preferred over
reinventing well-solved problems.

Rationale: Conventions lower the barrier for every contributor, and automated
gates prevent drift from agreed standards.

## Code Quality Standards

- A linter, formatter, and static analyzer MUST be configured and enforced as
  part of every change (see `/sp.plan` Phase 1 setup).
- No change MAY introduce secrets, tokens, or credentials; use environment
  configuration and documentation for such values.
- Changes MUST be the smallest viable diff; unrelated refactors MUST be split
  into separate changes.
- Duplication MUST be minimized; shared behavior MUST be extracted into a
  single, tested location.

## Development Workflow

- All work MUST follow the SDD pipeline in order: spec -> plan -> tasks ->
  implement (`.opencode/command/sp.*.md`).
- Requirements MUST be clarified and planned before implementation begins.
- Architecturally significant decisions MUST be documented as ADRs
  (`history/adr/`), proposed via `/sp.adr`, and recorded only with consent.
- Every change MUST record a Prompt History Record under `history/prompts/`.
- Changes MUST be reviewed for compliance with this constitution before merge.

## Governance

- This constitution supersedes all other practices and guidelines; where a
  conflict exists, the constitution prevails.
- Amendments MUST be made via a dedicated change with documented rationale and
  a version bump following the policy below.
- Versioning policy:
  - MAJOR: backward-incompatible removal or redefinition of a principle.
  - MINOR: new principle or materially expanded guidance.
  - PATCH: clarifications, wording, and non-semantic refinements.
- Compliance review: every `/sp.plan` MUST pass its Constitution Check gate
  before and after design; violations MUST be recorded and justified in
  Complexity Tracking, or rejected.

**Version**: 1.0.0 | **Ratified**: 2026-09-13 | **Last Amended**: 2026-09-13

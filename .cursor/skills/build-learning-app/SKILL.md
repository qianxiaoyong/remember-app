---
name: build-learning-app
description: Apply this project's AI coding rules when technically planning, implementing, modifying, testing, debugging, or reviewing code, dependencies, configuration, database migrations, API contracts, learning-pack contracts, mobile code, API code, or admin code for the local learning application. Do not use for product strategy or UI exploration that does not change code.
---

# Build Learning App

Use the repository rules as the source of truth. Keep changes small, direct, and verifiable.

## Locate the project rules

Find the repository root containing both:

- `docs/ai-rules/core-rules.md`
- `docs/superpowers/specs/2026-07-26-learning-app-mvp-architecture-design.md`

Stop and report the missing path if either file is unavailable. Do not reconstruct the rules from memory or from this Skill.

## Read required rules

Always read completely:

- `docs/ai-rules/core-rules.md`
- `docs/superpowers/specs/2026-07-26-learning-app-mvp-architecture-design.md`

Then read by task scope:

- For any source-code implementation, modification, refactor, or debug task, read `docs/ai-rules/code-shape.md`, `docs/ai-rules/boundaries.md`, and `docs/ai-rules/words.md`.
- For API, database, migration, authentication, payment, pack access, sync, file, secret, logging, or learning-pack work, also read `docs/ai-rules/data-and-security.md`.
- For behavior changes, tests, code review, or completion claims, also read `docs/ai-rules/testing-and-review.md`.
- For implementation plans, read every rule file that the planned tasks will trigger.

Read each selected file yourself before acting. Do not delegate rule interpretation.

## Execute the task

1. State the requested outcome in one sentence.
2. List acceptance conditions and allowed paths.
3. Inspect existing code and user changes before editing.
4. Choose the minimum correct implementation. Remove unnecessary layers, abstractions, duplicate validation, and speculative extension points.
5. Preserve server-side checks required for payment, authentication, pack access, and untrusted input.
6. Add or update tests before implementation when changing business behavior or fixing a defect.
7. Make only task-scoped edits.
8. Run the relevant repository checks.
9. Inspect the final diff for unrelated changes and rule violations.
10. Report changed files, verification evidence, remaining risks, and anything not run.

## Handle conflicts

Follow the precedence in `core-rules.md`. If a request conflicts with architecture, security, or data integrity, explain the exact conflict and smallest viable rule or architecture change. Wait for confirmation instead of silently bypassing the conflict.

Do not copy a known violation merely because existing code already contains it. Fix only the task-relevant area unless broader cleanup is explicitly approved.

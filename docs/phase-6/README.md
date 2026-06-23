# Phase 6: Teaching Briefs And Evidence Maps

Status: **Complete and deployed (2026-06-21).**

Phase 6 turns the instructor report into a versioned, evidence-linked teaching brief. The narrative remains useful for rapid interpretation, while consequential claims now sit beside deterministic evidence-map data that instructors can inspect and review.

## What Changed

- Reports persist a structured teaching-brief object alongside the AI-generated narrative.
- Briefs record schema, prompt, provider, model, generation time, and review-state metadata.
- The report opens with a formative-use boundary and a guide to observed evidence, AI inference, confidence, and instructor review.
- Purpose-specific Readiness, Activation, Consolidation, and Transfer Evidence Maps use `Evidence suggests ready`, `Evidence suggests gaps`, and `Evidence suggests review`.
- Each map item shows represented learners, opportunity coverage, conservative confidence, contradictory evidence, missing evidence, and review state.
- Map items link back to underlying evidence signals and learner records.
- Report generation separates observation, inference, and recommendation; limits quotations; and ties teaching moves to stored evidence.
- PDF exports reproduce the formative-use statement, review state, evidence map, evidence appendix, session purpose, generation time, and model/prompt metadata.
- Existing prose-only reports remain viewable, but must be regenerated before using the new structured PDF export.

## Data And Compatibility

Migration `20260620_complete_teaching_briefs` adds structured content and version metadata to `Report` without dropping or rewriting legacy report content. The Turso bootstrap and incremental-upgrade path add the same fields in deployed databases.

## Verification

- Prisma client generation, type checking, and linting pass.
- The current 62-test suite includes Phase 5 review closure plus Phase 6 contract, export, sanitization, migration, and browser-cleanup coverage.
- A real six-page teaching brief was exported successfully from the deployed application and inspected for readable hierarchy, provenance, review warnings, evidence details, and pagination.
- The closure pass removes duplicate narrative sections, internal IDs, Markdown markers, and repeated qualifications. A representative revised export is a valid tagged, JavaScript-free, two-page A4 PDF.
- The complete `pnpm check` gate covers dependency audit, tests, lint, type checking, and production build.

## Acceptance Result

Passed and deployed. The brief is explicitly formative, distinguishes inference from evidence, exposes provisional review state, preserves direct paths to inspect consequential evidence, and has been exported successfully from a real deployed session.

## Sequencing Note

The Phase 5 and Phase 6 implementation and operational gates are complete. PDF export, deployed evidence surfaces, authenticated stale-role behavior, mobile keyboard use, and external Anthropic key rotation were verified during Phase 7 closure.

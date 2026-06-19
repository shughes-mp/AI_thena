# Phase 3: Source Grounding And Assessment Protection

Status: **Complete (2026-06-19).**

## Source grounding

- Uploaded readings are segmented into stable passages with reading IDs, filenames, exact offsets, and deterministic passage IDs.
- Each learner turn retrieves only lexically relevant passages instead of placing the entire source set in the tutor prompt.
- Uploaded content is explicitly delimited as untrusted reference data. Prompt-injection instructions inside readings cannot redefine the model role or output contract.
- Tutor course-content claims must declare retrieved passage IDs. IDs are checked against the passages supplied for that turn and require lexical overlap with the response.
- Unsupported course-content claims are replaced before they reach the learner with an explicit source-insufficiency response.
- Every assistant message receives a `TutorGrounding` record with versioned retrieval, prompt, parser, source-set, status, and learner-citation policy metadata.
- Validated `TutorSourceCitation` records preserve the exact passage, source snapshot name, offsets, and stable ID.
- Conflicting or ambiguous retrieved passages must be represented as competing source evidence rather than resolved with silent outside knowledge.

## Learner citation policy

- Direct explanations, corrections, and expert modeling show compact source references to learners.
- Pure Socratic questions retain citations for instructor inspection without exposing a passage hint that may collapse the intended reasoning task.
- Instructors can inspect every stored citation on the Grounding & Protection page.

## Protected assessment enforcement

- Protected assessment text is technically excluded from the normal tutor prompt.
- Deterministic extraction-intent and content-overlap checks run before the model is called.
- A protected request receives a fixed coaching response that asks for the learner's claim and source-based reasoning without reproducing assessment text or answers.
- When source material overlaps a protected request, protection takes precedence.
- Every intervention writes a `ProtectedAssessmentAudit` record containing assessment IDs, trigger type, safe action, conflict state, policy version, and a non-sensitive explanation.
- Protected assessment text is not copied into audit records, learner messages, or instructor audit summaries.

## Instructor workspace

- The existing Purpose & Outcomes, Source Materials, Evidence Questions, Learner Link, Teaching Context, Interaction Style, Foundational Concept Map, and protected-material controls remain operational.
- The workspace now explains source-grounding readiness and protected-material behavior.
- A new `/instructor/[sessionId]/grounding` surface shows readiness, grounded and unsupported response counts, exact source citations, and protected-material interventions.
- The corresponding viewer-authorized API is `/api/sessions/[sessionId]/grounding-audit`.

## Data and compatibility

- Additive `TutorGrounding`, `TutorSourceCitation`, and `ProtectedAssessmentAudit` tables preserve existing sessions and messages.
- A Prisma migration and matching idempotent Turso bootstrap SQL are included.
- Existing messages remain readable but do not receive invented grounding metadata.

## Verification

- 21 tests pass, including fresh migration history, stable passage retrieval, invalid citation rejection, unsupported-source behavior, conflicting and incomplete source sets, uploaded prompt injection, protected-content isolation, multiple extraction attacks, source/protected conflict precedence, and ordinary-question false-positive coverage.
- TypeScript, ESLint, Git whitespace validation, and the Next.js production build pass.
- Browser verification confirms the home and learner-entry routes render meaningful content with no framework error overlay or application console errors.
- A live local API transaction confirmed that an answer-extraction request bypasses the model, returns coaching only, stores `protected_coaching` grounding state, and creates an `answer_extraction -> coaching_without_disclosure` audit event. The fixture was removed afterward.

## Known limits

- Passage retrieval and citation relevance currently use deterministic lexical matching. Semantic retrieval and calibrated entailment evaluation belong in later evaluation work.
- Protection uses conservative patterns and content overlap. It materially reduces disclosure risk but is not a formal exam-security guarantee.
- Development Clerk warnings during local browser verification are expected and unrelated to Phase 3 behavior.

## Acceptance gate

**Passed.** Course-content claims now require validated source passages, unsupported claims have an explicit safe path, protected answers are excluded and intercepted, and both behaviors are persisted, testable, and visible to instructors.

# Phase 8: Planning, Preview, And Anticipated Pivot Points

Status: **Implementation complete, locally verified, and authenticated-production-smoke-tested (2026-06-23).**

Phase 8 connects session design to the learner experience before a link is shared. Instructors can inspect what learners will encounter, resolve visible design risks, prepare participation options, and enter the session with bounded Guide and Conductor language already available.

## What Changed

- A dedicated `Plan & preview` workspace shows the learner orientation, exact opening question, session purpose, task, evidence questions, productive-struggle behavior, source-grounding message, protected-assessment behavior, intended output, and summary/reflection experience.
- Owners and editors can save a custom opening question, task instructions, and intended learner output. Viewers can inspect the same plan without editing it.
- The saved opening question is used in the actual learner opening exchange, while the task and intended output appear in learner orientation and the tutor system prompt.
- Nine deterministic quality checks identify recall-only questions, excessive question load, outcome coverage gaps, missing readings, ambiguous instructions, protected-answer overlap, missing outputs, missing shared-confusion plans, and incomplete participation planning.
- Instructors can generate or write anticipated pivots containing a likely wobble point, observable warning, diagnosis question, initial mode, Guide and Conductor phrases, escalation and release conditions, and intended output.
- Generated pivots are Guide-first. A shared reset is described only as a bounded option when the same consequential misunderstanding appears in at least two learners and 40% of the observed class.
- Participation planning covers quiet thinking time, peer exchange, alternative response channels, quieter voices, and a reset when participation remains concentrated.
- Planning changes are included in teaching-brief freshness, so an older brief must be refreshed before export.

## Data And Compatibility

Migration `20260622_add_session_planning_preview` adds nullable planning copy plus versioned JSON fields to `Session`. The Turso bootstrap and additive runtime-upgrade path contain the same fields and defaults, preserving existing sessions.

The planning contract is versioned as `planning-1.0.0`. Assessment text is used server-side for overlap checks but is never returned by the planning API.

## Verification

- Pure tests cover the complete learner preview, required quality warnings, and bounded Guide-first pivot generation.
- Contract tests cover the additive migration, viewer/editor authorization, planning interface, and delivery into the actual learner experience and tutor prompt.
- Prisma generation, TypeScript, lint, the full test suite, and the production build form the Phase 8 local quality gate.
- Authenticated production smoke testing confirmed the Plan & preview surface, saved learner-facing planning language, generated anticipated pivots, learner progress, grounding audit, evidence review, and teaching brief integration.

## Acceptance Result

The implementation gate passes: an instructor can preview the learner journey, see explicit session-design warnings, plan participation, and save plausible diagnosis, Guide, Conductor, escalation, release, and output language before learners begin. Production verification should confirm persistence, viewer restrictions, learner delivery, stale-brief behavior, and responsive keyboard use after deployment.

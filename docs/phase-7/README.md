# Phase 7: Facilitation Intelligence

Status: **Complete, deployed, and operationally verified (2026-06-22).**

Phase 7 helps an instructor decide whether to step back, offer one focusing prompt, or briefly reset shared work. It does not automate intervention. Deterministic rules produce a transparent recommendation that the instructor can inspect, change, reject, use, and evaluate.

## What Changed

- A deterministic rule engine recommends `Observer`, `Guide`, or `Conductor` only after inspectable evidence exists.
- Resolved or productive reasoning defaults to Observer; isolated unresolved confusion uses Guide; a consequential shared misunderstanding across at least two learners and 40% of the class can justify Conductor.
- Silence, delay, or missing evidence does not automatically trigger intervention.
- Every recommendation records learner/group/class scope, triggering evidence, a diagnosis question, rationale, one move, a ready-to-use phrase, confidence, escalation and release conditions, limitations, provenance, and review state.
- Live review displays recommendations alongside their evidence and polls for updates without taking action automatically.
- Owners and editors can accept a recommendation, choose another mode, edit the phrase, reject it with a reason, record the move used, and say whether it helped. Viewers remain read-only.
- Teaching briefs and PDF exports include the deterministic facilitation snapshot, evidence scope, phrase, provenance, review state, and step-back condition.
- Brief freshness now includes facilitation decisions, so an instructor change makes an older brief stale.
- Report prompts explicitly prevent the narrative model from inventing, changing, or escalating a facilitation mode.

## Data And Compatibility

Migration `20260622_implement_facilitation_intelligence` extends the existing `FacilitationRecommendation` record rather than creating a competing recommendation system. Existing recommendations are linked back to their sessions, and the Turso bootstrap/upgrade path adds the same fields safely in deployed databases.

The deterministic rules are versioned as `facilitation-2.0.0`. Teaching briefs are versioned as schema `teaching-brief-1.1.0` and prompt `teaching-brief-prompt-2.2.0`, so older briefs must be refreshed before they can represent Phase 7 decisions.

## Model-Assistance Boundary

Phase 7 deliberately stops at the roadmap's deterministic evaluation gate. The LLM may summarize and explain supplied evidence, but it does not select or escalate Observer, Guide, or Conductor. Personalized model-assisted phrasing should be considered only after instructor judgments have been collected and compared with rule behavior.

## Verification

- Unit tests cover Observer, Guide, Conductor, sparse-evidence restraint, class-scope thresholds, persistence, authorization, instructor controls, report integration, and the LLM authority boundary.
- Prisma generation, lint, type checking, the full test suite, and the Next.js production build pass locally.
- The public landing page and instructor authentication redirect load without console errors.
- Authenticated production sessions exercised Observer, Guide, and Conductor recommendations, including class-scope triggering evidence.
- Instructor acceptance, mode override, rejection with rationale, edited phrasing, move recording, and helpfulness persistence passed.
- Viewer access remained read-only, and authenticated desktop/mobile keyboard and color-independent-label checks passed.
- Refreshed teaching briefs and PDF exports preserved facilitation pivots, provenance, review state, and release conditions.
- The previously exposed Anthropic credential was confirmed revoked and replaced.

## Acceptance Result

Passed at the implementation and operational gates. Every generated recommendation is proportionate to the stored evidence, linked to its trigger signals, remains under instructor control, and includes an explicit condition for stepping back. The deployed workflow and exports were exercised with authenticated real sessions. Model-assisted mode selection remains intentionally disabled.

## Operational Result

Phase 7 is deployed and ready for the next roadmap phase. Its production smoke test covered deterministic mode selection, inspectable provenance, instructor decisions and recorded outcomes, role restrictions, accessibility, stale-brief refresh, and PDF export. Early rule recommendations were compared with instructor choices; model-assisted mode selection remains gated pending broader calibration and pedagogical evaluation.

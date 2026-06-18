# Recommendation Traceability Matrix

## Purpose

This matrix maps the complete higher-rigor recommendation set to current implementation, future dependency, accountable role, and verification method. “Owner” identifies the required discipline, not a named individual.

| Recommendation area | Current status | Current implementation | Principal gap | Next dependency | Owner role | Verification |
|---|---|---|---|---|---|---|
| Product positioned as teaching, learning, and formative assessment | Implemented but unverified | Landing page, metadata, README | No naive-reader validation; behavior still tutor-centric | Product contract | Product + research | First-impression comprehension study |
| Consistent canonical terminology | Partially implemented | Revised visible copy | README, prompts, APIs, types, and database diverge | Terminology contract | Product + engineering | Automated term scan plus UI/content audit |
| Landing page explains audience, workflow, guardrails, and outputs | Implemented but unverified | `/` | No usability evidence | Product contract | Product/design | Naive-reader test |
| Learning evidence session creation | Implemented but unverified | `/instructor` | No explicit governance/evidence-readiness contract | Product/evidence contracts | Product/design | Instructor task test |
| Purpose & Outcomes setup | Partially implemented | Workspace `GoalsSection` | Outcomes are free text; evidence opportunities not structured | Evidence contract | Pedagogy + engineering | Outcome-to-opportunity fixture tests |
| Source materials as evidence base | Partially implemented | Upload, prompt source-only rule | No passage citations or provenance | Evidence schema | Engineering/AI | Citation accuracy tests |
| Evidence questions | Partially implemented | Checkpoints, lint, suggestions | Not linked to first-class evidence records | Evidence schema | Pedagogy + engineering | Question-to-evidence integration tests |
| Protected assessment materials | Partially implemented | Separate table and prompt rule | Protection is primarily prompt-based | Governance and threat model | Security + AI | Adversarial leakage suite |
| Teaching context calibration | Partially implemented | Course context, learning goal, stance, prerequisite map | No systematic validation of effects | Product/pedagogy contract | Pedagogy + AI | Controlled prompt behavior tests |
| Interaction style | Implemented but unverified | Directed/mentor prompt branch | No evaluation or facilitation relationship | Facilitation contract | Pedagogy + AI | Scenario comparison |
| Foundational concept map | Partially implemented | Generated prerequisite map | JSON string; model-generated; no review workflow | Evidence/review model | Pedagogy + engineering | Instructor review and parser tests |
| Learner orientation | Implemented but unverified | Learner entry/chat orientation | No privacy/retention disclosure | Governance contract | Product + legal/privacy | Learner comprehension study |
| Productive struggle | Partially implemented | Hint ladder, attempt logic, self-explanation | Heuristics and prompts unvalidated | Learning-interaction contract | Pedagogy + AI | Conversation fixture suite |
| Retrieval and self-explanation | Partially implemented | Purpose prompts and tags | Tag reliability not tested | Prompt versioning and fixtures | Pedagogy + AI | Structured dialogue tests |
| Source-grounded learner reasoning | Partially implemented | System prompt | No citation or grounding measurement | Provenance model | AI + engineering | Grounding benchmark |
| Misunderstanding repair | Partially implemented | Diagnostic pipeline and soft revisits | Model inference lacks first-class evidence review | Provenance/review model | AI + pedagogy | Instructor-labeled evaluation set |
| Confidence calibration | Partially implemented | Self-report prompts and phrase matcher | English-only phrase heuristic; no calibration metric | Evidence contract | Research + AI | Calibration study |
| Transfer | Partially implemented | After-class prompt | No validated transfer measure | Evidence-opportunity model | Pedagogy/research | Novel-context rubric study |
| Learner progress without countdown pressure | Implemented but unverified | Session progress label | Exact exchange limit remains a control mechanism | Learner UX evaluation | Design + pedagogy | Usability study |
| Purpose-neutral learner summary | Implemented but unverified | End-session prompt and summary UI | No citations, review, or learner correction | Provenance and learner review | AI + design | Summary fidelity tests |
| Learner reflection after summary | Absent | None | No reflection capture | Learner interaction phase | Pedagogy + engineering | End-to-end learner test |
| Live review signals | Partially implemented | Monitor and student summary API | Underlying engagement labels overclaim; no evidence object | Evidence contract | Product + engineering | Signal traceability test |
| “No current review signals” rather than “on task” | Visible copy implemented | Monitor | API still classifies `on_task` | Observation/inference contract | Product + AI | Terminology and behavior audit |
| Learning outcome evidence | Partially implemented | `LOAssessment`, cards, report tags | Prose evidence, status mismatch, no opportunity model | Provenance model | Pedagogy + engineering | Instructor-rated validity study |
| Process evidence | Partially implemented | JSON `processMetrics` | Not typed or directly inspectable | Evidence schema | Engineering | Schema and UI tests |
| Misunderstanding patterns | Partially implemented | Aggregate route and dashboard | Model clustering, mutable label override, limited review | Stable evidence/review IDs | AI + engineering | Cluster quality and override tests |
| Teaching brief | Partially implemented | Report generator and report/analysis pages | Prose-first, no review status, no how-to-read guidance | Provenance and review model | Product + engineering | Evidence-link completeness test |
| “How to read this brief” | Absent | None | Interpretation guidance missing | Teaching brief redesign | Product + pedagogy | Instructor comprehension test |
| Evidence excerpts beside every major signal | Partially implemented | Representative excerpts in patterns; prose summaries | Inconsistent and not linked by IDs | Citation model | Engineering/design | UI completeness assertion |
| Confidence explanations | Partially implemented | Confidence labels | Rationale usually absent | Evidence contract | AI + design | Confidence explanation audit |
| Evidence maps | Partially implemented | Report prose parser and cards | No structured evidence, denominator, contradictions, or review state | Teaching brief structure | Engineering + design | Map-to-evidence drill-down test |
| Instructor approve/revise/reject workflow | Partially implemented | Cluster override; recommendation action | No universal signal review or history | Review data model | Engineering + product | State-transition and audit tests |
| Filters by outcome/evidence/review/learner | Partially implemented | View modes and limited page controls | No unified filter model | Structured evidence APIs | Design + engineering | Instructor retrieval task test |
| Exportable teaching briefs with disclaimers | Partially implemented | PDF export | Missing review state, evidence appendix, versions | Teaching brief/provenance | Engineering + governance | Export content test |
| Observer / Guide / Conductor framework | Absent | Guide-like chat behavior only | No explicit modes or contract | Facilitation contract | Pedagogy + product | Expert scenario review |
| Signal-to-pivot mapping | Absent | Generic recommendations | No deterministic mode rules | Provenance plus facilitation contract | Pedagogy + engineering | Rule table tests |
| Recommended Pivot in live review | Absent | None | No pivot object or UI | Facilitation engine | Engineering + design | End-to-end live scenario test |
| Facilitation recommendations in teaching brief | Absent | Generic timed moves | No mode, scope, escalation, or release | Facilitation engine | Pedagogy + AI | Instructor agreement study |
| Ready-to-use instructor phrases | Partially implemented | Recommendation scripts | Not mode-linked or evidence-rule constrained | Facilitation engine | Pedagogy + AI | Usability and appropriateness review |
| Anticipated pivot points | Absent | None | No planning model/UI | Facilitation engine | Product + pedagogy | Session-planning task test |
| Learner experience preview | Absent | Instructor can infer configuration only | No rendered preview | Stable learner flow | Design + engineering | Preview parity test |
| Privacy and data governance language | Absent in product | README limitations only | No in-app disclosure or policy controls | Governance contract | Privacy/legal + product | Disclosure audit |
| Retention, access, and deletion controls | Absent | Cascades exist; no user controls | No policy or ownership | Authentication/governance | Security + engineering | Authorization and deletion tests |
| Instructor authentication and ownership | Absent | IDs/access code only | Critical access-control gap | Identity architecture | Security + engineering | Security test suite |
| Prompt/model versioning | Absent | Central model aliases only | Evidence cannot be reproduced by prompt version | Provenance schema | AI + engineering | Record completeness test |
| Longitudinal reviewed evidence | Absent | Single-session views | No opportunity-aware history | Provenance, review, governance | Research + engineering | Longitudinal fixture tests |
| Local evaluation metrics | Absent | Diagnostic logs only | No validity or usefulness evaluation | Evaluation design | Research + data | Pilot protocol |
| Equity and communication-style evaluation | Absent | None | Misclassification risk unknown | Evaluation design | Research + accessibility | Stratified benchmark |
| Institutional governance controls | Absent | Environment configuration only | No retention/model/feature controls | Governance and identity | Security + product | Institutional readiness review |

## Implementation Ownership Summary

- **Product/design:** purpose clarity, workflow, interpretation, previews, and usability.
- **Pedagogy/research:** evidence validity, learning interactions, facilitation rules, and evaluation.
- **Engineering:** data model, APIs, review workflow, provenance, filters, exports, and compatibility.
- **AI engineering:** prompts, classifiers, grounding, confidence, clustering, and versioning.
- **Security/privacy:** authentication, authorization, protected materials, retention, deletion, and institutional controls.
- **Accessibility:** inclusive interaction, communication-style bias, and non-color status communication.


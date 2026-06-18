# Phase 0 Risk Register

Scales:

- Impact: Critical, High, Medium, Low
- Likelihood: High, Medium, Low
- Priority reflects combined urgency and roadmap dependency.

| ID | Risk | Impact | Likelihood | Evidence in baseline | Required mitigation | Target phase |
|---|---|---|---|---|---|---|
| R-01 | No instructor authentication or session ownership | Critical | High | `Session` has no owner; APIs accept IDs without caller identity | Add identity, ownership, authorization, and audit tests before real learner use | 1, 2, 9 |
| R-02 | Learner records accessible by identifier | Critical | Medium | Student detail/end/chat routes rely on `studentSessionId` possession | Use scoped signed access or authenticated learner/session capability; prevent cross-session access | 2, 9 |
| R-03 | No first-class evidence provenance | Critical | High | Evidence summaries and reports are prose; no exchange/source citation entities | Add evidence signal and citation model before advanced recommendations | 1, 2 |
| R-04 | Formative evidence can be interpreted as grading | High | High | 0-4 scale, Proficient/Advanced labels, `LOAssessment` model | Define evidence contract, opportunity scope, disclaimers, and instructor review | 1, 2, 5 |
| R-05 | “Mastery” is inferred from sparse heuristics | High | High | Two criteria can set `TopicMastery.mastered` | Replace with bounded topic evidence; validate criteria; migrate carefully | 1, 2, 5 |
| R-06 | Engagement labels overinterpret learner behavior | High | High | Model emits on-task/shallow/disengaged/off-topic/hostile; wait time raises concern | Separate observation from inference; remove motivation claims; validate signals | 1, 2, 5 |
| R-07 | Protected assessment safety is prompt-based | Critical | Medium | Protected content is appended to the same model prompt with a non-disclosure instruction | Threat model, technical isolation where possible, adversarial leakage tests, clear limitation | 3, 9, 11 |
| R-08 | Uploaded source prompt injection | High | Medium | Full uploaded text is inserted into model context | Delimit and sanitize untrusted content; instruct hierarchy; adversarial tests | 3, 11 |
| R-09 | Source grounding is asserted but not measurable | High | High | Full readings supplied; no passage-level citations or grounding records | Passage citations, unsupported-claim path, grounding benchmark | 2, 3, 11 |
| R-10 | Prompt and model outputs are not reproducible | High | High | Evidence records lack prompt/model version | Persist prompt, model, policy, and parser versions | 1, 2 |
| R-11 | Report parser is brittle | High | Medium | UI parses prose section headings and tags | Move to structured report object; retain backward-compatible parser | 2, 6 |
| R-12 | Outcome status type mismatch | High | High | TypeScript exposes legacy statuses while generator emits 0-4 statuses | Canonical schema and migration tests | 1, 2 |
| R-13 | JSON strings hide schema drift | Medium | High | Many structured fields stored as text | Introduce typed objects/tables with validation and migrations | 2 |
| R-14 | Handwritten Turso schema can diverge from Prisma | High | Medium | `db.ts` duplicates schema SQL | Establish one migration source or automated parity test | 2 |
| R-15 | Diagnostic pass is asynchronous and can lag/fail silently | Medium | High | Chat schedules diagnostic work after response | Expose processing state, retries, idempotency, and failure telemetry | 2, 5 |
| R-16 | Cluster overrides are keyed by mutable label | Medium | High | `MisconceptionOverride.clusterLabel` | Stable pattern/evidence identity and review history | 2, 5 |
| R-17 | Confidence inference is language-fragile | Medium | High | Fixed English phrase matcher | Structured self-report, multilingual testing, and calibrated confidence semantics | 4, 11 |
| R-18 | Learner identity is an unverified free-text name | High | High | Name entry creates session; no identity link | Define intended anonymity/identity model and privacy controls | 1, 9 |
| R-19 | No in-app privacy, retention, or contestability disclosure | Critical | High | Learner sees formative review but no data policy | Add disclosure and controls before broader deployment | 1, 9 |
| R-20 | No rate limiting or abuse controls found | High | Medium | Public AI endpoints and access-code entry | Add rate limits, quotas, abuse monitoring, and cost safeguards | 9 |
| R-21 | PDF export omits provenance and review state | Medium | High | Export renders report prose only | Add formative disclaimer, citations, versions, and review state | 6, 9 |
| R-22 | Color categories may imply false precision and create accessibility issues | Medium | High | Green/yellow/red evidence maps | Add text, evidence drill-down, denominator, confidence, and non-color cues | 6 |
| R-23 | Observer/Guide/Conductor recommendations could automate poor interventions | High | Medium | Framework absent; future feature risk | Start rule-based, require evidence and override, evaluate expert agreement | 7, 11 |
| R-24 | Recommendation scripts may not fit context | Medium | Medium | Generated timed moves from aggregate patterns | Link to evidence, expose confidence, allow editing, capture outcomes | 5, 7 |
| R-25 | Learner summary may misrepresent conversation | Medium | High | Model-generated prose without citations or learner correction | Add evidence links, limitation copy, and learner reflection/correction | 4 |
| R-26 | Extremely limited automated test coverage | High | High | One model-alias test; no test script | Build unit, integration, E2E, adversarial, and evaluation suites | All phases |
| R-27 | Lint baseline fails | Medium | High | 10 errors and 12 warnings on initial 2026-06-18 run | **Mitigated in Phase 0.5:** source issues fixed; lint now passes | Complete |
| R-28 | `scratch/` is untracked but included by lint | Low | High | Two initial lint errors originated there | **Mitigated in Phase 0.5:** intentional lint exclusion; folder remains untracked | Complete |
| R-29 | Existing README overstates or uses superseded concepts | Medium | High | Tutor, mastery, engagement, and assessment language remains | Update after Phase 1 contracts, not before | 1 |
| R-30 | No monitoring/observability for AI quality or failures | High | High | Diagnostic logs store raw response but no quality dashboard or retry state | Add structured telemetry with privacy controls | 2, 11 |
| R-31 | Raw diagnostic responses may contain sensitive learner content | High | High | `DiagnosticLog.rawResponse` persisted | Data minimization, retention, redaction, and access controls | 9 |
| R-32 | Longitudinal aggregation could create pseudo-precision | High | Medium | Not yet implemented; roadmap proposal | Require reviewed evidence, opportunity context, and no composite learner score | 10 |

## Immediate Blockers Before Real Educational Deployment

The following are release blockers rather than ordinary backlog items:

1. Authentication, authorization, and session ownership
2. Learner privacy, retention, and disclosure
3. Protected assessment leakage evaluation
4. Evidence provenance for consequential signals
5. Instructor review for evidence used in decisions
6. Removal or qualification of unsupported mastery/engagement claims
7. Meaningful behavioral and adversarial test coverage

## Risk Review Cadence

- Review at the end of every roadmap phase.
- Add a risk whenever a new inference or data type is introduced.
- Do not close a risk based only on revised copy.
- Record evidence of mitigation and the test that guards against regression.

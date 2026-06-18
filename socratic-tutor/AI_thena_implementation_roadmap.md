# AI_thena Step-by-Step Implementation Roadmap

## Purpose

This roadmap converts the complete AI_thena higher-rigor recommendation set into an ordered implementation programme.

The sequence is designed to:

- Preserve pedagogical integrity
- Avoid building polished interfaces on weak evidence foundations
- Prevent incompatible terminology, prompts, APIs, and data models
- Make every consequential AI claim inspectable and reviewable
- Deliver useful vertical slices throughout implementation
- Keep instructor judgment authoritative
- Prevent formative evidence from becoming an automated grade or diagnosis

The governing principle is:

> Build trustworthy, traceable evidence before sophisticated recommendations.

## Intended Product

AI_thena is an AI-assisted teaching, learning, and formative assessment system.

Its complete operating loop should be:

1. An instructor defines the learning purpose, source materials, learning outcomes, evidence questions, teaching context, and protected assessment materials.
2. A learner engages in source-grounded dialogue requiring retrieval, interpretation, evidence, explanation, revision, and transfer.
3. AI_thena records provisional evidence of learner thinking, including misunderstanding patterns, confidence calibration, process evidence, and outcome-related evidence.
4. Every consequential signal remains traceable to learner dialogue and source material.
5. The instructor reviews, corrects, approves, or rejects those signals.
6. AI_thena recommends proportionate teaching moves, including Observer, Guide, or Conductor pivots where appropriate.
7. The instructor uses a teaching brief, live review signals, and planning tools to decide what to do next.
8. Learners receive a formative summary and an opportunity to reflect.
9. The institution can govern retention, access, privacy, and appropriate use.
10. AI_thena is evaluated against actual instructional usefulness, not proxy metrics alone.

## Delivery Rules

These rules apply across every phase.

### 1. Use Vertical Slices

Do not complete all backend work and then all frontend work. Build complete, testable pathways.

The first recommended slice is:

> One misunderstanding signal -> linked learner exchange -> linked source passage -> confidence explanation -> instructor review control -> suggested Guide move.

After that pathway works, extend the same architecture to other signal types.

### 2. Separate Observation From Inference

AI_thena must distinguish:

- Observation: what a learner actually wrote or did
- Evidence: the relevant exchange or source passage
- Inference: what the evidence may suggest
- Recommendation: what an instructor might do
- Decision: what the instructor accepts or chooses

These categories must not be collapsed into a single AI-generated verdict.

### 3. Preserve Backward Compatibility Deliberately

Existing sessions, reports, and database records may use legacy language or structures such as `mastery`, `score`, or heatmap headings.

Each migration must define:

- Whether existing data will be transformed
- Whether legacy fields remain internally supported
- How old reports continue to render
- How new and old prompt outputs are parsed
- When compatibility code can be removed

### 4. Require Evidence For Consequential Claims

No important signal, evidence level, misunderstanding pattern, or facilitation recommendation should appear without inspectable support.

### 5. Prefer Rule-Based Logic Before Model-Generated Judgment

Use deterministic rules for early facilitation pivots, confidence display, and escalation thresholds. Introduce model-generated recommendations only after the rules and evidence contracts are testable.

### 6. Treat Completed Copy Changes As Provisional

The existing terminology revision is a strong first pass, but every item marked complete in the recommendation document must be behaviorally audited. Renaming a feature does not prove that its underlying logic matches the new meaning.

## Roadmap Overview

| Phase | Objective | Depends on |
|---|---|---|
| 0 | Baseline, audit, and programme control | None |
| 1 | Product, terminology, evidence, and governance contracts | Phase 0 |
| 2 | Evidence provenance and review data model | Phase 1 |
| 3 | Source grounding and protected assessment enforcement | Phases 1-2 |
| 4 | Learner interaction and reflection | Phases 1-3 |
| 5 | Instructor evidence review surfaces | Phases 2-4 |
| 6 | Teaching brief and evidence maps | Phase 5 |
| 7 | Observer / Guide / Conductor facilitation intelligence | Phases 2, 5-6 |
| 8 | Session planning, preview, and anticipated pivots | Phases 4 and 7 |
| 9 | Governance, privacy, and institutional controls | Begins in Phase 1; completed after core flows |
| 10 | Longitudinal evidence and cross-session patterns | Phases 2, 5 and 9 |
| 11 | Evaluation, calibration, pilots, and release | Runs throughout; formal release gate after Phase 10 |

---

## Phase 0: Establish The Baseline

Status: **Complete (2026-06-18).** Deliverables are recorded in `docs/phase-0/` and `tests/fixtures/phase-0-session-scenarios.json`.

### Objective

Create an authoritative picture of what the application currently says, stores, infers, generates, and exposes.

### Tasks

- [x] Inventory all learner-facing routes and states.
- [x] Inventory all instructor-facing routes and states.
- [x] Inventory all AI prompts, structured tags, parsers, and fallbacks.
- [x] Inventory all database models related to messages, confidence, misconceptions, outcomes, engagement, reports, and topic status.
- [x] Inventory all exports and generated summaries.
- [x] Inventory API contracts used by instructor dashboards.
- [x] Search for legacy terms including `tutor`, `score`, `mastery`, `on_task`, `rubric projection`, `heatmap`, and unqualified `assessment`.
- [x] Map every recommendation-document checklist item to its implementation location.
- [x] Mark each recommendation as one of: implemented and verified, implemented but unverified, partially implemented, absent, or intentionally deferred.
- [x] Record existing tests and identify untested critical paths.
- [x] Establish representative test fixtures for pre-class, in-class preparation, in-class reflection, and after-class transfer sessions.

### Deliverables

- Current-state architecture map
- Terminology gap inventory
- Prompt and parser inventory
- Data-model inventory
- Recommendation traceability matrix
- Test-fixture pack
- Risk register

### Acceptance Gate

Every proposal in `AI_thena_higher_rigor_recommendations.md` has an owner, implementation location, dependency, and verification method.

Gate result: **Passed for baseline purposes.** The traceability matrix provides owner roles, implementation locations, dependencies, statuses, and verification methods. This does not imply the product risks are resolved.

## Phase 0.5: Repository Hygiene

Status: **Complete (2026-06-18).**

- [x] Create a dedicated `codex/phase-1-contracts` implementation branch.
- [x] Add a repeatable `npm test` command.
- [x] Remove the Node module-type warning.
- [x] Keep untracked `scratch/` tooling outside production lint scope.
- [x] Fix all production source lint errors and warnings.
- [x] Verify lint, tests, TypeScript, and production build.
- [x] Prepare Phase 0 artifacts and fixtures for a dedicated commit.

Verification result: `npm run lint`, `npm test`, `npx tsc --noEmit`, and `npm run build` all pass.

---

## Phase 1: Define The Product And Evidence Contracts

Status: **Complete (2026-06-18).** The binding contract set is recorded in `docs/phase-1/`.

### Objective

Define what AI_thena means and what it is allowed to claim before changing deeper behavior.

### 1.1 Product Contract

Formally define:

- AI_thena's purpose
- Intended instructor and learner audiences
- Formative uses
- Prohibited or unsupported uses
- The role of instructor judgment
- The meaning of a learning evidence session
- The meaning of a teaching brief
- The boundaries between learning support and assessment

### 1.2 Terminology Contract

Create one canonical terminology module or specification covering:

- `AI_thena`
- `learning session` and `learning evidence session`
- `teaching brief`
- `review signals`
- `learning outcome evidence`
- `misunderstanding patterns`
- `evidence map`
- `evidence of thinking`
- `dialogue evidence`
- `formative signal`
- `evidence level`
- `process evidence`
- `Observer`, `Guide`, and `Conductor`
- `Recommended Pivot`

Define prohibited or qualified terms:

- `score`
- `mastery`
- `on task`
- `precision`
- `rubric projection`
- `AI tutor`
- unqualified `assessment`

### 1.3 Evidence Contract

Define the minimum structure of every consequential AI output:

- Signal type
- Claim text
- Evidence references
- Relevant learning outcome or evidence question
- Relevant source-material references
- Confidence
- Confidence rationale
- Contradictory or missing evidence
- Scope: learner, group, or class
- Status: provisional, instructor-approved, revised, or rejected
- Creation model and prompt version
- Creation timestamp

Define evidence levels without treating them as grades:

- 0: no observed evidence
- 1: beginning evidence
- 2: developing evidence
- 3: proficient evidence within observed opportunities
- 4: advanced evidence within observed opportunities

Explicitly state that an evidence level is:

- Limited to observed dialogue
- Dependent on the opportunities presented
- Formative
- Incomplete as a measure of learner ability
- Subject to instructor review

### 1.4 Facilitation Contract

Define:

- Observer criteria
- Guide criteria
- Conductor criteria
- Evidence required for each recommendation
- Rules for moving between modes
- Scope of the recommendation
- How the instructor overrides a recommendation
- How quickly control should be released after a reset

### 1.5 Governance Contract

Decide:

- What learner data is stored
- Why it is stored
- How long it is retained
- Who can access it
- How deletion works
- How protected assessment content is handled
- Whether data can be used for model improvement
- Which institutional controls are required
- Which uses are prohibited

### Deliverables

- [x] Product contract
- [x] Terminology specification
- [x] Evidence schema specification
- [x] Evidence-level rubric
- [x] Facilitation-mode specification
- [x] Governance and data-use specification
- [x] Versioning policy for prompts and evidence logic

### Acceptance Gate

Product, engineering, pedagogy, and governance decisions use one shared vocabulary and one evidence model.

Gate result: **Passed at contract level.** Phase 2 must implement these contracts in the provenance, citation, review, authorization, and versioning data architecture before new consequential inference features are added.

---

## Phase 2: Build Evidence Provenance And Instructor Review Foundations

### Objective

Make every significant AI-generated signal traceable and reviewable.

### 2.1 Data Model

Add or normalize entities for:

- Evidence signal
- Evidence citation
- Dialogue exchange reference
- Source-material citation
- Learning outcome link
- Evidence-question link
- Confidence and rationale
- Contradictory evidence
- Instructor review
- Instructor revision
- Instructor rejection reason
- Prompt/model version
- Facilitation recommendation

Avoid destructive renames of legacy database fields until migration and compatibility behavior are established.

### 2.2 API Contracts

Create typed APIs that return:

- Signal plus citations
- Signal confidence plus explanation
- Review state
- Review history
- Related learner dialogue
- Related source passage
- Related outcome or evidence question
- Recommended teaching move, when available

### 2.3 Review Workflow

Implement instructor controls:

- Approve
- Revise
- Reject
- Mark as acceptable interpretation
- Flag for class discussion
- Add contextual note
- Record why the AI signal was changed

### 2.4 First Vertical Slice

Implement one complete misunderstanding pathway:

1. Detect a possible misunderstanding.
2. Link it to the learner exchange.
3. Link it to the relevant source passage.
4. Explain confidence and uncertainty.
5. Display contradictory or missing evidence.
6. Allow instructor approval, revision, or rejection.
7. Generate one evidence-linked Guide recommendation.
8. Record the instructor decision.

### Verification

- Unit tests for evidence schema and status transitions
- API contract tests
- Migration tests
- Authorization tests
- UI tests for approve, revise, reject, and undo
- Tests that a signal cannot be rendered as consequential without citations

### Acceptance Gate

An instructor can trace, understand, correct, and audit the first complete AI signal pathway.

---

## Phase 3: Enforce Source Grounding And Assessment Protection

### Objective

Make source grounding and protected assessment behavior operational rather than merely described in copy.

### 3.1 Source Grounding

- [ ] Associate AI claims with uploaded source passages.
- [ ] Require source support for course-content claims.
- [ ] Provide an explicit unsupported-by-source response path.
- [ ] Show source citations to instructors.
- [ ] Decide when source citations should be visible to learners.
- [ ] Test conflicting, incomplete, and ambiguous source sets.
- [ ] Prevent arbitrary outside knowledge from silently overriding instructor materials.

### 3.2 Protected Assessment Materials

- [ ] Separate protected assessment content from learner-visible source context.
- [ ] Prevent direct answer disclosure.
- [ ] Permit coaching on reasoning without reproducing protected answers.
- [ ] Add adversarial tests for answer extraction.
- [ ] Add instructor-visible audit records when protected material influences coaching.
- [ ] Define behavior when a source and protected answer conflict.

### 3.3 Instructor Workspace

Verify and complete:

- Purpose & Outcomes
- Source Materials
- Evidence Questions
- Learner Link
- Evidence-readiness status summary
- Source-grounding explanation
- Protected-assessment explanation
- Teaching context
- Interaction style
- Foundational concept map

### Acceptance Gate

Course-content claims are source-grounded, protected answers are not exposed, and both behaviors are testable and visible to the instructor.

---

## Phase 4: Strengthen The Learner Learning Experience

### Objective

Ensure the core conversation produces genuine learning and useful evidence without becoming an answer engine or hidden grading experience.

### 4.1 Learner Orientation

Verify that learners understand:

- What AI_thena is
- What it will ask them to do
- That it uses instructor-provided materials
- That it will not simply provide answers
- That their instructor may review the conversation formatively
- That thoughtful reasoning matters more than speed
- That AI-generated summaries may be incomplete

### 4.2 Productive-Struggle Policy

Implement and test a consistent help ladder:

1. Ask for current thinking.
2. Ask for relevant evidence.
3. Narrow the task.
4. Add a constraint or comparison.
5. Offer a hint.
6. Model a limited reasoning move.
7. Give a direct clarification only when pedagogically justified.
8. Ask the learner to restate or apply the corrected idea.

### 4.3 Learning Behaviors

Ensure purpose-aware support for:

- Retrieval
- Self-explanation
- Interpretation
- Evidence use
- Argument evaluation
- Misunderstanding repair
- Confidence calibration
- Transfer
- Synthesis

### 4.4 Learner Summary And Reflection

Implement:

- Purpose-neutral summary language
- Topics covered
- Where the learner showed strong understanding
- What is worth revisiting
- A question to carry forward
- Explicit AI limitation language
- A learner reflection step

Suggested reflection prompts:

- What changed in your thinking?
- Which claim can you now support with evidence?
- What remains uncertain?
- What will you try next?
- Is any part of the AI-generated summary inaccurate or incomplete?

Allow the learner to annotate or contest the summary before instructor review where appropriate.

### 4.5 Learner Experience Verification

Test:

- Direct answer requests
- Repeated help requests
- Unsupported claims
- Confident misunderstandings
- Low-confidence correct reasoning
- Attempts to extract protected answers
- Very short responses
- Long but superficial responses
- Accessibility and mobile behavior
- Different communication styles

### Acceptance Gate

Learner dialogue consistently asks for cognitive work, adapts help proportionately, produces inspectable evidence, and communicates its formative purpose clearly.

---

## Phase 5: Build Instructor Evidence Review Surfaces

### Objective

Turn instructor dashboards into auditable evidence-review tools rather than automated judgment displays.

### Recommended Implementation Order

1. Evidence excerpts beside each major signal
2. Source-material citations
3. Confidence explanation
4. Contradictory or missing evidence
5. Instructor approve, revise, and reject controls
6. Review history
7. Filters and sorting
8. Aggregate patterns
9. Export behavior

### 5.1 Live Review Signals

Complete the monitoring language and behavior:

- `Live review signals`
- `No current review signals detected`
- `May need follow-up`
- `Possible engagement concern`
- `Outcome evidence`
- `Topic evidence`

Do not infer motivation, attention, or engagement from silence alone.

For each live signal show:

- What was observed
- Why it was flagged
- How uncertain the inference is
- Relevant exchange
- How long ago it occurred
- Suggested instructor action, if any

### 5.2 Learning Outcome Evidence

For every evidence-level display include:

- Evidence level
- Evidence summary
- Confidence
- Process evidence
- Misunderstanding signals
- Evidence questions addressed
- Hint support used
- Number and diversity of opportunities
- Instructor review state

### 5.3 Misunderstanding Patterns

Implement:

- Pattern-level evidence excerpts
- Learner-level instances
- Source links
- Prevalence with denominator
- Resolution evidence
- Confidence
- Instructor overrides
- Mark as acceptable
- Flag for class discussion
- Review evidence

Avoid treating prevalence as severity or correctness certainty.

### 5.4 Filters

Add filters for:

- Learning outcome
- Evidence question
- Evidence strength
- Confidence
- Review state
- Unresolved signal
- Learner
- Session purpose
- Facilitation mode, after Phase 7

### Acceptance Gate

An instructor can inspect and correct every consequential signal without opening raw database records or trusting a summary blindly.

---

## Phase 6: Complete Teaching Briefs And Evidence Maps

### Objective

Create a concise, evidence-linked instructor synthesis that supports action without implying diagnostic certainty.

### 6.1 Teaching Brief Structure

Implement:

- Session snapshot
- How to read this brief
- Suggested teaching moves
- Purpose-specific evidence map
- What the evidence suggests learners can build on
- Where the evidence suggests follow-up
- Misunderstanding patterns
- Per-learner notes
- Learning outcome evidence
- AI and formative-use disclaimer
- Instructor review status

### 6.2 How To Read This Brief

Explain:

- What evidence was observed
- What AI_thena inferred
- What confidence means
- What the brief does not establish
- How instructors can inspect sources
- How to approve, revise, or reject signals
- Why the brief should not be used as an automated grade

### 6.3 Evidence Maps

Use:

- Readiness Evidence Map
- Activation Evidence Map
- Consolidation Evidence Map
- Transfer Evidence Map

Use labels:

- Evidence suggests ready
- Evidence suggests gaps
- Evidence suggests review

Each map item must link to:

- Underlying learner evidence
- Number of learners represented
- Opportunity coverage
- Confidence
- Contradictory evidence
- Instructor review state

### 6.4 Report Generation

Update prompts and structured outputs to:

- Tie recommendations to actual evidence
- Avoid generic advice
- Separate observation, inference, and recommendation
- Distinguish resolved and unresolved signals
- Use representative quotes sparingly
- Produce structured evidence objects, not prose-only claims
- Preserve prompt and model version information

### 6.5 Export

Exported briefs must include:

- Formative-use statement
- AI-generated statement
- Generation time
- Instructor review state
- Evidence references or an appendix
- Session purpose
- Model/prompt version where institutionally required

### Acceptance Gate

The teaching brief is concise, actionable, inspectable, and impossible to mistake for an unreviewed summative assessment.

---

## Phase 7: Implement Facilitation Intelligence

### Objective

Help instructors decide how much to intervene, when to intervene, and how to preserve learner thinking.

### 7.1 Start With Deterministic Rules

Implement initial rules such as:

| Signal | Initial mode | Rationale |
|---|---|---|
| Learners are producing usable reasoning and building on evidence | Observer | Preserve learner control |
| Isolated confusion or stalled reasoning | Guide | Provide a focusing prompt without supplying the answer |
| Active but shallow reasoning | Guide | Add evidence, comparison, justification, or counterargument constraints |
| No usable output yet | Guide | Help learners converge on a claim or decision |
| Widespread shared misunderstanding | Conductor | Brief whole-class clarification is proportionate |
| Learners cannot state the task or next step | Conductor | Relaunch the task clearly |
| Participation remains concentrated after a nudge | Conductor | Reset the participation structure |

### 7.2 Recommended Pivot Object

Every pivot recommendation should contain:

- Mode: Observer, Guide, or Conductor
- Scope: learner, group, or class
- Triggering evidence
- Diagnosis question
- Rationale
- Suggested move
- Ready-to-use phrase
- Confidence
- Escalation condition
- Release condition
- Instructor review state

### 7.3 Live Review Integration

For live sessions show:

- Recommended Pivot
- Why this mode is suggested
- Evidence supporting it
- One proportionate move
- Whether to observe, guide, or reset
- When to step back again

Do not automatically trigger instructor interventions.

### 7.4 Teaching Brief Integration

For each major class-level pattern, include:

- Recommended facilitation mode
- Evidence scope
- Suggested phrase
- Whether the issue is isolated or widespread
- What would justify escalation or de-escalation

### 7.5 Instructor Controls

Allow instructors to:

- Accept the pivot
- Select a different mode
- Edit the suggested phrase
- Record the move used
- Record whether it helped
- Explain why a recommendation was inappropriate

### 7.6 Model-Assisted Recommendations

Only after rule-based behavior is evaluated:

- Use a model to personalize phrases and moves.
- Keep mode selection constrained by evidence and explicit rules.
- Compare model recommendations against instructor judgments.
- Never conceal whether a recommendation came from rules or model inference.

### Acceptance Gate

Every facilitation recommendation is proportionate, evidence-linked, instructor-controlled, and includes a clear release condition.

---

## Phase 8: Add Planning, Preview, And Anticipated Pivot Points

### Objective

Connect evidence and facilitation logic to session design before learners begin.

### 8.1 Learner Experience Preview

Allow instructors to preview:

- Learner orientation
- Opening question
- Session purpose
- Evidence questions
- Help behavior
- Source-grounding message
- Protected-assessment behavior
- Summary and reflection experience

### 8.2 Anticipated Pivot Points

For each session generate or let instructors define:

- Likely wobble point
- What to watch for
- Diagnosis question
- Initial facilitation mode
- Guide phrase
- Conductor phrase
- Escalation condition
- Release condition
- Intended usable output for debrief

### 8.3 Session Design Quality Checks

Check for:

- Recall-only evidence questions
- Too many questions for available exchanges
- Outcomes without evidence opportunities
- Missing source support
- Ambiguous task instructions
- Protected assessment overlap
- No planned usable output
- No planned response to likely widespread confusion

### 8.4 Participation Planning

Where relevant, prompt instructors to prepare:

- Individual thinking time
- Pair or group exchange
- Alternative response channels
- A plan for quieter voices
- A reset if participation remains concentrated

### Acceptance Gate

An instructor can preview the learner experience and enter a session with plausible pivot points and phrases already prepared.

---

## Phase 9: Complete Governance, Privacy, And Institutional Controls

### Objective

Make appropriate use, data handling, and human authority operational across the system.

This work begins in Phase 1 and proceeds alongside all other phases.

### 9.1 Learner Transparency

Communicate:

- What data is collected
- Why the conversation is collected
- Who can review it
- What AI_thena infers
- What AI_thena does not establish
- How long data is retained
- Whether the learner can access or contest summaries

### 9.2 Access And Retention

Implement:

- Role-based access
- Session-level authorization
- Retention settings
- Deletion workflows
- Export controls
- Audit logs
- Protected assessment access restrictions

### 9.3 Institutional Controls

Consider:

- Configurable retention policies
- Required formative-use notices
- Model/provider controls
- Data-region requirements
- Institutional review records
- Feature flags for experimental inference types
- Ability to disable learning-outcome evidence levels

### 9.4 Prohibited Uses

Explicitly prohibit or technically constrain:

- Fully automated grading
- Unreviewed high-stakes decisions
- Claims of general intelligence or ability
- Behavioral diagnosis from silence or response time alone
- Hidden learner surveillance
- Training on learner data without appropriate authority

### Acceptance Gate

Data handling, access, retention, review authority, and prohibited uses are documented, visible, and enforced.

---

## Phase 10: Add Longitudinal And Cross-Session Evidence

### Objective

Help instructors identify persistent patterns without converting provisional evidence into pseudo-precise learner scores.

### Preconditions

Do not begin until:

- Individual-session provenance is reliable.
- Instructor review states are stored.
- Governance and retention decisions are implemented.
- Evidence opportunities are represented.

### Features

- Persistent misunderstanding patterns
- Learning-outcome evidence across sessions
- Confidence calibration over time
- Repeated support dependence
- Transfer across contexts
- Instructor-approved pattern history
- Change in evidence after targeted teaching moves

### Design Requirements

- Show the underlying sessions and evidence.
- Separate reviewed from unreviewed signals.
- Represent missing opportunities explicitly.
- Do not average evidence levels into a single learner score.
- Do not compare learners without adequate contextual qualification.
- Allow instructors to suppress invalid historical signals.

### Acceptance Gate

Longitudinal views preserve context, provenance, opportunity coverage, and instructor review.

---

## Phase 11: Evaluation, Calibration, Pilots, And Release

### Objective

Determine whether AI_thena improves learning and instructional decision-making in practice.

Evaluation starts in Phase 0 and continues throughout implementation.

### 11.1 Technical Evaluation

Measure:

- Source-grounding accuracy
- Citation correctness
- Protected-answer leakage
- Structured-output validity
- Parser reliability
- Authorization correctness
- Data-retention correctness
- Prompt-version reproducibility

### 11.2 Evidence Evaluation

Measure:

- Signal precision and recall against instructor review
- False positives and false negatives
- Inter-rater agreement
- Confidence calibration
- Contradictory-evidence handling
- Learning-outcome evidence validity
- Misunderstanding clustering quality

### 11.3 Pedagogical Evaluation

Measure:

- Quality of learner reasoning
- Use of evidence
- Self-explanation quality
- Misunderstanding repair
- Transfer
- Productive struggle
- Answer-seeking and over-reliance
- Whether direct help arrives too early or too late

### 11.4 Facilitation Evaluation

Measure:

- Agreement between AI_thena and instructor mode choices
- Appropriateness of Observer recommendations
- Appropriateness of Guide prompts
- Proportionality of Conductor resets
- Whether suggested phrases are usable
- Whether the recommended move restored momentum
- Whether control was released at the right time

### 11.5 Experience And Equity Evaluation

Measure:

- Learner comprehension of the system's role
- Instructor comprehension of formative evidence
- Instructor workload
- Time to find and act on a signal
- Accessibility
- Differences across communication styles
- Differences across learner groups
- Whether quiet, concise, multilingual, or non-standard responses are misclassified

### 11.6 Outcome Evaluation

Measure:

- Whether teaching decisions changed
- Whether those changes were useful
- Whether instructors trusted the right outputs
- Whether learners improved on subsequent tasks
- Whether AI_thena reduced or increased instructor workload
- Whether evidence maps and pivots improved class preparation

### Pilot Sequence

1. Internal fixture-based testing
2. Expert educator review
3. Small supervised pilot
4. Instructor calibration study
5. Learner usability study
6. Limited real-course deployment
7. Cross-course evaluation
8. Institutionally governed release

### Release Gate

AI_thena should not be treated as production-ready for consequential educational use until:

- Evidence claims are traceable.
- Instructor review works end to end.
- Learner disclosure is clear.
- Protected assessment leakage is acceptably controlled.
- Facilitation recommendations are demonstrably proportionate.
- Known limitations are documented.
- Evaluation results support the intended use.

---

## Recommended Vertical Slice Sequence

Use these slices to deliver value while preserving the phase dependencies.

### Slice 1: Reviewable Misunderstanding Signal

- One learner misunderstanding
- Dialogue and source evidence
- Confidence explanation
- Instructor approve/revise/reject
- One Guide recommendation

### Slice 2: Reviewable Learning Outcome Evidence

- One outcome
- Opportunity count
- Evidence excerpts
- Process evidence
- Evidence level and limitations
- Instructor review

### Slice 3: Class-Level Pattern

- Cluster related reviewed signals
- Show prevalence and denominator
- Show contradictory evidence
- Recommend Guide or Conductor based on scope

### Slice 4: Live Review Signal

- Time-sensitive evidence
- Clear uncertainty
- Recommended pivot
- Ready-to-use phrase
- Instructor response capture

### Slice 5: Evidence-Linked Teaching Brief

- Session snapshot
- How to read
- Evidence map
- Suggested teaching moves
- Review status

### Slice 6: Planning Loop

- Anticipated pivot
- Learner preview
- Instructor phrase
- Compare anticipated and observed patterns

### Slice 7: Longitudinal Pattern

- Reviewed signals across sessions
- Opportunity-aware trend
- Evidence drill-down
- Teaching-move outcome

## Cross-Cutting Testing Strategy

Every phase should add tests at the appropriate layers.

### Unit Tests

- Evidence rules
- Confidence rules
- Facilitation-mode rules
- Parsers
- Prompt-output normalization
- Review-state transitions

### Integration Tests

- Chat -> diagnostic -> evidence record
- Evidence record -> instructor review
- Reviewed evidence -> teaching brief
- Evidence pattern -> facilitation recommendation
- Protected content -> safe coaching response

### End-To-End Tests

- Instructor creates session
- Learner joins and completes dialogue
- Instructor reviews evidence
- Instructor changes an AI signal
- Teaching brief reflects reviewed state
- Export includes limitations
- Learner summary and reflection work

### Adversarial Tests

- Prompt injection in source files
- Protected-answer extraction
- Unsupported external claims
- Confident but incorrect learner statements
- Sparse learner responses
- Contradictory source materials
- Attempts to use evidence levels as grades
- Misleading engagement inferences

### Visual And Accessibility Tests

- Desktop and mobile layouts
- Long evidence excerpts
- Long learner and outcome names
- Keyboard navigation
- Screen-reader labels
- Color-independent evidence-map status
- No overlapping controls or truncated uncertainty text

## Programme-Level Definition Of Done

The recommendation programme is complete only when all of the following are true.

### Purpose And Language

- [ ] A naive reader can explain AI_thena's purpose accurately.
- [ ] Terminology is consistent across UI, prompts, APIs, exports, and documentation.
- [ ] No visible feature implies automated grading or complete learner diagnosis.

### Learner Experience

- [ ] Learners understand the role of AI_thena and instructor review.
- [ ] Conversations require reasoning rather than merely answer retrieval.
- [ ] Help is graduated and proportionate.
- [ ] Learners receive a formative summary and reflection opportunity.

### Evidence Integrity

- [ ] Every consequential signal is traceable to evidence.
- [ ] Confidence and uncertainty are explained.
- [ ] Missing and contradictory evidence are represented.
- [ ] Evidence opportunities are recorded.

### Instructor Authority

- [ ] Instructors can approve, revise, reject, and annotate AI signals.
- [ ] Reviewed and unreviewed outputs are visibly distinct.
- [ ] Teaching briefs reflect instructor review states.

### Facilitation Intelligence

- [ ] Observer, Guide, and Conductor are explicitly defined.
- [ ] Recommended pivots are evidence-linked and proportionate.
- [ ] Instructors can override pivots.
- [ ] Every pivot includes an escalation or release condition.
- [ ] Anticipated pivot points are supported during planning.

### Trust And Governance

- [ ] Source grounding is operational.
- [ ] Protected assessment answers are not disclosed.
- [ ] Privacy, retention, access, and deletion controls are implemented.
- [ ] Prohibited uses are documented and constrained.

### Evaluation

- [ ] Technical reliability is measured.
- [ ] Evidence accuracy is calibrated against instructors.
- [ ] Pedagogical effects are evaluated.
- [ ] Equity and accessibility are evaluated.
- [ ] Real instructional usefulness is demonstrated.

## Immediate Next Actions

The next implementation cycle should not begin with a new dashboard component. It should begin with the following ordered actions:

1. Create the recommendation traceability matrix.
2. Complete the terminology, evidence, facilitation, and governance contracts.
3. Design the provenance and instructor-review data model.
4. Select one misunderstanding fixture for the first vertical slice.
5. Implement that slice end to end.
6. Evaluate it with an instructor before extending the architecture.

That sequence creates the reusable foundation for every later proposal in the recommendation set.

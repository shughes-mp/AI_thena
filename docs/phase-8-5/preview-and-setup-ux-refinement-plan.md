# Phase 8.5 — Setup + Preview UX Refinement Plan

## Objective

Refine the instructor setup and preview experience so it feels:

- coherent
- progressively disclosed
- low-stress for a naive first-time instructor
- visually consistent across steps
- explicit about what is required before sharing
- clearer about what the preview page is for

This plan is intentionally focused on UX architecture and interface clarity, not new product scope.

---

## Core design decisions

### 1. Use one setup progress system, not two

Keep the large numbered setup cards.

Remove the smaller duplicate boxes beneath the `Setup / Run / Review` pills.

Reason:

- they repeat the same information
- they create visual noise
- they dilute the importance of the primary setup sequence
- a naive user does not need two parallel navigation systems

### 2. Standardize all step headers

All required setup sections should use the same header pattern:

- `Step 1: Task & learning outcomes`
- `Step 2: Learning materials`
- `Step 3: Core questions`
- `Step 4: Preview & share`

Each step should use the same:

- type scale
- weight
- spacing
- chevron placement
- status placement

### 3. Standardize step status language

Every required step should show one clear status, using the same system:

- `Needs setup`
- `Ready`
- `Locked` (only when truly unavailable yet)

Avoid having one step say `Configured` while others use different logic.

### 4. Keep optional content collapsed by default

Optional planning and safeguard content should sit behind one parent collapsed section.

Inside that parent, each optional subsection may also be collapsible if needed.

Reason:

- keeps the primary flow clean
- protects naive users from overload
- still preserves depth for expert instructors

### 5. Move launch logic later in the setup flow

The learner link and sharing action should appear only in the Step 4 area, after the preview has been checked.

Reason:

- better matches instructor mental model
- reduces premature “copy link” behavior
- makes completion logic more legible

---

## Target setup architecture

### A. Top of page

Keep:

- session title
- phase pill (for example `Pre-class`)
- one short sentence describing what this screen is for
- `Setup / Run / Review` top-level navigation

Fix:

- the active pill must not render as visually broken or blacked out
- active state should be intentional, accessible, and visually aligned with the product palette

### B. Primary setup progress cards

Keep one row of 4 cards only:

1. Task
2. Materials
3. Questions
4. Preview & share

Each card should show:

- step number
- short title
- one-line purpose
- current state (`Needs setup`, `Ready`, or `Locked`)
- optional visual completion cue when ready

Recommended cues:

- neutral border for inactive
- accent border for current
- green tick or clear “Ready” treatment for complete
- muted locked treatment for Step 4 until prerequisite steps are complete

These cards become the only visible setup progress summary on the page.

### C. Required setup content

Below the cards, show the four required setup sections in order:

#### Step 1. Task & learning outcomes

Contents:

- `Where are you in the learning cycle?`
- `What learning outcomes do you want to assess?`
- recall-quality prompt for weak/review-needed learning outcomes

Move out:

- optional learner-facing framing text

Visual change:

- keep all Step 1 content visually nested inside one shared white section container
- treat the section as one coherent block, not a disconnected heading plus separate interior content

#### Step 2. Learning materials

Contents:

- upload source material
- file list
- source status

#### Step 3. Core questions

Contents:

- evidence questions
- suggestion helpers
- recall-only warning for weak questions

#### Step 4. Preview & share

Contents:

- preview CTA
- completion message
- learner link only once unlocked
- copy link action only once preview has been checked

This section should not visually feel like a different system from Steps 1–3.

---

## Optional setup architecture

Below the required setup area, place one collapsed parent section:

`Optional planning & safeguards`

Inside it:

1. `Teaching context & learner message`
2. `Source use safeguards`
3. `Protected assessment materials`
4. `Session data and deletion`

Guidelines:

- all optional items should feel grouped under one umbrella
- avoid making optional sections look equal in priority to required setup
- use restrained summaries when collapsed

---

## Preview page UX architecture

## Goal

A naive instructor should land on the preview page and immediately understand:

1. what learners will see
2. whether the session is ready to share
3. what needs improvement before launch
4. what optional deeper planning is available

Right now, the preview page contains useful content, but too much of it competes at the same visual level.

### Target preview structure

#### 1. Page header

Keep:

- page title
- short explanation of why preview matters
- primary actions: back to setup, save plan

Reduce:

- duplicate navigation summaries that repeat information already visible elsewhere

#### 2. Top navigation within preview

Keep top-level `Setup / Run / Review` nav.

Within preview, use the same setup cards row for continuity, but simplify any redundant counts or status summaries that are not helping decisions.

If a summary strip remains, it should answer only:

- how many items are ready
- how many need attention

No extra decorative metrics.

#### 3. Main preview split: “What learners will see” + “Is this ready?”

This should remain the primary above-the-fold layout.

Left column:

- orientation
- opening question
- purpose
- task
- core questions

Right column:

- readiness checks only
- each item should clearly say either:
  - `Ready`
  - `Needs attention`
- each flagged item should include one concrete fix

#### 4. Planning basics

Keep, but demote beneath readiness.

This section should answer:

- what exact opening question will be asked?
- what task instructions are learners receiving?
- what usable output do we want?

It should feel like refinement, not a second competing preview.

#### 5. Stuck-point planning

Keep as optional planning support.

This should sit after core preview and readiness, not before.

It should be introduced as:

- optional
- useful when the instructor wants more control
- not required before sharing

#### 6. Participation planning

Keep as optional and lower priority than readiness.

It is useful, but not part of the “is this session launchable?” question.

#### 7. End-of-page clarity

The bottom of the preview page should end with a clear closeout state, for example:

- `Ready to return to setup and share`
- or `Still needs attention before sharing`

The user should not reach the bottom wondering what the page wanted from them.

---

## Specific refinements to implement

## Setup page

1. Remove the redundant small setup boxes under the top pills.
2. Keep only the large numbered setup progress cards.
3. Fix active pill styling so the current section is clear and intentional.
4. Standardize Step 1–4 headings and status treatments.
5. Change Step 1 to one visually unified white nested block.
6. Add equivalent status treatment to Steps 2–4.
7. Keep optional sections grouped inside one collapsed parent.
8. Keep learner link only inside Step 4 after preview is checked.

## Step quality prompts

9. Add a learning-outcome quality prompt parallel to the recall-only evidence-question prompt:

> This may be recall-only. Stronger evidence questions usually ask learners to explain, compare, apply, or point to evidence.

Adapt wording for learning outcomes so it clearly refers to the outcome field rather than the question field.

## Preview page

10. Remove or simplify redundant summary elements.
11. Preserve one strong “learner sees this” area.
12. Preserve one strong “is this ready?” area.
13. Demote planning basics below readiness.
14. Demote stuck-point planning below readiness.
15. Demote participation planning below readiness.
16. End with one clear launch-readiness conclusion.

---

## Recommended implementation order

### Pass 1 — Setup cleanup

1. Remove redundant small setup boxes
2. Fix top-level pill styling
3. Standardize step header typography and statuses
4. Unify Step 1 visual container
5. Ensure Step 4 matches Step 1–3 structurally

### Pass 2 — Optional section cleanup

6. Group optional sections under one parent collapse
7. Improve collapsed summaries and labeling
8. Keep danger-zone / deletion clearly separated at the very bottom

### Pass 3 — Quality guidance

9. Add learning-outcome quality prompt
10. Align evidence-question and outcome-quality messaging

### Pass 4 — Preview architecture

11. simplify preview header and summary
12. preserve learner preview as the primary left column
13. tighten readiness checks into a cleaner right column
14. demote planning basics below readiness
15. move stuck-point planning below core launch checks
16. move participation planning below stuck-point planning
17. add clear end-of-page readiness conclusion

### Pass 5 — Smoke test

18. verify setup flow as a first-time instructor
19. verify preview/share unlock logic
20. verify optional sections remain collapsed by default
21. verify status language is consistent
22. verify preview page communicates “what this page is for” within 5 seconds

---

## Success criteria

This pass is successful when:

- a naive instructor can identify the required setup path at a glance
- there is only one visible setup progress system
- the setup screen reads in a natural top-to-bottom order
- optional content does not compete with required content
- the preview page clearly separates:
  - learner-facing experience
  - launch readiness
  - optional instructional planning
- the share link appears only at the right moment
- the interface feels cleaner, calmer, and more intentional


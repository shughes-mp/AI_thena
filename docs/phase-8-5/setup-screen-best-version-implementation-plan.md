# Setup Screen “Best Version” Implementation Plan

This document translates the agreed UX direction into a concrete implementation plan for the instructor setup screen.

It is intended to be the authoritative build spec for the next setup-flow refinement pass.

## Objective

Rework the instructor setup screen so it feels:

- clear to a first-time instructor;
- logically sequenced;
- progressively disclosed;
- visually unified;
- calm rather than overwhelming;
- consistent with the rest of the product.

The setup screen should behave like a guided launch flow:

1. define the learner task;
2. add the learning materials;
3. define the core questions;
4. preview and share;
5. optionally open deeper planning and safeguards.

## Core constraints already agreed

- Use only the top cards as the readiness/progress system.
- Do not keep a separate readiness panel or duplicate checklist.
- Use Option B for preview and launch:
  - merge preview and sharing into one final required step.
- Keep optional content collapsed by default.

## Current implementation touchpoints

The current setup experience is primarily assembled from:

- [src/app/instructor/[sessionId]/page.tsx](C:/Users/seanh/Desktop/Sean/Claude Cowork Projects (MP)/Art Learning Tutor/socratic-tutor/src/app/instructor/[sessionId]/page.tsx)
- [src/components/instructor/session-workspace-panels.tsx](C:/Users/seanh/Desktop/Sean/Claude Cowork Projects (MP)/Art Learning Tutor/socratic-tutor/src/components/instructor/session-workspace-panels.tsx)

Key component boundaries:

- `WorkspaceHeader`
- `GoalsSection`
- `ReadingsSection`
- `QuestionsSection`
- `TeachingContextSection`
- `AssessmentsSection`

## Final recommended setup architecture

The setup page should be structured in this exact order.

### 1. Header

Contents:

- breadcrumb;
- session title;
- session purpose pill;
- one-line setup guidance.

Purpose:

- orient the user immediately;
- clearly indicate they are in Setup;
- provide a calm one-sentence instruction for what this screen is for.

### 2. Top-level stage tabs

Contents:

- Setup
- Run
- Review

Purpose:

- establish the product’s three main working modes;
- give the user a stable mental model for the app.

### 3. Setup progress cards

These are the only readiness/progress system on the setup screen.

Cards:

- Step 1: Task
- Step 2: Materials
- Step 3: Questions
- Step 4: Preview & share

Each card should show:

- step number;
- title;
- short explanation;
- visible status;
- optional visual completion cue.

Status vocabulary:

- Not started
- In progress
- Ready
- Complete
- Locked, only where genuinely necessary

### 4. Required setup flow

The required setup flow should appear as a continuous sequence of four sections:

- Step 1. Task & learning outcomes
- Step 2. Learning materials
- Step 3. Core questions
- Step 4. Preview & share

The user should feel:

- “I am moving through one clear setup sequence.”

### 5. Optional planning & safeguards

This should appear after the required setup flow as one parent collapsed group.

Parent label:

- Optional planning & safeguards

Nested subsections:

- Teaching context & learner message
- Source use safeguards
- Protected assessment materials

### 6. Advanced data controls

Final, lowest-priority area:

- session deletion / danger zone;
- collapsed by default.

## Problems to solve

The latest review surfaced five priority issues.

### Problem 1. Active Setup pill is visually broken

Observed issue:

- the active Setup pill appears blacked out / text is not readable or not visible enough.

Risk:

- users may read this as a rendering bug rather than intentional navigation state;
- trust drops immediately.

### Problem 2. Step 1 feels visually disjointed

Observed issue:

- “Create the learner task” reads like one block;
- the actual Step 1 content beneath it reads like a separate block;
- the collapse arrow appears attached to the lower layer rather than the full step container.

Risk:

- the page loses hierarchy;
- users may not understand that the heading and the content belong together.

### Problem 3. Step naming is inconsistent

Observed issue:

- Steps 1–3 follow `Step X: Title`;
- Step 4 currently breaks the pattern.

Risk:

- setup stops feeling like one coherent sequence.

### Problem 4. Optional content is not grouped strongly enough

Observed issue:

- the page says content is optional;
- the layout still gives each optional area a lot of peer-level visual weight.

Risk:

- naive users still feel they need to inspect everything before continuing.

### Problem 5. Learner link appears too early conceptually

Observed issue:

- the learner link still competes with required setup rather than reading as the outcome of readiness.

Risk:

- instructors may try to share prematurely;
- flow feels less natural.

## Complete implementation plan

## Phase A — Fix top-level navigation and state clarity

### A1. Repair the active Setup tab styling

Implement:

- ensure the active Setup pill has visible text;
- standardize active state styles across Setup / Run / Review;
- verify text contrast and focus state;
- ensure the active style reads as “selected,” not “blanked out.”

Files:

- [src/components/instructor/session-workspace-panels.tsx](C:/Users/seanh/Desktop/Sean/Claude Cowork Projects (MP)/Art Learning Tutor/socratic-tutor/src/components/instructor/session-workspace-panels.tsx)
- any shared navigation styling utilities used by `InstructorWorkspaceNavigation`

Definition of done:

- a user can instantly tell they are in Setup;
- no tab renders as a black blob or unreadable pill.

### A2. Standardize stage-tab behavior

Implement:

- align Setup / Run / Review active, hover, inactive, and focus states;
- ensure keyboard navigation is obvious and accessible;
- confirm labels remain visible in all states.

Definition of done:

- stage navigation feels stable and intentional across the workspace.

## Phase B — Rebuild Step 1 as one unified required section

### B1. Make “Create the learner task” the true Step 1 container

Implement:

- treat the heading and the inner content as one section;
- use one shared white surface/container;
- visually nest all Step 1 content inside it;
- remove the feeling of “banner above, unrelated block below.”

Visual guidance:

- one outer container;
- one inner content area;
- shared padding rhythm;
- consistent border/background treatment.

Definition of done:

- the user sees one expanded Step 1, not two adjacent modules.

### B2. Move the disclosure arrow to the correct hierarchy level

Implement:

- put the collapse/expand arrow on the Step 1 container header itself;
- match the disclosure placement pattern used by the other setup sections.

Definition of done:

- Step 1 opens and closes the same way the other required sections do.

### B3. Keep Step 1 content focused

Step 1 should contain:

- `Where are you in the learning cycle?`
- `What learning outcomes do you want to assess?`

Move out of Step 1:

- `Opening message for students`

That belongs in optional context, not the required learner-task core.

Files:

- [src/components/instructor/session-workspace-panels.tsx](C:/Users/seanh/Desktop/Sean/Claude Cowork Projects (MP)/Art Learning Tutor/socratic-tutor/src/components/instructor/session-workspace-panels.tsx)

## Phase C — Standardize required section naming and order

### C1. Use one step naming pattern across all required sections

Required headings should be:

- Step 1. Task & learning outcomes
- Step 2. Learning materials
- Step 3. Core questions
- Step 4. Preview & share

This replaces mixed patterns like:

- `Step 4 of 4`
- title blocks without matching step semantics.

Definition of done:

- all four required sections scan as one coherent sequence.

### C2. Confirm required setup order

Required sections must appear in this order:

1. Task & learning outcomes
2. Learning materials
3. Core questions
4. Preview & share

Reason:

- this mirrors the actual instructional design dependency chain.

Definition of done:

- each section answers the next obvious user question.

## Phase D — Make preview/share the clear final launch step

### D1. Treat Step 4 as the launch moment

Implement:

- Step 4 should contain:
  - preview button;
  - preview completion state;
  - learner-link reveal;
  - copy-link action.

The learner link should not compete visually with earlier setup work.

### D2. Gate learner-link visibility properly

Implement:

- before Steps 1–3 are complete:
  - Step 4 shows a locked/not-ready state;
- once Steps 1–3 are complete:
  - Step 4 becomes available;
- once preview is checked:
  - the learner link is revealed inside Step 4.

Definition of done:

- the learner link feels like the result of readiness, not an always-available side object.

### D3. Use consistent Step 4 semantics

Implement:

- Step 4 heading should visually match Steps 1–3;
- maintain the merged preview/share model;
- ensure copy-link language and preview language support one clear launch flow.

Files:

- [src/app/instructor/[sessionId]/page.tsx](C:/Users/seanh/Desktop/Sean/Claude Cowork Projects (MP)/Art Learning Tutor/socratic-tutor/src/app/instructor/[sessionId]/page.tsx)

## Phase E — Restructure optional content into one collapsed parent group

### E1. Introduce a single parent optional container

Implement:

- create one parent section:
  - `Optional planning & safeguards`
- keep it collapsed by default.

This parent should wrap:

- Teaching context & learner message
- Source use safeguards
- Protected assessment materials

Definition of done:

- optional content is clearly secondary and does not visually compete with required setup.

### E2. Nest optional subsections inside the parent group

Implement:

- once the parent group is opened, reveal the optional subsections inside;
- each subsection may remain individually collapsible if useful;
- but the first cognitive decision is:
  - “Do I need optional planning?”

Definition of done:

- naive users can ignore the optional layer without anxiety.

### E3. Move “Opening message for students” into optional context

Implement:

- place the learner-facing opening message in the teaching context subsection;
- ensure the subsection title clearly communicates its function.

Recommended subsection title:

- `Teaching context & learner message`

Definition of done:

- the student-opening message no longer clutters the required task definition step.

## Phase F — Improve visual hierarchy and packaging

### F1. Use one coherent section hierarchy

Target hierarchy:

- Header + stage tabs
- Setup progress cards
- Required setup sequence
- Optional planning parent group
- Danger zone

Implement:

- make required sections feel visually stronger than optional ones;
- make optional sections feel clearly subordinate;
- reserve strongest warning styling for deletion controls only.

Definition of done:

- the page is understandable even on a fast scan.

### F2. Normalize container logic

Implement:

- reduce mixed use of banner cards, floating cards, and separate panel metaphors;
- ensure the setup page feels like one designed system rather than adjacent fragments.

Definition of done:

- the screen reads as a single coherent product surface.

## Phase G — Add outcome-quality guidance

### G1. Add recall-only guidance for learning outcomes

The user explicitly requested this.

Implement a non-blocking helper beneath learning outcomes when the outcome appears too recall-oriented.

Suggested copy:

> This may be recall-only. Stronger evidence targets usually ask learners to explain, compare, apply, or point to evidence.

Behavior:

- advisory only;
- appears contextually;
- written in supportive tone.

Definition of done:

- instructors get help improving outcomes before weak design choices flow into the rest of setup.

Files:

- [src/components/instructor/session-workspace-panels.tsx](C:/Users/seanh/Desktop/Sean/Claude Cowork Projects (MP)/Art Learning Tutor/socratic-tutor/src/components/instructor/session-workspace-panels.tsx)

## Phase H — Accessibility and interaction consistency

### H1. Make all disclosure patterns consistent

Implement:

- same arrow placement logic;
- same `aria-expanded` / `aria-controls` patterns;
- same focus and keyboard behavior;
- same visual affordance for collapsed vs open state.

Definition of done:

- no part of the setup flow feels like it follows a different disclosure system.

### H2. Ensure progress is not color-dependent

Implement:

- card status must use text, not just color;
- completion must include a visible label such as `Complete`;
- any card completion icon must be supplemental, not sole signal.

Definition of done:

- readiness remains clear for all users.

### H3. Verify keyboard flow

Must verify:

- Setup / Run / Review tabs
- setup progress cards
- Step 1–4 disclosure sections
- preview/share actions
- copy-link action
- optional parent group
- optional inner subsections

Definition of done:

- a user can complete setup without relying on a mouse.

## Recommended implementation sequence

This is the safest build order.

1. Fix the active Setup pill and top-level tab states.
2. Standardize Setup / Run / Review navigation behavior.
3. Normalize the top setup cards and their statuses.
4. Rebuild Step 1 as one unified container.
5. Move the Step 1 disclosure arrow to the correct hierarchy level.
6. Standardize required section titles as Steps 1–4.
7. Align Step 4 visually and semantically with Steps 1–3.
8. Keep preview and learner-link reveal together in Step 4.
9. Move learner-link visibility fully into Step 4.
10. Wrap all optional content in one collapsed parent group.
11. Nest optional subsections inside that parent.
12. Move `Opening message for students` into optional teaching context.
13. Add recall-only outcome guidance.
14. Do a consistency and accessibility pass.
15. Run a naive-instructor smoke review.

## Suggested file-level implementation map

### [src/app/instructor/[sessionId]/page.tsx](C:/Users/seanh/Desktop/Sean/Claude Cowork Projects (MP)/Art Learning Tutor/socratic-tutor/src/app/instructor/[sessionId]/page.tsx)

Likely responsibilities:

- top-level setup layout order;
- stage-tab rendering and active-state handling;
- setup progress card placement and behavior;
- Step 4 preview/share structure;
- learner-link reveal logic;
- optional parent-group orchestration.

### [src/components/instructor/session-workspace-panels.tsx](C:/Users/seanh/Desktop/Sean/Claude Cowork Projects (MP)/Art Learning Tutor/socratic-tutor/src/components/instructor/session-workspace-panels.tsx)

Likely responsibilities:

- `WorkspaceHeader` navigation presentation;
- `GoalsSection` / Step 1 hierarchy and naming;
- `ReadingsSection` Step 2 naming and disclosure consistency;
- `QuestionsSection` Step 3 naming and disclosure consistency;
- `TeachingContextSection` optional subgroup content;
- `AssessmentsSection` optional subgroup consistency;
- learning-outcome quality helper.

## Definition of done

This phase is complete when a first-time instructor can:

- instantly tell they are in Setup;
- understand the page in under 10 seconds;
- identify the four required steps without reading deeply;
- complete setup in the correct order without confusion;
- ignore optional sections without fear of missing something critical;
- reach preview/share as the natural end of setup;
- only see the learner link when sharing genuinely makes sense.

## Final product standard

The setup screen should feel like:

- one calm four-step launch flow;
- one optional planning drawer beneath it;
- one clear preview/share moment at the end;
- and one advanced deletion area that stays out of the way.

If any element duplicates readiness, breaks the step rhythm, competes visually with the required flow, or reveals sharing controls too early, it should be treated as not yet complete.

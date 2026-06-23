export const INSTRUCTOR_LABELS = {
  setup: "Set up session",
  planning: "Preview learner experience",
  share: "Share with learners",
  monitor: "Learner activity",
  evidence: "Review learner evidence",
  grounding: "Source use check",
  groundingDetails: "Source-use details",
  brief: "Prepare teaching brief",
  teachingMoves: "Suggested teaching moves",
  sessionSnapshot: "Session snapshot",
  needsReview: "Needs instructor review",
  mixedGrounded: "Uses reading + broader explanation",
  unsupported: "Not supported by the reading",
  stuck: "If learners get stuck",
} as const;

export const INSTRUCTOR_WORKFLOW_STEPS = [
  {
    phase: "Before learners begin",
    steps: ["Set up session", "Preview learner experience", "Share with learners"],
  },
  {
    phase: "During learner work",
    steps: ["Watch learner activity", "Review live signals"],
  },
  {
    phase: "After learner work",
    steps: ["Review learner evidence", "Prepare teaching brief"],
  },
] as const;

export const INSTRUCTOR_SESSION_STEPS = [
  {
    label: "Set up session",
    description: "Define purpose, add readings, and choose evidence questions.",
  },
  {
    label: "Preview learner experience",
    description: "Check what learners will see before sharing the link.",
  },
  {
    label: "Share with learners",
    description: "Copy the link only after the required setup is ready.",
  },
  {
    label: "Watch progress",
    description: "See who joined and whether anyone may need attention.",
  },
  {
    label: "Review evidence",
    description: "Inspect claims that need instructor judgment.",
  },
  {
    label: "Prepare teaching brief",
    description: "Decide what to do next and export a useful plan.",
  },
] as const;

export const UX_SMOKE_TEST_GATE = [
  "Can a first-time instructor create a usable session in under five minutes?",
  "Can they tell what is required vs optional?",
  "Can they preview the learner experience before sharing?",
  "Can they understand what AI_thena found without internal terminology?",
  "Can they tell what to do next after learners respond?",
  "Can they inspect evidence if they want to?",
  "Can they ignore advanced details safely?",
  "Can they export a useful brief?",
] as const;

export function formatInstructorStatus(value: string | null | undefined) {
  if (!value) return "";
  const normalized = value.replaceAll("_", " ");
  switch (value) {
    case "provisional":
      return INSTRUCTOR_LABELS.needsReview;
    case "mixed_grounded":
      return INSTRUCTOR_LABELS.mixedGrounded;
    case "unsupported":
      return INSTRUCTOR_LABELS.unsupported;
    default:
      return normalized;
  }
}

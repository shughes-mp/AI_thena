import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  buildLearnerExperiencePreview,
  evaluateSessionDesign,
  generateAnticipatedPivots,
  type PlanningSessionInput,
} from "../src/lib/session-planning.ts";

function session(overrides: Partial<PlanningSessionInput> = {}): PlanningSessionInput {
  return {
    id: "session-1",
    name: "Systems thinking",
    description: "Prepare to compare reinforcing and balancing feedback loops.",
    learningGoal: "Explain how feedback loops shape system behavior.",
    learningOutcomes: "Distinguish reinforcing and balancing loops",
    maxExchanges: 12,
    sessionPurpose: "pre_class",
    planningOpeningQuestion: "What do you currently believe a feedback loop does?",
    planningTaskInstructions: "Compare both loop types and support your distinction with a passage.",
    planningIntendedOutput: "A source-supported comparison for use in class.",
    participationPlan: "{}",
    anticipatedPivots: "[]",
    planningVersion: "planning-1.0.0",
    ...overrides,
  };
}

const reasoningCheckpoint = {
  id: "checkpoint-1",
  prompt: "How does a reinforcing loop differ from a balancing loop, and what evidence supports your answer?",
  processLevel: "analyze",
  misconceptionSeeds: JSON.stringify(["Reinforcing loops always restore stability."]),
};

test("Phase 8 preview exposes the complete learner journey before launch", () => {
  const preview = buildLearnerExperiencePreview(
    session(),
    [reasoningCheckpoint],
    true,
    true
  );

  assert.equal(preview.openingQuestion, "What do you currently believe a feedback loop does?");
  assert.match(preview.taskInstructions, /support your distinction/i);
  assert.equal(preview.evidenceQuestions.length, 1);
  assert.ok(preview.helpBehavior.length >= 3);
  assert.match(preview.sourceGroundingMessage, /primary reference/i);
  assert.match(preview.protectedAssessmentMessage, /without revealing protected answers/i);
  assert.match(preview.intendedOutput, /source-supported comparison/i);
  assert.match(preview.summaryAndReflection, /contest the summary/i);
});

test("Phase 8 quality checks flag the roadmap failure modes", () => {
  const weakSession = session({
    learningOutcomes: "Define feedback\nApply feedback\nEvaluate feedback",
    maxExchanges: 3,
    planningTaskInstructions: null,
    planningIntendedOutput: null,
  });
  const recallQuestion = {
    id: "recall",
    prompt: "Define reinforcing feedback loops and balancing feedback loops",
    processLevel: "retrieve",
    misconceptionSeeds: null,
  };
  const checks = evaluateSessionDesign({
    session: weakSession,
    checkpoints: [recallQuestion, { ...recallQuestion, id: "recall-2" }],
    readingCount: 0,
    assessmentContents: [
      "Define reinforcing feedback loops and balancing feedback loops in the final assessment",
    ],
    pivots: [],
    participation: {
      individualThinking: "",
      peerExchange: "",
      alternativeChannels: "",
      quieterVoices: "",
      concentrationReset: "",
    },
  });
  const byCode = Object.fromEntries(checks.map((check) => [check.code, check.status]));

  assert.notEqual(byCode.recall_only_questions, "ready");
  assert.notEqual(byCode.question_load, "ready");
  assert.notEqual(byCode.outcome_coverage, "ready");
  assert.notEqual(byCode.source_support, "ready");
  assert.notEqual(byCode.task_clarity, "ready");
  assert.notEqual(byCode.protected_overlap, "ready");
  assert.notEqual(byCode.usable_output, "ready");
  assert.notEqual(byCode.shared_confusion_plan, "ready");
  assert.notEqual(byCode.participation_plan, "ready");
});

test("anticipated pivots are Guide-first, bounded, and ready to use", () => {
  const pivots = generateAnticipatedPivots(session(), [reasoningCheckpoint]);

  assert.equal(pivots.length, 1);
  assert.equal(pivots[0].initialMode, "guide");
  assert.match(pivots[0].likelyWobblePoint, /restore stability/i);
  assert.match(pivots[0].watchFor, /repeated claim/i);
  assert.match(pivots[0].diagnosisQuestion, /evidence/i);
  assert.match(pivots[0].guidePhrase, /passage/i);
  assert.match(pivots[0].conductorPhrase, /several responses/i);
  assert.match(pivots[0].escalationCondition, /at least two learners and 40%/i);
  assert.match(pivots[0].releaseCondition, /Observer/i);
  assert.match(pivots[0].intendedOutput, /source-supported/i);
});

test("Phase 8 persistence, authorization, UI, and learner delivery stay connected", () => {
  const migration = fs.readFileSync(
    path.resolve(process.cwd(), "prisma/migrations/20260622_add_session_planning_preview/migration.sql"),
    "utf8"
  );
  const route = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/api/sessions/[sessionId]/planning/route.ts"),
    "utf8"
  );
  const page = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/instructor/[sessionId]/planning/page.tsx"),
    "utf8"
  );
  const learnerChat = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/s/[accessCode]/chat/client-chat.tsx"),
    "utf8"
  );
  const prompt = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/system-prompt.ts"),
    "utf8"
  );

  for (const field of [
    "planningOpeningQuestion",
    "planningTaskInstructions",
    "planningIntendedOutput",
    "participationPlan",
    "anticipatedPivots",
    "planningVersion",
  ]) {
    assert.match(migration, new RegExp(field));
  }
  assert.match(route, /requireSessionAccess\(sessionId, "viewer"\)/);
  assert.match(route, /requireSessionAccess\(sessionId, "editor"\)/);
  assert.doesNotMatch(route, /assessment\.content[,}]/);
  for (const label of [
    "What learners will see and do",
    "Is this ready?",
    "INSTRUCTOR_LABELS.stuck",
    "Participation planning",
  ]) {
    assert.match(page, new RegExp(label, "i"));
  }
  assert.match(learnerChat, /planningOpeningQuestion/);
  assert.match(learnerChat, /Finish with:/);
  assert.match(prompt, /INSTRUCTOR-PLANNED OPENING QUESTION/);
  assert.match(prompt, /INTENDED USABLE OUTPUT/);
});

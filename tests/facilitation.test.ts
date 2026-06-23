import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  deriveFacilitationPivots,
  type FacilitationRuleSignal,
} from "../src/lib/facilitation.ts";

function signal(
  id: string,
  learnerId: string,
  overrides: Partial<FacilitationRuleSignal> = {}
): FacilitationRuleSignal {
  return {
    id,
    studentSessionId: learnerId,
    learnerName: learnerId,
    claim: "The system is driven mainly by external events.",
    status: "provisional",
    confidenceLevel: "medium",
    resolved: false,
    ...overrides,
  };
}

test("resolved reasoning recommends Observer with a clear escalation boundary", () => {
  const pivots = deriveFacilitationPivots({
    totalLearners: 1,
    signals: [signal("signal-1", "learner-1", { resolved: true, confidenceLevel: "high" })],
  });

  assert.equal(pivots.length, 1);
  assert.equal(pivots[0].mode, "observer");
  assert.equal(pivots[0].scopeType, "learner");
  assert.match(pivots[0].releaseCondition, /Observer/);
  assert.match(pivots[0].escalationCondition ?? "", /shallow|stalled/);
});

test("isolated unresolved confusion recommends Guide without class-level escalation", () => {
  const pivots = deriveFacilitationPivots({
    totalLearners: 5,
    signals: [signal("signal-1", "learner-1")],
  });

  assert.equal(pivots.length, 1);
  assert.equal(pivots[0].mode, "guide");
  assert.equal(pivots[0].scopeType, "learner");
  assert.deepEqual(pivots[0].triggerSignalIds, ["signal-1"]);
  assert.match(pivots[0].limitations, /cannot justify a group or class reset/);
});

test("a shared consequential misunderstanding recommends one evidence-linked Conductor reset", () => {
  const pivots = deriveFacilitationPivots({
    totalLearners: 4,
    signals: [
      signal("signal-1", "learner-1", { confidenceLevel: "high" }),
      signal("signal-2", "learner-2", { confidenceLevel: "medium" }),
    ],
  });

  assert.equal(pivots.length, 1);
  assert.equal(pivots[0].mode, "conductor");
  assert.equal(pivots[0].scopeType, "class");
  assert.deepEqual(pivots[0].triggerSignalIds, ["signal-1", "signal-2"]);
  assert.equal(pivots[0].confidenceLevel, "medium");
  assert.match(pivots[0].observedCondition, /2 of 4 learners/);
  assert.match(pivots[0].releaseCondition, /Return to Guide or Observer/);
});

test("one learner never justifies a class-level Conductor recommendation", () => {
  const pivots = deriveFacilitationPivots({
    totalLearners: 1,
    signals: [signal("signal-1", "learner-1")],
  });

  assert.equal(pivots[0].mode, "guide");
  assert.notEqual(pivots[0].scopeType, "class");
});

test("silence or missing evidence does not create an automatic intervention", () => {
  assert.deepEqual(
    deriveFacilitationPivots({ totalLearners: 8, signals: [] }),
    []
  );
});

test("Phase 7 persistence and APIs preserve instructor authority", () => {
  const migration = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "prisma/migrations/20260622_implement_facilitation_intelligence/migration.sql"
    ),
    "utf8"
  );
  const updateRoute = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "src/app/api/sessions/[sessionId]/facilitation-pivots/[pivotId]/route.ts"
    ),
    "utf8"
  );
  const collectionRoute = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "src/app/api/sessions/[sessionId]/facilitation-pivots/route.ts"
    ),
    "utf8"
  );

  for (const field of [
    "sessionId",
    "triggerSignalIds",
    "selectedMode",
    "editedPhrase",
    "actionUsed",
    "helpfulness",
    "instructorFeedback",
    "decisionActorId",
    "decidedAt",
  ]) {
    assert.match(migration, new RegExp(`ADD COLUMN "${field}"`));
  }
  assert.match(updateRoute, /requireSessionAccess\(sessionId, "editor"\)/);
  assert.match(collectionRoute, /requireSessionAccess\(sessionId, "viewer"\)/);
  assert.match(collectionRoute, /requireSessionAccess\(sessionId, "editor"\)/);
  assert.match(updateRoute, /decisionActorId: access\.userId/);
  assert.match(collectionRoute, /triggerIds\.length > 0 \? triggerIds : \[pivot\.signalId\]/);
  assert.match(
    updateRoute,
    /storedTriggerIds\.length > 0[\s\S]*\[updated\.signalId\]/
  );
});

test("Phase 7 surfaces expose proportionate recommendations and every instructor control", () => {
  const panel = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/instructor/facilitation-pivot-panel.tsx"),
    "utf8"
  );
  const reportPanel = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/instructor/teaching-brief-facilitation-pivots.tsx"),
    "utf8"
  );
  const primaryTeachingBrief = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/instructor/[sessionId]/analysis/page.tsx"),
    "utf8"
  );
  const exportTemplate = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/teaching-brief-export.ts"),
    "utf8"
  );
  const reportGenerator = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/report-generator.ts"),
    "utf8"
  );

  for (const label of [
    "Observer",
    "Guide",
    "Conductor",
    "Accept recommendation",
    "Choose a different mode",
    "Edit the ready-to-use phrase",
    "Record move used",
    "Did it help?",
    "Mark inappropriate",
  ]) {
    assert.match(panel, new RegExp(label.replace(/[?]/g, "\\?")));
  }

  assert.match(panel, /never acts automatically/);
  assert.match(panel, /Sparse evidence, silence, or delay does not automatically justify intervention/);
  assert.match(reportPanel, /INSTRUCTOR_LABELS\.teachingMoves/);
  assert.match(primaryTeachingBrief, /TeachingBriefFacilitationPivots/);
  assert.match(primaryTeachingBrief, /pivots=\{report\.brief\.facilitationPivots\}/);
  assert.match(primaryTeachingBrief, /This teaching brief needs to be refreshed/);
  assert.match(primaryTeachingBrief, /Refresh the teaching brief before exporting the PDF/);
  assert.match(exportTemplate, /Recommended facilitation pivots/);
  assert.match(exportTemplate, /Step back when:/);
  assert.match(reportGenerator, /Do not invent, change, or escalate a facilitation mode/);
  assert.match(reportGenerator, /The instructor decides whether to accept, modify, reject, or use/);
});

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  DEFAULT_EVIDENCE_REVIEW_FILTERS,
  filterAndSortEvidenceSignals,
  formatEvidenceAge,
  getEvidenceStrength,
} from "../src/lib/evidence-review.ts";
import type { EvidenceSignalRecord } from "../src/types/index.ts";

function signalFixture(
  overrides: Partial<EvidenceSignalRecord> = {}
): EvidenceSignalRecord {
  return {
    id: "signal-1",
    sessionId: "session-1",
    studentSessionId: "learner-1",
    learnerName: "Alex",
    signalType: "possible_misunderstanding",
    scopeType: "learner",
    scopeId: "learner-1",
    claim: "The learner may be conflating two concepts.",
    status: "provisional",
    confidenceLevel: "medium",
    confidenceRationale: "Two linked excerpts support a bounded inference.",
    limitations: "One opportunity was observed.",
    missingEvidence: "A second application opportunity is missing.",
    contradictoryEvidence: "The learner later supplied a partial distinction.",
    opportunitySummary: "One learner responded to one linked evidence question.",
    misunderstandingResolved: false,
    learningOutcomes: [{ id: "outcome-1", label: "Distinguish the concepts" }],
    evidenceQuestions: [
      { id: "question-1", prompt: "How are they different?", processLevel: "infer" },
    ],
    qualifications: [],
    createdBy: "diagnostic",
    modelId: "test-model",
    promptVersion: "test-prompt",
    parserVersion: "test-parser",
    evidencePolicyVersion: "test-policy",
    sourceSetVersion: "test-source-set",
    supersedesSignalId: null,
    createdAt: "2026-06-20T10:00:00.000Z",
    updatedAt: "2026-06-20T10:00:00.000Z",
    citations: [
      {
        id: "learner-citation",
        citationType: "learner_message",
        recordId: "message-1",
        quotedText: "I think they are the same.",
        startOffset: null,
        endOffset: null,
        sourceFilename: null,
        passageId: null,
        relevanceRationale: "Direct learner evidence.",
      },
      {
        id: "source-citation",
        citationType: "source_passage",
        recordId: "reading-1",
        quotedText: "The concepts differ in scope.",
        startOffset: 0,
        endOffset: 34,
        sourceFilename: "reading.md",
        passageId: "passage-1",
        relevanceRationale: "Relevant source distinction.",
      },
    ],
    reviews: [],
    recommendation: null,
    ...overrides,
  };
}

test("Phase 5 evidence filters combine outcome, confidence, review, resolution, learner, and sorting", () => {
  const signals = [
    signalFixture(),
    signalFixture({
      id: "signal-2",
      learnerName: "Bea",
      studentSessionId: "learner-2",
      status: "approved",
      confidenceLevel: "high",
      misunderstandingResolved: true,
      createdAt: "2026-06-20T11:00:00.000Z",
    }),
  ];
  const visible = filterAndSortEvidenceSignals(signals, {
    ...DEFAULT_EVIDENCE_REVIEW_FILTERS,
    confidence: "high",
    reviewState: "approved",
    resolution: "resolved",
    learner: "learner-2",
  });
  assert.deepEqual(visible.map((signal) => signal.id), ["signal-2"]);
});

test("evidence strength is conservative and relative age is explicit", () => {
  assert.equal(getEvidenceStrength(signalFixture()), "developing");
  assert.equal(
    getEvidenceStrength(
      signalFixture({ confidenceLevel: "high", missingEvidence: "None recorded." })
    ),
    "strong"
  );
  assert.equal(
    formatEvidenceAge("2026-06-20T10:00:00.000Z", Date.parse("2026-06-20T12:05:00.000Z")),
    "2 hr ago"
  );
});

test("report reads are viewer-safe while generation requires editor access", () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/api/sessions/[sessionId]/report/route.ts"),
    "utf8"
  );
  const getBlock = source.slice(
    source.indexOf("export async function GET"),
    source.indexOf("export async function POST")
  );
  const postBlock = source.slice(source.indexOf("export async function POST"));
  assert.match(getBlock, /requireSessionAccess\(sessionId, "viewer"\)/);
  assert.doesNotMatch(getBlock, /generateInstructorReport\(sessionId\)/);
  assert.match(postBlock, /requireSessionAccess\(sessionId, "editor"\)/);
  assert.match(postBlock, /generateInstructorReport\(sessionId\)/);
  assert.match(source, /getReportFreshness/);
  const freshness = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/report-freshness.ts"),
    "utf8"
  );
  assert.match(freshness, /evidenceReview\.findFirst/);
  assert.match(freshness, /configFingerprint/);
  const exportRoute = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "src/app/api/sessions/[sessionId]/report/export/route.ts"
    ),
    "utf8"
  );
  assert.match(exportRoute, /if \(stale\)/);
  assert.match(exportRoute, /status: 409/);
});

test("rejected evidence is excluded from maps and misconception aggregates", () => {
  const briefSource = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/teaching-brief.ts"),
    "utf8"
  );
  assert.match(
    briefSource,
    /signal\.status !== "superseded" && signal\.status !== "rejected"/
  );

  const aggregateSource = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "src/app/api/sessions/[sessionId]/misconceptions/aggregate/route.ts"
    ),
    "utf8"
  );
  assert.match(aggregateSource, /evidenceSignal\.status !== "rejected"/);
  assert.match(aggregateSource, /sourceCitations/);
});

test("Phase 5 interfaces expose filters, uncertainty, timestamps, source links, and review context", () => {
  const evidence = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/instructor/evidence-review-panel.tsx"),
    "utf8"
  );
  for (const label of [
    "Learning outcome",
    "Evidence question",
    "Evidence strength",
    "Confidence",
    "Review state",
    "Misunderstanding resolution",
    "Learner",
    "Sort",
    "Opportunity coverage",
    "Contradictory evidence",
  ]) {
    assert.match(evidence, new RegExp(label));
  }
  assert.match(evidence, /dateTime={item\.createdAt}/);

  const monitor = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/instructor/[sessionId]/monitor/page.tsx"),
    "utf8"
  );
  assert.match(monitor, /Why flagged and what to do/);
  assert.match(monitor, /Uncertainty:/);
  assert.match(monitor, /Suggested action:/);

  const misconceptions = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/instructor/[sessionId]/misconceptions/page.tsx"),
    "utf8"
  );
  assert.match(misconceptions, /Open source-linked signal and review history/);
});

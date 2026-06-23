import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  buildTeachingBriefExportHtml,
  sanitizeGeneratedHtml,
} from "../src/lib/teaching-brief-export.ts";
import {
  prepareNarrativeForExport,
  redactInternalIdentifiers,
  stripInlineMarkdown,
  uniqueNormalizedStrings,
} from "../src/lib/report-presentation.ts";

const TEACHING_BRIEF_SCHEMA_VERSION = "teaching-brief-1.1.0" as const;
const TEACHING_BRIEF_PROMPT_VERSION = "teaching-brief-prompt-2.2.0";

function briefFixture(): Parameters<typeof buildTeachingBriefExportHtml>[0]["brief"] {
  const mapItem = {
    id: "outcome-1",
    label: "Apply the model",
    classification: "evidence_suggests_gaps" as const,
    classificationLabel: "Evidence suggests gaps",
    learnerCount: 2,
    learnerSessionIds: ["learner-1", "learner-2"],
    opportunityCoverage: {
      observedLearners: 2,
      totalLearners: 3,
      linkedQuestions: 1,
      summary: "2 of 3 learners contributed relevant evidence across 1 linked question.",
    },
    confidence: { level: "medium" as const, rationale: "One linked opportunity." },
    contradictoryEvidence: ["One learner supplied a counterexample."],
    missingEvidence: ["No transfer question was attempted."],
    reviewState: "partially_reviewed" as const,
    reviewSummary: "Some signals remain provisional.",
    signalIds: ["signal-1"],
    evidenceReferences: [
      {
        id: "citation-1",
        signalId: "signal-1",
        learnerName: "Alex",
        learnerSessionId: "learner-1",
        citationType: "learner_message",
        quotedText: "**I can use it** in the original example.",
        sourceFilename: null,
        relevanceRationale: "Shows application in a familiar context.",
      },
    ],
  };

  return {
    schemaVersion: TEACHING_BRIEF_SCHEMA_VERSION,
    generatedAt: "2026-06-20T10:00:00.000Z",
    promptVersion: TEACHING_BRIEF_PROMPT_VERSION,
    modelProvider: "anthropic",
    modelId: "test-model",
    session: {
      id: "session-1",
      name: "Test & Review",
      purpose: "pre_class",
      purposeLabel: "Pre-class",
      configFingerprint: "fixture-config",
      sourceSetFingerprint: "fixture-sources",
      assessmentSetFingerprint: "fixture-assessments",
      learnerCount: 3,
      exchangeCount: 8,
    },
    formativeUse: {
      statement: "This teaching brief is formative.",
      aiGeneratedStatement: "Narrative synthesis is AI-generated.",
      gradingBoundary: "This brief is not a grade.",
    },
    howToRead: [
      { title: "Observed evidence", explanation: "Inspect the linked records." },
      { title: "AI inference", explanation: "Interpretations are provisional." },
    ],
    instructorReview: {
      state: "partially_reviewed",
      summary: "Some signals remain provisional.",
      counts: { approved: 1, provisional: 1 },
    },
    evidenceMap: { title: "Readiness Evidence Map", items: [mapItem] },
    suggestedTeachingMoves: [],
    facilitationPivots: [
      {
        id: "pivot-1",
        mode: "guide",
        recommendedMode: "guide",
        scopeType: "learner",
        scopeIds: ["learner-1"],
        triggerSignalIds: ["signal-1"],
        evidenceScope: "1 inspectable signal at learner scope.",
        observedCondition: "One learner-level misunderstanding remains unresolved.",
        rationale: "A focusing prompt is proportionate.",
        suggestedMove: "Ask for evidence.",
        suggestedPhrase: "Which evidence supports that claim?",
        confidence: "medium",
        escalationCondition: "Escalate only if the pattern is shared.",
        releaseCondition: "Step back when reasoning resumes.",
        reviewState: "provisional",
        createdBy: "rule",
      },
    ],
    strengths: [],
    followUps: [mapItem],
    misunderstandingPatterns: [],
    perLearnerNotes: [],
    learningOutcomeEvidence: [mapItem],
    evidenceAppendix: mapItem.evidenceReferences,
  };
}

test("structured teaching briefs preserve their versioned evidence contract", () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/teaching-brief.ts"),
    "utf8"
  );
  assert.match(source, /TEACHING_BRIEF_SCHEMA_VERSION = "teaching-brief-1\.1\.0"/);
  assert.match(source, /export function parseTeachingBrief/);
  assert.match(source, /parsed\.schemaVersion === TEACHING_BRIEF_SCHEMA_VERSION/);
  assert.match(source, /evidenceMap/);
  assert.match(source, /evidenceAppendix/);
});

test("teaching brief export contains formative, review, provenance, and evidence details", () => {
  const html = buildTeachingBriefExportHtml({
    sessionName: "Test & Review",
    narrativeHtml: "<h2>Recommendation</h2><p>Revisit the transfer example.</p>",
    brief: briefFixture(),
  });

  for (const expected of [
    "Formative use only",
    "This brief is not a grade",
    "Instructor review: partially reviewed",
    "Readiness Evidence Map",
    "Evidence suggests gaps",
    "2 of 3 learners",
    "Contradictory evidence",
    "Missing evidence",
    "Evidence appendix",
    "Recommended facilitation pivots",
    "Step back when reasoning resumes",
    TEACHING_BRIEF_PROMPT_VERSION,
    "anthropic/test-model",
  ]) {
    assert.match(html, new RegExp(expected));
  }
  assert.match(html, /Test &amp; Review/);
  assert.match(html, /3 learners/);
  assert.doesNotMatch(html, /\*\*I can use it\*\*/);

  const singularBrief = briefFixture();
  singularBrief.session.learnerCount = 1;
  const singularHtml = buildTeachingBriefExportHtml({
    sessionName: "One learner",
    narrativeHtml: "<p>Summary</p>",
    brief: singularBrief,
  });
  assert.match(singularHtml, /1 learner/);
  assert.doesNotMatch(singularHtml, /1 learners/);
});

test("generated narrative HTML is stripped of executable content", () => {
  const sanitized = sanitizeGeneratedHtml(
    '<p onclick="alert(1)">Safe</p><script>alert(2)</script><a href="javascript:alert(3)">Link</a>'
  );
  assert.match(sanitized, /<p>Safe<\/p>/);
  assert.doesNotMatch(sanitized, /script|onclick|javascript:/i);
});

test("Phase 6 migration is additive and export closes the browser in finally", () => {
  const migration = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "prisma/migrations/20260620_complete_teaching_briefs/migration.sql"
    ),
    "utf8"
  );
  assert.match(migration, /ADD COLUMN "structuredContent"/);
  assert.match(migration, /ADD COLUMN "promptVersion"/);
  assert.match(migration, /ADD COLUMN "modelId"/);
  assert.doesNotMatch(migration, /DROP TABLE/);

  const exportRoute = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "src/app/api/sessions/[sessionId]/report/export/route.ts"
    ),
    "utf8"
  );
  assert.match(exportRoute, /finally\s*{/);
  assert.match(exportRoute, /browser\?\.close\(\)/);
  assert.match(exportRoute, /Cache-Control[\s\S]*private, no-store/);
  assert.match(exportRoute, /prepareNarrativeForExport\(report\.content\)/);
  assert.doesNotMatch(exportRoute, /details:\s*message/);
  assert.match(exportRoute, /export const runtime = "nodejs"/);
  assert.match(exportRoute, /launchPdfBrowser\(\)/);

  const pdfBrowser = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/pdf-browser.ts"),
    "utf8"
  );
  assert.match(pdfBrowser, /process\.env\.VERCEL/);
  assert.match(pdfBrowser, /@sparticuz\/chromium/);
  assert.match(pdfBrowser, /puppeteer-core/);
  assert.match(pdfBrowser, /await chromium\.executablePath\(\)/);
  assert.match(pdfBrowser, /headless: "shell"/);

  const nextConfig = fs.readFileSync(
    path.resolve(process.cwd(), "next.config.ts"),
    "utf8"
  );
  assert.match(nextConfig, /serverExternalPackages: \["@sparticuz\/chromium"\]/);
  assert.match(nextConfig, /outputFileTracingIncludes/);
  assert.match(nextConfig, /@sparticuz\/chromium\/bin\/\*\*\/\*/);
});

test("report presentation removes internal IDs, duplicate sections, and inline markdown", () => {
  const internalId = "cmqo2phu3000604lev4d1ylln";
  const report = [
    "INSTRUCTOR TEACHING BRIEF",
    "",
    "SESSION SNAPSHOT",
    "One learner (" + internalId + ") completed the session.",
    "",
    "HOW TO READ THIS BRIEF",
    "This duplicates the deterministic guide.",
    "",
    "SUGGESTED TEACHING MOVES",
    "Use **one contrast question**.",
    "",
    "READINESS EVIDENCE MAP",
    "This duplicates the deterministic map.",
    "",
    "PER-STUDENT NOTES",
    "Learner (" + internalId + "): follow up briefly.",
    "",
    "INSTRUCTOR REVIEW STATUS",
    "This duplicates the deterministic review state.",
  ].join("\n");

  const prepared = prepareNarrativeForExport(report);
  assert.match(prepared, /SESSION SNAPSHOT/);
  assert.match(prepared, /SUGGESTED TEACHING MOVES/);
  assert.match(prepared, /PER-STUDENT NOTES/);
  assert.doesNotMatch(
    prepared,
    /HOW TO READ THIS BRIEF|READINESS EVIDENCE MAP|INSTRUCTOR REVIEW STATUS/
  );
  assert.doesNotMatch(prepared, new RegExp(internalId));
  assert.equal(
    redactInternalIdentifiers("Learner (Session ID: " + internalId + ")"),
    "Learner"
  );
  assert.equal(
    stripInlineMarkdown("Use **one** [source](https://example.com)."),
    "Use one source."
  );
});

test("evidence qualifications deduplicate punctuation variants", () => {
  assert.deepEqual(
    uniqueNormalizedStrings([
      "Only one exchange was observed; no transfer followed.",
      "Only one exchange was observed no transfer followed",
      "A separate limitation.",
    ]),
    [
      "Only one exchange was observed; no transfer followed.",
      "A separate limitation.",
    ]
  );
});
test("teaching brief export stays in-page and blocks stale downloads", () => {
  const reportPage = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "src/app/instructor/[sessionId]/report/page.tsx"
    ),
    "utf8"
  );
  assert.match(reportPage, /fetch\([\s\S]*\/report\/export/);
  assert.match(reportPage, /disabled=\{isExporting \|\| report\.stale\}/);
  assert.match(reportPage, /id="stale-brief-message"/);
  assert.match(reportPage, /role="alert"/);
  assert.doesNotMatch(reportPage, /window\.location\.href/);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildSourceSetVersion,
  findExactSourceMatch,
  getReviewTransition,
} from "../src/lib/evidence.ts";
import { hasRequiredMisunderstandingCitations } from "../src/lib/evidence-api.ts";
import { parseLearningOutcomes } from "../src/lib/evidence-definition-parser.ts";

test("review transitions preserve explicit instructor state changes", () => {
  assert.equal(getReviewTransition("provisional", "approve"), "approved");
  assert.equal(getReviewTransition("approved", "revise"), "revised");
  assert.equal(getReviewTransition("revised", "reject"), "rejected");
  assert.equal(getReviewTransition("provisional", "mark_acceptable"), "rejected");
  assert.equal(getReviewTransition("approved", "add_context"), "approved");
  assert.equal(getReviewTransition("revised", "flag_for_discussion"), "revised");
  assert.equal(getReviewTransition("approved", "supersede"), "superseded");
  assert.equal(getReviewTransition("rejected", "undo", "revised"), "revised");
  assert.throws(() => getReviewTransition("rejected", "approve"));
  assert.throws(() => getReviewTransition("approved", "undo", "approved"));
});

test("source matching returns stable exact offsets and passage IDs", () => {
  const sources = [
    {
      id: "reading-1",
      filename: "reading.md",
      content: "The author distinguishes efficiency from effectiveness in this passage.",
    },
  ];
  const match = findExactSourceMatch(
    "distinguishes efficiency from effectiveness",
    sources
  );

  assert.ok(match);
  assert.equal(match!.quotedText, "distinguishes efficiency from effectiveness");
  assert.equal(
    sources[0].content.slice(match!.startOffset, match!.endOffset),
    match!.quotedText
  );
  assert.equal(match!.passageId.length, 20);
  assert.equal(buildSourceSetVersion(sources), buildSourceSetVersion([...sources]));
});

test("possible misunderstandings cannot render without learner and source citations", () => {
  const base = { signalType: "possible_misunderstanding" };
  assert.equal(
    hasRequiredMisunderstandingCitations({
      ...base,
      citations: [
        { citationType: "learner_message", recordId: "m1", quotedText: "A claim" },
      ],
    }),
    false
  );
  assert.equal(
    hasRequiredMisunderstandingCitations({
      ...base,
      citations: [
        { citationType: "learner_message", recordId: "m1", quotedText: "A claim" },
        { citationType: "source_passage", recordId: "r1", quotedText: "A passage" },
      ],
    }),
    true
  );
});

test("evidence migration is additive and does not drop legacy tables", () => {
  const migration = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "prisma/migrations/20260618_add_evidence_provenance/migration.sql"
    ),
    "utf8"
  );
  assert.match(migration, /CREATE TABLE "EvidenceSignal"/);
  assert.match(migration, /CREATE TABLE "EvidenceCitation"/);
  assert.match(migration, /CREATE TABLE "EvidenceReview"/);
  assert.doesNotMatch(migration, /DROP TABLE/);
});

test("learning outcomes normalize without losing stable semantic identity", () => {
  const parsed = parseLearningOutcomes(
    "1. Explain the core claim\n- Apply the model to a case\nExplain   the core claim"
  );
  assert.deepEqual(
    parsed.map(({ orderIndex, normalizedKey }) => ({ orderIndex, normalizedKey })),
    [
      { orderIndex: 0, normalizedKey: "explain the core claim" },
      { orderIndex: 1, normalizedKey: "apply the model to a case" },
    ]
  );
});

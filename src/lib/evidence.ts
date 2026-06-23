import { createHash } from "node:crypto";

export const EVIDENCE_VERSIONS = {
  schema: "evidence-schema-1.0.0",
  productPolicy: "product-1.0.0",
  terminology: "terminology-1.0.0",
  evidencePolicy: "evidence-1.0.0",
  governancePolicy: "governance-1.0.0",
  diagnosticPrompt: "diagnostic-2.1.0",
  diagnosticParser: "diagnostic-parser-2.1.0",
  facilitationRules: "facilitation-2.0.0",
  modelConfiguration: "anthropic-diagnostic-1.0.0",
} as const;

export const EVIDENCE_STATUSES = [
  "provisional",
  "approved",
  "revised",
  "rejected",
  "superseded",
] as const;

export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];
export type EvidenceReviewAction =
  | "approve"
  | "revise"
  | "reject"
  | "mark_acceptable"
  | "flag_for_discussion"
  | "add_context"
  | "supersede"
  | "undo";

const REVIEW_TRANSITIONS: Record<
  EvidenceReviewAction,
  { allowedFrom: readonly EvidenceStatus[]; to: EvidenceStatus | "previous" }
> = {
  approve: { allowedFrom: ["provisional", "revised"], to: "approved" },
  revise: {
    allowedFrom: ["provisional", "approved", "revised"],
    to: "revised",
  },
  reject: {
    allowedFrom: ["provisional", "approved", "revised"],
    to: "rejected",
  },
  mark_acceptable: {
    allowedFrom: ["provisional", "approved", "revised"],
    to: "rejected",
  },
  flag_for_discussion: {
    allowedFrom: ["provisional", "approved", "revised", "rejected"],
    to: "previous",
  },
  add_context: {
    allowedFrom: ["provisional", "approved", "revised", "rejected"],
    to: "previous",
  },
  supersede: {
    allowedFrom: ["provisional", "approved", "revised", "rejected"],
    to: "superseded",
  },
  undo: {
    allowedFrom: ["approved", "revised", "rejected"],
    to: "previous",
  },
};

export function getReviewTransition(
  current: EvidenceStatus,
  action: EvidenceReviewAction,
  previousStatus?: EvidenceStatus
): EvidenceStatus {
  const rule = REVIEW_TRANSITIONS[action];
  if (!rule.allowedFrom.includes(current)) {
    throw new Error(`Cannot ${action} a signal with status ${current}.`);
  }

  if (rule.to === "previous") {
    if (action === "undo") {
      if (!previousStatus || previousStatus === current) {
        throw new Error("Undo requires a different previous status.");
      }
      return previousStatus;
    }
    return current;
  }

  return rule.to;
}

export interface SourceDocument {
  id: string;
  filename: string;
  content: string;
}

export interface SourceMatch extends SourceDocument {
  quotedText: string;
  startOffset: number;
  endOffset: number;
  passageId: string;
}

function normalizedSearch(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function findExactSourceMatch(
  quote: string | null,
  sources: SourceDocument[]
): SourceMatch | null {
  if (!quote || normalizedSearch(quote).length < 12) return null;

  for (const source of sources) {
    const directOffset = source.content.indexOf(quote);
    if (directOffset >= 0) {
      return makeSourceMatch(source, quote, directOffset);
    }

    const normalizedQuote = normalizedSearch(quote);
    const pattern = normalizedQuote
      .split(" ")
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("\\s+");
    const match = new RegExp(pattern, "i").exec(source.content);
    if (match?.index !== undefined) {
      return makeSourceMatch(source, match[0], match.index);
    }
  }

  return null;
}

function makeSourceMatch(
  source: SourceDocument,
  quotedText: string,
  startOffset: number
): SourceMatch {
  const passageId = createHash("sha256")
    .update(`${source.id}:${startOffset}:${quotedText}`)
    .digest("hex")
    .slice(0, 20);

  return {
    ...source,
    quotedText,
    startOffset,
    endOffset: startOffset + quotedText.length,
    passageId,
  };
}

export function buildSourceSetVersion(sources: SourceDocument[]): string {
  const digest = createHash("sha256");
  for (const source of [...sources].sort((a, b) => a.id.localeCompare(b.id))) {
    digest.update(source.id);
    digest.update("\0");
    digest.update(source.content);
    digest.update("\0");
  }
  return `sha256:${digest.digest("hex")}`;
}

export function buildGuideRecommendation(claim: string) {
  return {
    mode: "guide",
    observedCondition: "A learner expressed a source-conflicting claim.",
    diagnosisQuestion: "Which passage most strongly supports your current interpretation?",
    rationale:
      "The evidence is learner-scoped, so a question that reconnects reasoning to the source is proportionate.",
    suggestedMove:
      "Ask the learner to identify the relevant passage, compare it with their claim, and revise or defend the claim.",
    suggestedPhrase: `What in the source supports “${claim.slice(0, 140)}”? Is there a passage that might complicate that reading?`,
    limitations:
      "This recommendation is based on one observed exchange and should not be generalized to the class.",
    escalationCondition:
      "Escalate only if inspectable evidence shows the same consequential misunderstanding across multiple learners.",
    releaseCondition:
      "Return to Observer when the learner can state a source-supported claim and continue reasoning independently.",
  };
}

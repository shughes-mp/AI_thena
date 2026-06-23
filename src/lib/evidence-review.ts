import type { EvidenceSignalRecord } from "../types";

export type EvidenceStrength = "limited" | "developing" | "strong";
export type EvidenceSort =
  | "newest"
  | "oldest"
  | "confidence"
  | "learner"
  | "review_state";

export interface EvidenceReviewFilters {
  search: string;
  learningOutcomeId: string;
  evidenceQuestionId: string;
  strength: "all" | EvidenceStrength;
  confidence: "all" | EvidenceSignalRecord["confidenceLevel"];
  reviewState: "all" | EvidenceSignalRecord["status"];
  resolution: "all" | "resolved" | "unresolved";
  learner: string;
  sort: EvidenceSort;
}

export const DEFAULT_EVIDENCE_REVIEW_FILTERS: EvidenceReviewFilters = {
  search: "",
  learningOutcomeId: "all",
  evidenceQuestionId: "all",
  strength: "all",
  confidence: "all",
  reviewState: "all",
  resolution: "all",
  learner: "all",
  sort: "newest",
};

const confidenceRank = { high: 3, medium: 2, low: 1 } as const;
const reviewRank = {
  provisional: 5,
  revised: 4,
  approved: 3,
  rejected: 2,
  superseded: 1,
} as const;

export function getEvidenceStrength(
  signal: EvidenceSignalRecord
): EvidenceStrength {
  const substantiveCitations = signal.citations.filter(
    (citation) =>
      citation.citationType === "learner_message" ||
      citation.citationType === "source_passage"
  ).length;
  const missingEvidence = signal.missingEvidence.trim().toLowerCase();
  const hasMaterialMissingEvidence =
    missingEvidence.length > 0 &&
    !missingEvidence.startsWith("none") &&
    !missingEvidence.startsWith("no missing");
  if (
    signal.confidenceLevel === "high" &&
    substantiveCitations >= 2 &&
    !hasMaterialMissingEvidence
  ) {
    return "strong";
  }
  if (signal.confidenceLevel !== "low" && substantiveCitations > 0) {
    return "developing";
  }
  return "limited";
}

export function filterAndSortEvidenceSignals(
  signals: EvidenceSignalRecord[],
  filters: EvidenceReviewFilters
) {
  const search = filters.search.trim().toLowerCase();
  const filtered = signals.filter((signal) => {
    if (
      search &&
      ![
        signal.claim,
        signal.learnerName ?? "",
        ...signal.citations.map((citation) => citation.quotedText),
      ].some((value) => value.toLowerCase().includes(search))
    ) {
      return false;
    }
    if (
      filters.learningOutcomeId !== "all" &&
      !signal.learningOutcomes.some(
        (outcome) => outcome.id === filters.learningOutcomeId
      )
    ) {
      return false;
    }
    if (
      filters.evidenceQuestionId !== "all" &&
      !signal.evidenceQuestions.some(
        (question) => question.id === filters.evidenceQuestionId
      )
    ) {
      return false;
    }
    if (
      filters.strength !== "all" &&
      getEvidenceStrength(signal) !== filters.strength
    ) {
      return false;
    }
    if (
      filters.confidence !== "all" &&
      signal.confidenceLevel !== filters.confidence
    ) {
      return false;
    }
    if (
      filters.reviewState !== "all" &&
      signal.status !== filters.reviewState
    ) {
      return false;
    }
    if (
      filters.resolution !== "all" &&
      signal.misunderstandingResolved !==
        (filters.resolution === "resolved")
    ) {
      return false;
    }
    if (
      filters.learner !== "all" &&
      signal.studentSessionId !== filters.learner
    ) {
      return false;
    }
    return true;
  });

  return filtered.sort((left, right) => {
    if (filters.sort === "oldest") {
      return Date.parse(left.createdAt) - Date.parse(right.createdAt);
    }
    if (filters.sort === "confidence") {
      return confidenceRank[right.confidenceLevel] - confidenceRank[left.confidenceLevel];
    }
    if (filters.sort === "learner") {
      return (left.learnerName ?? "").localeCompare(right.learnerName ?? "");
    }
    if (filters.sort === "review_state") {
      return reviewRank[right.status] - reviewRank[left.status];
    }
    return Date.parse(right.createdAt) - Date.parse(left.createdAt);
  });
}

export function formatEvidenceAge(value: string, now = Date.now()) {
  const seconds = Math.max(0, Math.floor((now - Date.parse(value)) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

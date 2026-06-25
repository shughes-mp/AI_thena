import type {
  EvidenceCitation,
  EvidenceReview,
  EvidenceSignal,
  FacilitationRecommendation,
  EvidenceSignalLearningOutcome,
  EvidenceSignalQuestion,
  LearningOutcome,
  EvidenceQuestion,
  EvidenceQualification,
  StudentSession,
} from "@prisma/client";
import { parseStringArray } from "./facilitation.ts";
import type {
  EvidenceSignalRecord,
  EvidenceSignalStatus,
} from "@/types";

type SignalWithRelations = EvidenceSignal & {
  studentSession: Pick<StudentSession, "studentName"> | null;
  citations: EvidenceCitation[];
  reviews: EvidenceReview[];
  recommendation: FacilitationRecommendation | null;
  learningOutcomeLinks: Array<
    EvidenceSignalLearningOutcome & { learningOutcome: LearningOutcome }
  >;
  evidenceQuestionLinks: Array<
    EvidenceSignalQuestion & { evidenceQuestion: EvidenceQuestion }
  >;
  qualifications: EvidenceQualification[];
  misconception: { resolved: boolean } | null;
};

export function hasRequiredMisunderstandingCitations(
  signal: Pick<EvidenceSignal, "signalType"> & {
    citations: Array<Pick<EvidenceCitation, "citationType" | "recordId" | "quotedText">>;
  }
) {
  if (signal.signalType !== "possible_misunderstanding") return true;

  return ["learner_message", "source_passage"].every((citationType) =>
    signal.citations.some(
      (citation) =>
        citation.citationType === citationType &&
        citation.recordId.length > 0 &&
        citation.quotedText.trim().length > 0
    )
  );
}

export function serializeEvidenceSignal(
  signal: SignalWithRelations
): EvidenceSignalRecord {
  return {
    id: signal.id,
    sessionId: signal.sessionId,
    studentSessionId: signal.studentSessionId,
    learnerName: signal.studentSession?.studentName ?? null,
    signalType: signal.signalType,
    scopeType: signal.scopeType as EvidenceSignalRecord["scopeType"],
    scopeId: signal.scopeId,
    claim: signal.claim,
    status: signal.status as EvidenceSignalStatus,
    confidenceLevel:
      signal.confidenceLevel as EvidenceSignalRecord["confidenceLevel"],
    confidenceRationale: signal.confidenceRationale,
    limitations: signal.limitations,
    missingEvidence: signal.missingEvidence,
    contradictoryEvidence: signal.contradictoryEvidence,
    opportunitySummary: signal.opportunitySummary,
    misunderstandingResolved: signal.misconception?.resolved ?? null,
    learningOutcomes: signal.learningOutcomeLinks.map(({ learningOutcome }: any) => ({
      id: learningOutcome.id,
      label: learningOutcome.label,
    })),
    evidenceQuestions: signal.evidenceQuestionLinks.map(
      ({ evidenceQuestion }: any) => ({
        id: evidenceQuestion.id,
        prompt: evidenceQuestion.prompt,
        processLevel: evidenceQuestion.processLevel,
      })
    ),
    qualifications: signal.qualifications.map((qualification: any) => ({
      id: qualification.id,
      kind: qualification.kind as EvidenceSignalRecord["qualifications"][number]["kind"],
      summary: qualification.summary,
      createdBy: qualification.createdBy,
    })),
    createdBy: signal.createdBy,
    modelId: signal.modelId,
    promptVersion: signal.promptVersion,
    parserVersion: signal.parserVersion,
    evidencePolicyVersion: signal.evidencePolicyVersion,
    sourceSetVersion: signal.sourceSetVersion,
    supersedesSignalId: signal.supersedesSignalId,
    createdAt: signal.createdAt.toISOString(),
    updatedAt: signal.updatedAt.toISOString(),
    citations: signal.citations.map((citation: any) => ({
      id: citation.id,
      citationType:
        citation.citationType as EvidenceSignalRecord["citations"][number]["citationType"],
      recordId: citation.recordId,
      quotedText: citation.quotedText,
      startOffset: citation.startOffset,
      endOffset: citation.endOffset,
      sourceFilename: citation.sourceFilename,
      passageId: citation.passageId,
      relevanceRationale: citation.relevanceRationale,
    })),
    reviews: signal.reviews.map((review: any) => ({
      id: review.id,
      action:
        review.action as EvidenceSignalRecord["reviews"][number]["action"],
      previousStatus: review.previousStatus as EvidenceSignalStatus,
      newStatus: review.newStatus as EvidenceSignalStatus,
      previousClaim: review.previousClaim,
      revisedClaim: review.revisedClaim,
      rationale: review.rationale,
      contextualNote: review.contextualNote,
      actorType: review.actorType,
      actorId: review.actorId,
      createdAt: review.createdAt.toISOString(),
    })),
    recommendation: signal.recommendation
      ? {
          id: signal.recommendation.id,
          sessionId: signal.recommendation.sessionId,
          signalId: signal.recommendation.signalId,
          mode: signal.recommendation.mode as "observer" | "guide" | "conductor",
          selectedMode: signal.recommendation.selectedMode as
            | "observer"
            | "guide"
            | "conductor"
            | null,
          effectiveMode: (signal.recommendation.selectedMode ||
            signal.recommendation.mode) as "observer" | "guide" | "conductor",
          scopeType: signal.recommendation.scopeType as "learner" | "group" | "class",
          scopeIds: parseStringArray(signal.recommendation.scopeIds),
          triggerSignalIds: (() => {
            const storedTriggerSignalIds = parseStringArray(
              signal.recommendation.triggerSignalIds
            );
            return storedTriggerSignalIds.length > 0
              ? storedTriggerSignalIds
              : [signal.id];
          })(),
          triggeringEvidence: [
            {
              signalId: signal.id,
              claim: signal.claim,
              learnerName: signal.studentSession?.studentName ?? null,
              status: signal.status as EvidenceSignalStatus,
            },
          ],
          observedCondition: signal.recommendation.observedCondition,
          diagnosisQuestion: signal.recommendation.diagnosisQuestion,
          rationale: signal.recommendation.rationale,
          suggestedMove: signal.recommendation.suggestedMove,
          suggestedPhrase: signal.recommendation.suggestedPhrase,
          editedPhrase: signal.recommendation.editedPhrase,
          effectivePhrase:
            signal.recommendation.editedPhrase || signal.recommendation.suggestedPhrase,
          confidenceLevel:
            signal.recommendation.confidenceLevel as "low" | "medium" | "high",
          limitations: signal.recommendation.limitations,
          escalationCondition: signal.recommendation.escalationCondition,
          releaseCondition: signal.recommendation.releaseCondition,
          ruleVersion: signal.recommendation.ruleVersion,
          createdBy: signal.recommendation.createdBy as "rule" | "model" | "instructor",
          reviewState: signal.recommendation.reviewState as
            | "provisional"
            | "accepted"
            | "modified"
            | "rejected"
            | "used",
          actionUsed: signal.recommendation.actionUsed,
          helpfulness: signal.recommendation.helpfulness as
            | "helped"
            | "partly_helped"
            | "did_not_help"
            | "not_yet_known"
            | null,
          instructorFeedback: signal.recommendation.instructorFeedback,
          decisionActorId: signal.recommendation.decisionActorId,
          decidedAt: signal.recommendation.decidedAt?.toISOString() ?? null,
          createdAt: signal.recommendation.createdAt.toISOString(),
          updatedAt: signal.recommendation.updatedAt.toISOString(),
        }
      : null,
  };
}

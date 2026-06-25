import type { FacilitationRecommendation } from "@prisma/client";
import type { EvidenceSignalStatus, FacilitationRecommendationRecord } from "../types/index.ts";
import { prisma } from "./db.ts";
import { EVIDENCE_VERSIONS } from "./evidence.ts";

export type FacilitationMode = "observer" | "guide" | "conductor";
export type FacilitationScope = "learner" | "group" | "class";
export type FacilitationConfidence = "low" | "medium" | "high";

export interface FacilitationRuleSignal {
  id: string;
  studentSessionId: string | null;
  learnerName: string | null;
  claim: string;
  status: string;
  confidenceLevel: FacilitationConfidence;
  resolved: boolean;
}

export interface FacilitationPivotCandidate {
  signalId: string;
  mode: FacilitationMode;
  scopeType: FacilitationScope;
  scopeIds: string[];
  triggerSignalIds: string[];
  observedCondition: string;
  diagnosisQuestion: string | null;
  rationale: string;
  suggestedMove: string;
  suggestedPhrase: string | null;
  confidenceLevel: FacilitationConfidence;
  limitations: string;
  escalationCondition: string | null;
  releaseCondition: string;
}

const CONFIDENCE_RANK: Record<FacilitationConfidence, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function normalizeClaim(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function lowestConfidence(signals: FacilitationRuleSignal[]): FacilitationConfidence {
  return signals.reduce<FacilitationConfidence>(
    (lowest, signal) =>
      CONFIDENCE_RANK[signal.confidenceLevel] < CONFIDENCE_RANK[lowest]
        ? signal.confidenceLevel
        : lowest,
    "high"
  );
}

function unique(values: Array<string | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export function deriveFacilitationPivots(input: {
  signals: FacilitationRuleSignal[];
  totalLearners: number;
}): FacilitationPivotCandidate[] {
  const active = input.signals.filter(
    (signal) => signal.status !== "rejected" && signal.status !== "superseded"
  );
  const unresolved = active.filter((signal) => !signal.resolved);
  const groups = new Map<string, FacilitationRuleSignal[]>();

  for (const signal of unresolved) {
    const key = normalizeClaim(signal.claim) || signal.id;
    const group = groups.get(key) ?? [];
    group.push(signal);
    groups.set(key, group);
  }

  const candidates: FacilitationPivotCandidate[] = [];
  const classSignalIds = new Set<string>();

  for (const group of groups.values()) {
    const learnerIds = unique(group.map((signal) => signal.studentSessionId));
    const widespread =
      learnerIds.length >= 2 &&
      input.totalLearners > 0 &&
      learnerIds.length / input.totalLearners >= 0.4;
    if (!widespread) continue;

    group.forEach((signal) => classSignalIds.add(signal.id));
    const representative = group[0];
    candidates.push({
      signalId: representative.id,
      mode: "conductor",
      scopeType: "class",
      scopeIds: learnerIds,
      triggerSignalIds: group.map((signal) => signal.id),
      observedCondition: `The same consequential misunderstanding appears across ${learnerIds.length} of ${input.totalLearners} learners.`,
      diagnosisQuestion: "Are other learners using the same interpretation, and can they identify the evidence behind it?",
      rationale:
        "The pattern is shared rather than isolated, so a brief common clarification is more proportionate than repeating individual guidance.",
      suggestedMove:
        "Pause briefly, name the shared distinction without completing the task, and relaunch learners into the original reasoning work.",
      suggestedPhrase: `Let us pause on one distinction that is appearing across several responses: ${representative.claim} What evidence would confirm or complicate that interpretation?`,
      confidenceLevel: lowestConfidence(group),
      limitations: `This recommendation represents ${learnerIds.length} of ${input.totalLearners} learners and should not be generalized beyond the observed session evidence.`,
      escalationCondition:
        "Maintain the shared reset only if learners still cannot state the distinction or next reasoning step after the clarification.",
      releaseCondition:
        "Return to Guide or Observer as soon as learners can restate the distinction and resume the task independently.",
    });
  }

  for (const signal of active) {
    if (classSignalIds.has(signal.id)) continue;
    const learnerScope = signal.studentSessionId ? [signal.studentSessionId] : [];

    if (signal.resolved) {
      candidates.push({
        signalId: signal.id,
        mode: "observer",
        scopeType: "learner",
        scopeIds: learnerScope,
        triggerSignalIds: [signal.id],
        observedCondition:
          "The learner has repaired the observed misunderstanding and resumed usable reasoning.",
        diagnosisQuestion: null,
        rationale:
          "The available evidence indicates productive momentum, so preserving learner control is proportionate.",
        suggestedMove:
          "Continue observing and collect evidence for later debrief without interrupting the learner's reasoning.",
        suggestedPhrase: null,
        confidenceLevel: signal.confidenceLevel,
        limitations:
          "Resolution is bounded to the observed exchange and does not establish stable mastery or transfer.",
        escalationCondition:
          "Move to Guide if later evidence becomes shallow, stalled, source-conflicting, or uncertain.",
        releaseCondition:
          "Remain in Observer while the learner continues substantive, self-sustaining reasoning.",
      });
      continue;
    }

    candidates.push({
      signalId: signal.id,
      mode: "guide",
      scopeType: "learner",
      scopeIds: learnerScope,
      triggerSignalIds: [signal.id],
      observedCondition: "An isolated learner-level misunderstanding remains unresolved.",
      diagnosisQuestion: "Which evidence supports your current interpretation, and what might complicate it?",
      rationale:
        "The evidence is learner-scoped, so a focusing question is more proportionate than a class-wide intervention.",
      suggestedMove:
        "Ask the learner to identify relevant evidence, compare it with the current claim, and revise or defend the claim.",
      suggestedPhrase: `What evidence supports “${signal.claim.slice(0, 160)}”? Is there anything in the source that might complicate that reading?`,
      confidenceLevel: signal.confidenceLevel,
      limitations:
        "This recommendation is based on one learner's observed work and cannot justify a group or class reset by itself.",
      escalationCondition:
        "Escalate only if the same consequential misunderstanding is supported by inspectable evidence across multiple learners.",
      releaseCondition:
        "Return to Observer when the learner can state an evidence-supported claim and continue reasoning independently.",
    });
  }

  return candidates;
}

export function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function refreshFacilitationRecommendations(sessionId: string) {
  const [signals, totalLearners] = await Promise.all([
    prisma.evidenceSignal.findMany({
      where: {
        sessionId,
        signalType: "possible_misunderstanding",
        status: { notIn: ["rejected", "superseded"] },
      },
      include: {
        studentSession: { select: { studentName: true } },
        misconception: { select: { resolved: true } },
        recommendation: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.studentSession.count({ where: { sessionId } }),
  ]);

  const candidates = deriveFacilitationPivots({
    totalLearners,
    signals: signals.map((signal: any) => ({
      id: signal.id,
      studentSessionId: signal.studentSessionId,
      learnerName: signal.studentSession?.studentName ?? null,
      claim: signal.claim,
      status: signal.status,
      confidenceLevel: signal.confidenceLevel as FacilitationConfidence,
      resolved: signal.misconception?.resolved ?? false,
    })),
  }).map((candidate) => {
    const representative = signals.find((signal: any) => signal.id === candidate.signalId);
    if (
      candidate.mode !== "conductor" ||
      !representative?.recommendation ||
      representative.recommendation.reviewState === "provisional"
    ) {
      return candidate;
    }

    const eligibleTrigger = candidate.triggerSignalIds.find((signalId) => {
      const trigger = signals.find((signal: any) => signal.id === signalId);
      return !trigger?.recommendation || trigger.recommendation.reviewState === "provisional";
    });
    return eligibleTrigger ? { ...candidate, signalId: eligibleTrigger } : candidate;
  });
  const currentSignalIds = candidates.map((candidate) => candidate.signalId);

  await prisma.$transaction(async (tx: any) => {
    await tx.facilitationRecommendation.deleteMany({
      where: {
        sessionId,
        reviewState: "provisional",
        ...(currentSignalIds.length > 0
          ? { signalId: { notIn: currentSignalIds } }
          : {}),
      },
    });

    if (currentSignalIds.length === 0) {
      await tx.facilitationRecommendation.deleteMany({
        where: { sessionId, reviewState: "provisional" },
      });
      return;
    }

    for (const candidate of candidates) {
      const existing = await tx.facilitationRecommendation.findUnique({
        where: { signalId: candidate.signalId },
        select: { id: true, reviewState: true, triggerSignalIds: true },
      });
      if (existing && existing.reviewState !== "provisional") {
        if (parseStringArray(existing.triggerSignalIds).length === 0) {
          await tx.facilitationRecommendation.update({
            where: { id: existing.id },
            data: {
              sessionId,
              triggerSignalIds: JSON.stringify(candidate.triggerSignalIds),
            },
          });
        }
        continue;
      }

      const data = {
        sessionId,
        mode: candidate.mode,
        scopeType: candidate.scopeType,
        scopeIds: JSON.stringify(candidate.scopeIds),
        triggerSignalIds: JSON.stringify(candidate.triggerSignalIds),
        observedCondition: candidate.observedCondition,
        diagnosisQuestion: candidate.diagnosisQuestion,
        rationale: candidate.rationale,
        suggestedMove: candidate.suggestedMove,
        suggestedPhrase: candidate.suggestedPhrase,
        confidenceLevel: candidate.confidenceLevel,
        limitations: candidate.limitations,
        escalationCondition: candidate.escalationCondition,
        releaseCondition: candidate.releaseCondition,
        ruleVersion: EVIDENCE_VERSIONS.facilitationRules,
        createdBy: "rule",
        reviewState: "provisional",
      };

      await tx.facilitationRecommendation.upsert({
        where: { signalId: candidate.signalId },
        create: { signalId: candidate.signalId, ...data },
        update: data,
      });
    }
  });

  return prisma.facilitationRecommendation.findMany({
    where: { sessionId },
    orderBy: [{ scopeType: "asc" }, { updatedAt: "desc" }],
  });
}

export function serializeFacilitationRecommendation(
  record: FacilitationRecommendation,
  triggeringEvidence: FacilitationRecommendationRecord["triggeringEvidence"]
): FacilitationRecommendationRecord {
  const mode = record.mode as FacilitationMode;
  const selectedMode = record.selectedMode as FacilitationMode | null;
  return {
    id: record.id,
    sessionId: record.sessionId,
    signalId: record.signalId,
    mode,
    selectedMode,
    effectiveMode: selectedMode ?? mode,
    scopeType: record.scopeType as FacilitationScope,
    scopeIds: parseStringArray(record.scopeIds),
    triggerSignalIds: parseStringArray(record.triggerSignalIds),
    triggeringEvidence: triggeringEvidence.map((item) => ({
      ...item,
      status: item.status as EvidenceSignalStatus,
    })),
    observedCondition: record.observedCondition,
    diagnosisQuestion: record.diagnosisQuestion,
    rationale: record.rationale,
    suggestedMove: record.suggestedMove,
    suggestedPhrase: record.suggestedPhrase,
    editedPhrase: record.editedPhrase,
    effectivePhrase: record.editedPhrase ?? record.suggestedPhrase,
    confidenceLevel: record.confidenceLevel as FacilitationConfidence,
    limitations: record.limitations,
    escalationCondition: record.escalationCondition,
    releaseCondition: record.releaseCondition,
    ruleVersion: record.ruleVersion,
    createdBy: record.createdBy as "rule" | "model" | "instructor",
    reviewState: record.reviewState as FacilitationRecommendationRecord["reviewState"],
    actionUsed: record.actionUsed,
    helpfulness: record.helpfulness as FacilitationRecommendationRecord["helpfulness"],
    instructorFeedback: record.instructorFeedback,
    decisionActorId: record.decisionActorId,
    decidedAt: record.decidedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

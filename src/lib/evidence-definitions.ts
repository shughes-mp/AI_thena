import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parseLearningOutcomes } from "@/lib/evidence-definition-parser";

export async function syncLearningOutcomes(
  tx: Prisma.TransactionClient,
  sessionId: string,
  raw: string | null | undefined
) {
  const outcomes = parseLearningOutcomes(raw);
  const activeKeys = outcomes.map((outcome) => outcome.normalizedKey);

  await tx.learningOutcome.updateMany({
    where: {
      sessionId,
      ...(activeKeys.length > 0
        ? { normalizedKey: { notIn: activeKeys } }
        : {}),
    },
    data: { active: false },
  });

  for (const outcome of outcomes) {
    await tx.learningOutcome.upsert({
      where: {
        sessionId_normalizedKey: {
          sessionId,
          normalizedKey: outcome.normalizedKey,
        },
      },
      create: { sessionId, ...outcome },
      update: {
        orderIndex: outcome.orderIndex,
        label: outcome.label,
        active: true,
      },
    });
  }
}

export async function syncEvidenceQuestions(
  tx: Prisma.TransactionClient,
  sessionId: string
) {
  const checkpoints = await tx.checkpoint.findMany({
    where: { sessionId },
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
  });
  const checkpointIds = checkpoints.map((checkpoint: any) => checkpoint.id);

  await tx.evidenceQuestion.updateMany({
    where: {
      sessionId,
      checkpointId:
        checkpointIds.length > 0 ? { notIn: checkpointIds } : { not: null },
    },
    data: { active: false },
  });

  for (const checkpoint of checkpoints) {
    await tx.evidenceQuestion.upsert({
      where: { checkpointId: checkpoint.id },
      create: {
        sessionId,
        checkpointId: checkpoint.id,
        orderIndex: checkpoint.orderIndex,
        prompt: checkpoint.prompt,
        processLevel: checkpoint.processLevel,
      },
      update: {
        orderIndex: checkpoint.orderIndex,
        prompt: checkpoint.prompt,
        processLevel: checkpoint.processLevel,
        active: true,
      },
    });
  }
}

export async function ensureNormalizedEvidenceDefinitions(sessionId: string) {
  return prisma.$transaction(async (tx: any) => {
    const session = await tx.session.findUnique({
      where: { id: sessionId },
      select: { learningOutcomes: true },
    });
    if (!session) return false;

    await syncLearningOutcomes(tx, sessionId, session.learningOutcomes);
    await syncEvidenceQuestions(tx, sessionId);
    return true;
  });
}

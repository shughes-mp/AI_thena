import { NextResponse } from "next/server";
import { ensureDatabaseReady, prisma } from "@/lib/db";
import { parseStringArray, serializeFacilitationRecommendation } from "@/lib/facilitation";
import { requireSessionAccess } from "@/lib/instructor-auth";
import type { ApiError, EvidenceSignalStatus } from "@/types";

export const dynamic = "force-dynamic";

const MODES = ["observer", "guide", "conductor"] as const;
const REVIEW_STATES = ["provisional", "accepted", "modified", "rejected", "used"] as const;
const HELPFULNESS = ["helped", "partly_helped", "did_not_help", "not_yet_known"] as const;

function optionalText(value: unknown, maximum: number) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new Error("INVALID_TEXT");
  const normalized = value.trim();
  if (normalized.length > maximum) throw new Error("TEXT_TOO_LONG");
  return normalized || null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; pivotId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId, pivotId } = await params;
    const access = await requireSessionAccess(sessionId, "editor");
    if (!access.ok) return access.response;
    const body = (await request.json()) as Record<string, unknown>;
    const existing = await prisma.facilitationRecommendation.findUnique({
      where: { id: pivotId },
    });
    if (!existing || existing.sessionId !== sessionId) {
      return NextResponse.json<ApiError>(
        { error: "Facilitation pivot not found.", code: "PIVOT_NOT_FOUND" },
        { status: 404 }
      );
    }

    const selectedMode = body.selectedMode ?? existing.selectedMode;
    const reviewState = body.reviewState ?? existing.reviewState;
    const helpfulness = body.helpfulness ?? existing.helpfulness;
    if (selectedMode !== null && !MODES.includes(selectedMode as (typeof MODES)[number])) {
      throw new Error("INVALID_MODE");
    }
    if (!REVIEW_STATES.includes(reviewState as (typeof REVIEW_STATES)[number])) {
      throw new Error("INVALID_REVIEW_STATE");
    }
    if (helpfulness !== null && !HELPFULNESS.includes(helpfulness as (typeof HELPFULNESS)[number])) {
      throw new Error("INVALID_HELPFULNESS");
    }

    const updated = await prisma.facilitationRecommendation.update({
      where: { id: pivotId },
      data: {
        selectedMode: selectedMode as string | null,
        editedPhrase:
          "editedPhrase" in body ? optionalText(body.editedPhrase, 800) : existing.editedPhrase,
        actionUsed:
          "actionUsed" in body ? optionalText(body.actionUsed, 1200) : existing.actionUsed,
        helpfulness: helpfulness as string | null,
        instructorFeedback:
          "instructorFeedback" in body
            ? optionalText(body.instructorFeedback, 2000)
            : existing.instructorFeedback,
        reviewState: reviewState as string,
        decisionActorId: access.userId,
        decidedAt: new Date(),
      },
    });

    const storedTriggerIds = parseStringArray(updated.triggerSignalIds);
    const triggerIds =
      storedTriggerIds.length > 0 ? storedTriggerIds : [updated.signalId];
    const signals = await prisma.evidenceSignal.findMany({
      where: { id: { in: triggerIds }, sessionId },
      include: { studentSession: { select: { studentName: true } } },
    });
    const signalMap = new Map(signals.map((signal: any) => [signal.id, signal]));
    return NextResponse.json({
      pivot: serializeFacilitationRecommendation(
        updated,
        triggerIds
          .map((id) => signalMap.get(id))
          .filter((signal): signal is NonNullable<typeof signal> => Boolean(signal))
          .map((signal: any) => ({
            signalId: signal.id,
            claim: signal.claim,
            learnerName: signal.studentSession?.studentName ?? null,
            status: signal.status as EvidenceSignalStatus,
          }))
      ),
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (["INVALID_TEXT", "TEXT_TOO_LONG", "INVALID_MODE", "INVALID_REVIEW_STATE", "INVALID_HELPFULNESS"].includes(code)) {
      return NextResponse.json<ApiError>(
        { error: "The facilitation decision contains an invalid value.", code },
        { status: 400 }
      );
    }
    console.error("Failed to update facilitation pivot:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to update facilitation pivot.", code: "PIVOT_UPDATE_FAILED" },
      { status: 500 }
    );
  }
}

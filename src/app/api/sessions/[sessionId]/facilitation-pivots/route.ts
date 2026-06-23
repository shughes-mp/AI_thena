import { NextResponse } from "next/server";
import { ensureDatabaseReady, prisma } from "@/lib/db";
import {
  parseStringArray,
  refreshFacilitationRecommendations,
  serializeFacilitationRecommendation,
} from "@/lib/facilitation";
import { requireSessionAccess } from "@/lib/instructor-auth";

export const dynamic = "force-dynamic";

function getTriggerSignalIds(pivot: {
  signalId: string;
  triggerSignalIds: string;
}) {
  const triggerIds = parseStringArray(pivot.triggerSignalIds);
  return triggerIds.length > 0 ? triggerIds : [pivot.signalId];
}

async function loadPivots(sessionId: string) {
  const pivots = await prisma.facilitationRecommendation.findMany({
    where: { sessionId },
    orderBy: [{ scopeType: "asc" }, { updatedAt: "desc" }],
  });
  const triggerIds = Array.from(
    new Set(pivots.flatMap(getTriggerSignalIds))
  );
  const signals = triggerIds.length
    ? await prisma.evidenceSignal.findMany({
        where: { id: { in: triggerIds }, sessionId },
        include: { studentSession: { select: { studentName: true } } },
      })
    : [];
  const signalMap = new Map(signals.map((signal) => [signal.id, signal]));

  return pivots.map((pivot) =>
    serializeFacilitationRecommendation(
      pivot,
      getTriggerSignalIds(pivot)
        .map((signalId) => signalMap.get(signalId))
        .filter((signal): signal is NonNullable<typeof signal> => Boolean(signal))
        .map((signal) => ({
          signalId: signal.id,
          claim: signal.claim,
          learnerName: signal.studentSession?.studentName ?? null,
          status: signal.status as "provisional" | "approved" | "revised" | "rejected" | "superseded",
        }))
    )
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId } = await params;
    const access = await requireSessionAccess(sessionId, "viewer");
    if (!access.ok) return access.response;
    return NextResponse.json({
      pivots: await loadPivots(sessionId),
      canEdit: access.role === "editor" || access.role === "owner",
      ruleVersion: "facilitation-2.0.0",
    });
  } catch (error) {
    console.error("Failed to load facilitation pivots:", error);
    return NextResponse.json(
      { error: "Failed to load facilitation pivots.", code: "FACILITATION_LOAD_FAILED" },
      { status: 500 }
    );
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId } = await params;
    const access = await requireSessionAccess(sessionId, "editor");
    if (!access.ok) return access.response;
    await refreshFacilitationRecommendations(sessionId);
    return NextResponse.json({
      pivots: await loadPivots(sessionId),
      canEdit: true,
      ruleVersion: "facilitation-2.0.0",
    });
  } catch (error) {
    console.error("Failed to refresh facilitation pivots:", error);
    return NextResponse.json(
      { error: "Failed to refresh facilitation pivots.", code: "FACILITATION_REFRESH_FAILED" },
      { status: 500 }
    );
  }
}

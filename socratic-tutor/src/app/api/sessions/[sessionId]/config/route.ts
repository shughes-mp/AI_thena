import { NextResponse } from "next/server";
import { ensureDatabaseReady, prisma } from "@/lib/db";
import { syncLearningOutcomes } from "@/lib/evidence-definitions";
import { requireSessionAccess } from "@/lib/instructor-auth";
import { isValidSessionPurpose } from "@/lib/session-purpose";
import type { ApiError } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId } = await params;
    const access = await requireSessionAccess(sessionId, "editor");
    if (!access.ok) return access.response;
    const body = await request.json();
    const {
      name,
      description,
      courseContext,
      learningGoal,
      learningOutcomes,
      prerequisiteMap,
      maxExchanges,
      opensAt,
      closesAt,
      stance,
      sessionPurpose,
    } = body as {
      name?: string;
      description?: string | null;
      courseContext?: string | null;
      learningGoal?: string | null;
      learningOutcomes?: string | null;
      prerequisiteMap?: string | null;
      maxExchanges?: number;
      opensAt?: string | null;
      closesAt?: string | null;
      stance?: string;
      sessionPurpose?: string;
    };

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json<ApiError>(
        { error: "Session not found.", code: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (courseContext !== undefined) updateData.courseContext = courseContext?.trim() || null;
    if (learningGoal !== undefined) updateData.learningGoal = learningGoal?.trim() || null;
    if (learningOutcomes !== undefined)
      updateData.learningOutcomes = learningOutcomes?.trim() || null;
    if (prerequisiteMap !== undefined)
      updateData.prerequisiteMap = prerequisiteMap?.trim() || null;
    if (maxExchanges !== undefined)
      updateData.maxExchanges = Math.max(1, Math.min(100, maxExchanges));
    if (opensAt !== undefined) updateData.opensAt = opensAt ? new Date(opensAt) : null;
    if (closesAt !== undefined) updateData.closesAt = closesAt ? new Date(closesAt) : null;
    if (stance !== undefined) {
      if (!["directed", "mentor"].includes(stance)) {
        return NextResponse.json(
          { error: "stance must be 'directed' or 'mentor'" },
          { status: 400 }
        );
      }
      updateData.stance = stance;
    }
    if (sessionPurpose !== undefined) {
      if (!isValidSessionPurpose(sessionPurpose)) {
        return NextResponse.json(
          { error: "Invalid sessionPurpose value." },
          { status: 400 }
        );
      }
      updateData.sessionPurpose = sessionPurpose;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.session.update({
        where: { id: sessionId },
        data: updateData,
      });
      if (learningOutcomes !== undefined) {
        await syncLearningOutcomes(tx, sessionId, next.learningOutcomes);
      }
      return next;
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      courseContext: updated.courseContext,
      learningGoal: updated.learningGoal,
      learningOutcomes: updated.learningOutcomes,
      prerequisiteMap: updated.prerequisiteMap,
      accessCode: updated.accessCode,
      maxExchanges: updated.maxExchanges,
      stance: updated.stance,
      sessionPurpose: updated.sessionPurpose,
    });
  } catch (error) {
    console.error("Error updating session config:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to update session.", code: "UPDATE_FAILED" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { ensureDatabaseReady, prisma } from "@/lib/db";
import { requireSessionAccess } from "@/lib/instructor-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId } = await params;
    const access = await requireSessionAccess(sessionId, "viewer");
    if (!access.ok) return access.response;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        readings: { select: { id: true } },
        assessments: { select: { id: true } },
      },
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const [groundings, protectionEvents] = await Promise.all([
      prisma.tutorGrounding.findMany({
        where: { studentSession: { sessionId } },
        include: {
          message: { select: { content: true, createdAt: true } },
          studentSession: { select: { studentName: true } },
          citations: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.protectedAssessmentAudit.findMany({
        where: { sessionId },
        include: { studentSession: { select: { studentName: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    const counts = groundings.reduce<Record<string, number>>((result: any, item: any) => {
      result[item.status] = (result[item.status] ?? 0) + 1;
      return result;
    }, {});

    return NextResponse.json({
      readiness: {
        sourceMaterials: session.readings.length,
        protectedAssessments: session.assessments.length,
        sourceGroundingReady: session.readings.length > 0,
      },
      counts,
      groundings: groundings.map((item: any) => ({
        id: item.id,
        learnerName: item.studentSession.studentName,
        response: item.message.content,
        status: item.status,
        learnerCitationVisible: item.learnerCitationVisible,
        unsupportedReason: item.unsupportedReason,
        sourceSetVersion: item.sourceSetVersion,
        createdAt: item.createdAt.toISOString(),
        citations: item.citations.map((citation: any) => ({
          id: citation.id,
          filename: citation.filename,
          passageId: citation.passageId,
          quotedText: citation.quotedText,
          startOffset: citation.startOffset,
          endOffset: citation.endOffset,
        })),
      })),
      protectionEvents: protectionEvents.map((item: any) => ({
        id: item.id,
        learnerName: item.studentSession.studentName,
        triggerType: item.triggerType,
        action: item.action,
        sourceConflict: item.sourceConflict,
        detail: item.detail,
        policyVersion: item.policyVersion,
        createdAt: item.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to load grounding audit:", error);
    return NextResponse.json({ error: "Failed to load grounding audit." }, { status: 500 });
  }
}

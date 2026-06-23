import { NextResponse } from "next/server";
import { ensureDatabaseReady, prisma } from "@/lib/db";
import { requireSessionAccess } from "@/lib/instructor-auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId } = await params;
    const access = await requireSessionAccess(sessionId, "viewer");
    if (!access.ok) return access.response;

    const studentSessions = await prisma.studentSession.findMany({
      where: { sessionId },
      select: {
        id: true,
        studentName: true,
        startedAt: true,
        endedAt: true,
        reflectionSubmittedAt: true,
        summaryContested: true,
        _count: {
          select: {
            messages: true,
            misconceptions: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            engagementFlag: true,
            engagementNote: true,
            role: true,
          },
          orderBy: { createdAt: "desc" as const },
          take: 5,
        },
        loAssessments: {
          select: {
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" as const },
          take: 1,
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json(
      studentSessions.map((studentSession) => {
        const latestFlaggedMessage = studentSession.messages.find(
          (message) =>
            message.role === "user" &&
            message.engagementFlag &&
            message.engagementFlag !== "on_task"
        );
        const latestEngagement = studentSession.messages.find(
          (message) => message.role === "user" && message.engagementFlag
        );
        const lastMessage = studentSession.messages[0];
        const isWaitingForStudentReply = lastMessage?.role === "assistant";
        const secondsSinceLastMessage = lastMessage
          ? Math.floor(
              (Date.now() - new Date(lastMessage.createdAt).getTime()) / 1000
            )
          : null;
        const reviewSignals: Array<{
          type: "engagement_concern" | "waiting_for_reply";
          observed: string;
          whyFlagged: string;
          uncertainty: string;
          relevantExchange: string;
          occurredAt: Date;
          suggestedAction: string;
        }> = [];

        if (latestFlaggedMessage) {
          reviewSignals.push({
            type: "engagement_concern",
            observed: `Learner message: “${latestFlaggedMessage.content.slice(0, 180)}”`,
            whyFlagged:
              latestFlaggedMessage.engagementNote ||
              `The observable interaction pattern was labelled ${latestFlaggedMessage.engagementFlag?.replaceAll("_", " ")}.`,
            uncertainty:
              "This is a provisional interaction signal, not a judgment about motivation, attention, or effort.",
            relevantExchange: latestFlaggedMessage.id,
            occurredAt: latestFlaggedMessage.createdAt,
            suggestedAction:
              "Inspect the surrounding exchange and offer a smaller or more concrete prompt if support appears useful.",
          });
        }

        if (
          isWaitingForStudentReply &&
          secondsSinceLastMessage !== null &&
          secondsSinceLastMessage > 180 &&
          lastMessage
        ) {
          reviewSignals.push({
            type: "waiting_for_reply",
            observed: `No learner reply has followed the latest tutor prompt for ${Math.floor(secondsSinceLastMessage / 60)} minutes.`,
            whyFlagged:
              "A paused exchange may warrant a check-in when the session is being facilitated live.",
            uncertainty:
              "Silence alone does not establish disengagement or difficulty; the learner may simply be thinking or away.",
            relevantExchange: lastMessage.id,
            occurredAt: lastMessage.createdAt,
            suggestedAction:
              "If intervention is appropriate, ask whether the learner wants clarification; otherwise continue observing.",
          });
        }

        return {
          id: studentSession.id,
          studentName: studentSession.studentName,
          startedAt: studentSession.startedAt,
          endedAt: studentSession.endedAt,
          reflectionSubmittedAt: studentSession.reflectionSubmittedAt,
          summaryContested: studentSession.summaryContested,
          messageCount: studentSession._count.messages,
          misconceptionCount: studentSession._count.misconceptions,
          lastActiveAt: lastMessage?.createdAt ?? studentSession.startedAt,
          latestEngagementFlag: latestEngagement?.engagementFlag ?? null,
          hasRecentEngagementConcern: !!latestFlaggedMessage,
          isWaitingForStudentReply,
          secondsSinceLastMessage,
          latestRubricScore: studentSession.loAssessments[0]?.status ?? null,
          reviewSignals,
        };
      })
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to fetch student summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch student summary", details: message },
      { status: 500 }
    );
  }
}

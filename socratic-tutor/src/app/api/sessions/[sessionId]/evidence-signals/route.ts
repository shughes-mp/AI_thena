import { NextResponse } from "next/server";
import { ensureDatabaseReady, prisma } from "@/lib/db";
import {
  hasRequiredMisunderstandingCitations,
  serializeEvidenceSignal,
} from "@/lib/evidence-api";
import { requireSessionAccess } from "@/lib/instructor-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId } = await params;
    const access = await requireSessionAccess(sessionId, "viewer");
    if (!access.ok) return access.response;
    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const [signals, legacyMisconceptions] = await Promise.all([
      prisma.evidenceSignal.findMany({
        where: {
          sessionId,
          ...(status ? { status } : {}),
        },
        include: {
          studentSession: { select: { studentName: true } },
          citations: { orderBy: { createdAt: "asc" } },
          reviews: { orderBy: { createdAt: "desc" } },
          recommendation: true,
          learningOutcomeLinks: { include: { learningOutcome: true } },
          evidenceQuestionLinks: { include: { evidenceQuestion: true } },
          qualifications: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.misconception.findMany({
        where: {
          evidenceSignal: null,
          studentSession: { sessionId },
        },
        include: { studentSession: { select: { studentName: true } } },
        orderBy: { detectedAt: "desc" },
      }),
    ]);

    const renderable = signals.filter(hasRequiredMisunderstandingCitations);
    return NextResponse.json({
      signals: renderable.map(serializeEvidenceSignal),
      omittedForMissingCitations: signals.length - renderable.length,
      legacyUnversioned: legacyMisconceptions.map((item) => ({
        id: item.id,
        learnerName: item.studentSession.studentName,
        claim: item.canonicalClaim || item.studentMessage,
        description: item.description,
        confidence: item.confidence,
        passageAnchor: item.passageAnchor,
        createdAt: item.detectedAt.toISOString(),
        provenanceLabel: "legacy-unversioned" as const,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch evidence signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch evidence signals." },
      { status: 500 }
    );
  }
}

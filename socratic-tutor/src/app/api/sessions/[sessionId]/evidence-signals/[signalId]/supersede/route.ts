import { NextResponse } from "next/server";
import { ensureDatabaseReady, prisma } from "@/lib/db";
import { requireSessionAccess } from "@/lib/instructor-auth";

export async function POST(
  request: Request,
  {
    params,
  }: { params: Promise<{ sessionId: string; signalId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId, signalId } = await params;
    const access = await requireSessionAccess(sessionId, "editor");
    if (!access.ok) return access.response;
    const body = (await request.json()) as {
      replacementSignalId?: string;
      rationale?: string;
    };
    const replacementSignalId = body.replacementSignalId?.trim();
    const rationale = body.rationale?.trim();
    if (!replacementSignalId || !rationale) {
      return NextResponse.json(
        { error: "replacementSignalId and rationale are required." },
        { status: 400 }
      );
    }
    if (replacementSignalId === signalId) {
      return NextResponse.json(
        { error: "A signal cannot supersede itself." },
        { status: 400 }
      );
    }

    const [original, replacement] = await Promise.all([
      prisma.evidenceSignal.findFirst({
        where: { id: signalId, sessionId },
      }),
      prisma.evidenceSignal.findFirst({
        where: { id: replacementSignalId, sessionId },
        include: { citations: true },
      }),
    ]);

    if (!original || !replacement) {
      return NextResponse.json(
        { error: "Original or replacement signal not found in this session." },
        { status: 404 }
      );
    }
    if (original.status === "superseded") {
      return NextResponse.json(
        { error: "The original signal is already superseded." },
        { status: 409 }
      );
    }
    if (replacement.supersedesSignalId) {
      return NextResponse.json(
        { error: "The replacement signal is already part of a supersession chain." },
        { status: 409 }
      );
    }
    const hasLearnerCitation = replacement.citations.some(
      (citation) => citation.citationType === "learner_message"
    );
    const hasSourceCitation = replacement.citations.some(
      (citation) => citation.citationType === "source_passage"
    );
    if (!hasLearnerCitation || !hasSourceCitation) {
      return NextResponse.json(
        { error: "The replacement signal does not satisfy citation requirements." },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.evidenceSignal.update({
        where: { id: replacementSignalId },
        data: { supersedesSignalId: signalId },
      }),
      prisma.evidenceSignal.update({
        where: { id: signalId },
        data: { status: "superseded" },
      }),
      prisma.evidenceReview.create({
        data: {
          signalId,
          action: "supersede",
          previousStatus: original.status,
          newStatus: "superseded",
          previousClaim: original.claim,
          rationale,
          actorType: "system",
          actorId: access.userId,
        },
      }),
    ]);

    return NextResponse.json({
      originalSignalId: signalId,
      replacementSignalId,
      originalStatus: "superseded",
    });
  } catch (error) {
    console.error("Failed to supersede evidence signal:", error);
    return NextResponse.json(
      { error: "Failed to supersede evidence signal." },
      { status: 500 }
    );
  }
}

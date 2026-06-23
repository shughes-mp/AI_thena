import { NextResponse } from "next/server";
import { ensureDatabaseReady, prisma } from "@/lib/db";
import {
  EVIDENCE_STATUSES,
  getReviewTransition,
  type EvidenceReviewAction,
  type EvidenceStatus,
} from "@/lib/evidence";
import { serializeEvidenceSignal } from "@/lib/evidence-api";
import { requireSessionAccess } from "@/lib/instructor-auth";

const ACTIONS: EvidenceReviewAction[] = [
  "approve",
  "revise",
  "reject",
  "mark_acceptable",
  "flag_for_discussion",
  "add_context",
  "undo",
];

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
      action?: string;
      revisedClaim?: string;
      rationale?: string;
      contextualNote?: string;
    };
    const action = body.action as EvidenceReviewAction;

    if (!ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
    }
    if (action === "revise" && !body.revisedClaim?.trim()) {
      return NextResponse.json(
        { error: "A revised claim is required when revising a signal." },
        { status: 400 }
      );
    }
    if (["reject", "mark_acceptable"].includes(action) && !body.rationale?.trim()) {
      return NextResponse.json(
        { error: "A rationale is required for this review action." },
        { status: 400 }
      );
    }

    const existing = await prisma.evidenceSignal.findFirst({
      where: { id: signalId, sessionId },
      include: { reviews: { orderBy: { createdAt: "desc" } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Evidence signal not found." }, { status: 404 });
    }
    if (!EVIDENCE_STATUSES.includes(existing.status as EvidenceStatus)) {
      return NextResponse.json({ error: "Signal has an invalid status." }, { status: 409 });
    }

    const previousStateChange = existing.reviews.find(
      (review) => review.previousStatus !== review.newStatus
    );
    const previousForUndo = previousStateChange?.previousStatus as
      | EvidenceStatus
      | undefined;
    let newStatus: EvidenceStatus;
    try {
      newStatus = getReviewTransition(
        existing.status as EvidenceStatus,
        action,
        previousForUndo
      );
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid transition." },
        { status: 409 }
      );
    }

    const revisedClaim = body.revisedClaim?.trim() || null;
    const nextClaim =
      action === "undo" && previousStateChange
        ? previousStateChange.previousClaim
        : revisedClaim;
    await prisma.$transaction([
      prisma.evidenceReview.create({
        data: {
          signalId,
          action,
          previousStatus: existing.status,
          newStatus,
          previousClaim: existing.claim,
          revisedClaim,
          rationale: body.rationale?.trim() || null,
          contextualNote: body.contextualNote?.trim() || null,
          actorType: "instructor",
          actorId: access.userId,
        },
      }),
      prisma.evidenceSignal.update({
        where: { id: signalId },
        data: {
          status: newStatus,
          ...(nextClaim ? { claim: nextClaim } : {}),
        },
      }),
    ]);

    const updated = await prisma.evidenceSignal.findUniqueOrThrow({
      where: { id: signalId },
      include: {
        studentSession: { select: { studentName: true } },
        citations: { orderBy: { createdAt: "asc" } },
        reviews: { orderBy: { createdAt: "desc" } },
        recommendation: true,
        learningOutcomeLinks: { include: { learningOutcome: true } },
        evidenceQuestionLinks: { include: { evidenceQuestion: true } },
        qualifications: { orderBy: { createdAt: "asc" } },
        misconception: { select: { resolved: true } },
      },
    });

    return NextResponse.json({ signal: serializeEvidenceSignal(updated) });
  } catch (error) {
    console.error("Failed to review evidence signal:", error);
    return NextResponse.json(
      { error: "Failed to review evidence signal." },
      { status: 500 }
    );
  }
}

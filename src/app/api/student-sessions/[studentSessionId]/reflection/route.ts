import { NextResponse } from "next/server";

import { ensureDatabaseReady, prisma } from "@/lib/db";
import {
  hasLearnerReflection,
  normalizeLearnerReflection,
} from "@/lib/learner-experience";
import { matchesLearnerCapability } from "@/lib/learner-capability";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ studentSessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { studentSessionId } = await params;
    const body = await request.json();
    const studentSession = await prisma.studentSession.findUnique({
      where: { id: studentSessionId },
      select: {
        accessTokenHash: true,
        endedAt: true,
        sessionSummary: true,
      },
    });

    if (!studentSession) {
      return NextResponse.json(
        { error: "Session not found", code: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!matchesLearnerCapability(body.capabilityToken, studentSession.accessTokenHash)) {
      return NextResponse.json(
        { error: "Learner session authorization failed", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    if (!studentSession.endedAt || !studentSession.sessionSummary) {
      return NextResponse.json(
        { error: "Complete the session before submitting a reflection.", code: "SESSION_ACTIVE" },
        { status: 409 }
      );
    }

    const reflection = normalizeLearnerReflection(body);
    if (!hasLearnerReflection(reflection)) {
      return NextResponse.json(
        { error: "Add at least one reflection or summary note.", code: "EMPTY_REFLECTION" },
        { status: 400 }
      );
    }

    const updated = await prisma.studentSession.update({
      where: { id: studentSessionId },
      data: {
        reflectionChangedThinking: reflection.changedThinking || null,
        reflectionSupportedClaim: reflection.supportedClaim || null,
        reflectionRemainingUncertainty: reflection.remainingUncertainty || null,
        reflectionNextStep: reflection.nextStep || null,
        summaryAnnotation: reflection.summaryAnnotation || null,
        summaryContested: reflection.summaryContested,
        reflectionSubmittedAt: new Date(),
      },
      select: {
        reflectionChangedThinking: true,
        reflectionSupportedClaim: true,
        reflectionRemainingUncertainty: true,
        reflectionNextStep: true,
        summaryAnnotation: true,
        summaryContested: true,
        reflectionSubmittedAt: true,
      },
    });

    return NextResponse.json({ reflection: updated });
  } catch (error) {
    console.error("Learner reflection error:", error);
    return NextResponse.json(
      { error: "Could not save the reflection.", code: "REFLECTION_FAILED" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { ensureDatabaseReady, prisma } from "@/lib/db";
import { requireSessionAccess } from "@/lib/instructor-auth";
import {
  SESSION_PLANNING_VERSION,
  buildLearnerExperiencePreview,
  evaluateSessionDesign,
  generateAnticipatedPivots,
  normalizeAnticipatedPivots,
  parseAnticipatedPivots,
  parseParticipationPlan,
  type AnticipatedPivotPoint,
  type ParticipationPlan,
  type PlanningSessionInput,
} from "@/lib/session-planning";
import type { ApiError } from "@/types";

async function loadPlanningSession(sessionId: string) {
  return prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      checkpoints: {
        select: {
          id: true,
          prompt: true,
          processLevel: true,
          misconceptionSeeds: true,
        },
        orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
      },
      readings: { select: { id: true } },
      assessments: { select: { content: true } },
    },
  });
}

function planningResponse(
  session: NonNullable<Awaited<ReturnType<typeof loadPlanningSession>>>,
  role: "viewer" | "editor" | "owner"
) {
  const planningSession: PlanningSessionInput = {
    id: session.id,
    name: session.name,
    description: session.description,
    learningGoal: session.learningGoal,
    learningOutcomes: session.learningOutcomes,
    maxExchanges: session.maxExchanges,
    sessionPurpose: session.sessionPurpose,
    planningOpeningQuestion: session.planningOpeningQuestion,
    planningTaskInstructions: session.planningTaskInstructions,
    planningIntendedOutput: session.planningIntendedOutput,
    participationPlan: session.participationPlan,
    anticipatedPivots: session.anticipatedPivots,
    planningVersion: session.planningVersion,
  };
  const participation = parseParticipationPlan(session.participationPlan);
  const pivots = parseAnticipatedPivots(session.anticipatedPivots);
  const preview = buildLearnerExperiencePreview(
    planningSession,
    session.checkpoints,
    session.readings.length > 0,
    session.assessments.length > 0
  );
  const checks = evaluateSessionDesign({
    session: planningSession,
    checkpoints: session.checkpoints,
    readingCount: session.readings.length,
    assessmentContents: session.assessments.map((assessment: any) => assessment.content),
    pivots,
    participation,
  });

  return {
    sessionId: session.id,
    planningVersion: session.planningVersion,
    canEdit: role !== "viewer",
    plan: {
      openingQuestion: session.planningOpeningQuestion ?? "",
      taskInstructions: session.planningTaskInstructions ?? "",
      intendedOutput: session.planningIntendedOutput ?? "",
      participation,
      pivots,
    },
    preview,
    checks,
    summary: {
      ready: checks.filter((check) => check.status === "ready").length,
      review: checks.filter((check) => check.status === "review").length,
      needsAttention: checks.filter((check) => check.status === "needs_attention").length,
      total: checks.length,
    },
  };
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
    const session = await loadPlanningSession(sessionId);
    if (!session) {
      return NextResponse.json<ApiError>(
        { error: "Session not found.", code: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }
    return NextResponse.json(planningResponse(session, access.role));
  } catch (error) {
    console.error("Failed to load session planning:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to load session planning.", code: "PLANNING_LOAD_FAILED" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId } = await params;
    const access = await requireSessionAccess(sessionId, "editor");
    if (!access.ok) return access.response;
    const body = (await request.json()) as {
      openingQuestion?: string;
      taskInstructions?: string;
      intendedOutput?: string;
      participation?: Partial<ParticipationPlan>;
      pivots?: AnticipatedPivotPoint[];
    };
    const existing = await loadPlanningSession(sessionId);
    if (!existing) {
      return NextResponse.json<ApiError>(
        { error: "Session not found.", code: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const participation = body.participation === undefined
      ? parseParticipationPlan(existing.participationPlan)
      : parseParticipationPlan(JSON.stringify(body.participation));
    const pivots = body.pivots === undefined
      ? parseAnticipatedPivots(existing.anticipatedPivots)
      : normalizeAnticipatedPivots(body.pivots);
    const clean = (value: string | undefined, fallback: string | null) =>
      value === undefined ? fallback : value.trim().slice(0, 4000) || null;

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        planningOpeningQuestion: clean(body.openingQuestion, existing.planningOpeningQuestion),
        planningTaskInstructions: clean(body.taskInstructions, existing.planningTaskInstructions),
        planningIntendedOutput: clean(body.intendedOutput, existing.planningIntendedOutput),
        participationPlan: JSON.stringify(participation),
        anticipatedPivots: JSON.stringify(pivots),
        planningVersion: SESSION_PLANNING_VERSION,
        learnerPreviewCheckedAt: new Date(),
      },
    });

    const updated = await loadPlanningSession(sessionId);
    return NextResponse.json(planningResponse(updated!, access.role));
  } catch (error) {
    console.error("Failed to save session planning:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to save session planning.", code: "PLANNING_SAVE_FAILED" },
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
    const existing = await loadPlanningSession(sessionId);
    if (!existing) {
      return NextResponse.json<ApiError>(
        { error: "Session not found.", code: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const planningSession: PlanningSessionInput = {
      ...existing,
      planningVersion: existing.planningVersion,
    };
    const instructorPivots = parseAnticipatedPivots(existing.anticipatedPivots)
      .filter((pivot) => pivot.createdBy === "instructor");
    const generated = generateAnticipatedPivots(planningSession, existing.checkpoints);
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        anticipatedPivots: JSON.stringify([...instructorPivots, ...generated].slice(0, 12)),
        planningVersion: SESSION_PLANNING_VERSION,
        learnerPreviewCheckedAt: new Date(),
      },
    });

    const updated = await loadPlanningSession(sessionId);
    return NextResponse.json(planningResponse(updated!, access.role));
  } catch (error) {
    console.error("Failed to generate anticipated pivots:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to generate anticipated pivots.", code: "PIVOT_GENERATION_FAILED" },
      { status: 500 }
    );
  }
}

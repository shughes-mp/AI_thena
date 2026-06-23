import { NextResponse } from "next/server";
import { ensureDatabaseReady, prisma } from "@/lib/db";
import type { ApiError } from "@/types";
import {
  ensureNormalizedEvidenceDefinitions,
  syncEvidenceQuestions,
} from "@/lib/evidence-definitions";
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
      select: { id: true },
    });

    if (!session) {
      return NextResponse.json<ApiError>(
        { error: "Session not found.", code: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }

    await ensureNormalizedEvidenceDefinitions(sessionId);
    const checkpoints = await prisma.checkpoint.findMany({
      where: { sessionId },
      include: { evidenceQuestion: true },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ checkpoints });
  } catch (error) {
    console.error("Error loading checkpoints:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to load checkpoints.", code: "CHECKPOINTS_LOAD_FAILED" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId } = await params;
    const access = await requireSessionAccess(sessionId, "editor");
    if (!access.ok) return access.response;
    const body = (await request.json()) as {
      prompt?: string;
      processLevel?: string;
      expectations?: string[] | null;
      misconceptionSeeds?: string[] | null;
    };

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });

    if (!session) {
      return NextResponse.json<ApiError>(
        { error: "Session not found.", code: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const prompt = body.prompt?.trim();
    if (!prompt) {
      return NextResponse.json<ApiError>(
        { error: "Checkpoint prompt is required.", code: "PROMPT_REQUIRED" },
        { status: 400 }
      );
    }

    const processLevel =
      body.processLevel === "retrieve" ||
      body.processLevel === "infer" ||
      body.processLevel === "integrate" ||
      body.processLevel === "evaluate"
        ? body.processLevel
        : "infer";

    const checkpoint = await prisma.$transaction(async (tx) => {
      const maxCheckpoint = await tx.checkpoint.findFirst({
        where: { sessionId },
        orderBy: { orderIndex: "desc" },
        select: { orderIndex: true },
      });
      const created = await tx.checkpoint.create({
        data: {
          sessionId,
          orderIndex: (maxCheckpoint?.orderIndex ?? -1) + 1,
          prompt,
          processLevel,
          expectations:
            Array.isArray(body.expectations) && body.expectations.length > 0
              ? JSON.stringify(body.expectations)
              : null,
          misconceptionSeeds:
            Array.isArray(body.misconceptionSeeds) && body.misconceptionSeeds.length > 0
              ? JSON.stringify(body.misconceptionSeeds)
              : null,
        },
      });
      await syncEvidenceQuestions(tx, sessionId);
      return created;
    });

    return NextResponse.json({ checkpoint }, { status: 201 });
  } catch (error) {
    console.error("Error creating checkpoint:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to create checkpoint.", code: "CHECKPOINT_CREATE_FAILED" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId } = await params;
    const access = await requireSessionAccess(sessionId, "editor");
    if (!access.ok) return access.response;
    const body = (await request.json()) as { checkpointId?: string };

    const checkpointId = body.checkpointId?.trim();
    if (!checkpointId) {
      return NextResponse.json<ApiError>(
        { error: "checkpointId is required.", code: "CHECKPOINT_ID_REQUIRED" },
        { status: 400 }
      );
    }

    const checkpoint = await prisma.checkpoint.findUnique({
      where: { id: checkpointId },
      select: { id: true, sessionId: true },
    });

    if (!checkpoint || checkpoint.sessionId !== sessionId) {
      return NextResponse.json<ApiError>(
        { error: "Checkpoint not found.", code: "CHECKPOINT_NOT_FOUND" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.evidenceQuestion.updateMany({
        where: { checkpointId },
        data: { active: false, checkpointId: null },
      });
      await tx.checkpoint.delete({ where: { id: checkpointId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting checkpoint:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to delete checkpoint.", code: "CHECKPOINT_DELETE_FAILED" },
      { status: 500 }
    );
  }
}

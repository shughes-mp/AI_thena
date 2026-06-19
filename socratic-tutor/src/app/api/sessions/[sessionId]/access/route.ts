import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSessionAccess } from "@/lib/instructor-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const access = await requireSessionAccess(sessionId, "owner");
  if (!access.ok) return access.response;

  const grants = await prisma.sessionInstructor.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ grants });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const access = await requireSessionAccess(sessionId, "owner");
  if (!access.ok) return access.response;

  const body = (await request.json()) as { clerkUserId?: string; role?: string };
  const clerkUserId = body.clerkUserId?.trim();
  if (!clerkUserId || !["viewer", "editor"].includes(body.role || "")) {
    return NextResponse.json(
      { error: "clerkUserId and a viewer or editor role are required." },
      { status: 400 }
    );
  }
  if (clerkUserId === access.userId) {
    return NextResponse.json(
      { error: "The session owner already has full access." },
      { status: 409 }
    );
  }

  const grant = await prisma.sessionInstructor.upsert({
    where: { sessionId_clerkUserId: { sessionId, clerkUserId } },
    create: {
      sessionId,
      clerkUserId,
      role: body.role!,
      grantedByUserId: access.userId,
    },
    update: { role: body.role!, grantedByUserId: access.userId },
  });
  return NextResponse.json({ grant }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const access = await requireSessionAccess(sessionId, "owner");
  if (!access.ok) return access.response;

  const body = (await request.json()) as { clerkUserId?: string };
  const clerkUserId = body.clerkUserId?.trim();
  if (!clerkUserId) {
    return NextResponse.json(
      { error: "clerkUserId is required." },
      { status: 400 }
    );
  }

  await prisma.sessionInstructor.deleteMany({ where: { sessionId, clerkUserId } });
  return NextResponse.json({ success: true });
}

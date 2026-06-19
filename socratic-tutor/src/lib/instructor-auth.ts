import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureDatabaseReady, prisma } from "@/lib/db";
import {
  isRoleSufficient,
  resolveInstructorRole,
  type InstructorRole,
} from "@/lib/instructor-access-policy";

type AuthorizedInstructor = {
  ok: true;
  userId: string;
};

type AuthorizedSession = AuthorizedInstructor & {
  role: InstructorRole;
};

type AuthorizationFailure = {
  ok: false;
  response: NextResponse;
};

export async function requireInstructor(): Promise<
  AuthorizedInstructor | AuthorizationFailure
> {
  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Instructor sign-in is required.", code: "UNAUTHENTICATED" },
        { status: 401 }
      ),
    };
  }
  return { ok: true, userId };
}

export async function requireSessionAccess(
  sessionId: string,
  requiredRole: InstructorRole = "viewer"
): Promise<AuthorizedSession | AuthorizationFailure> {
  const identity = await requireInstructor();
  if (!identity.ok) return identity;

  await ensureDatabaseReady();
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      ownerClerkUserId: true,
      instructorAccess: { select: { clerkUserId: true, role: true } },
    },
  });

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Session not found.", code: "SESSION_NOT_FOUND" },
        { status: 404 }
      ),
    };
  }

  const role = resolveInstructorRole(
    session.ownerClerkUserId,
    session.instructorAccess,
    identity.userId
  );

  if (role === null || !isRoleSufficient(role, requiredRole)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "You do not have access to this session.", code: "FORBIDDEN" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, userId: identity.userId, role };
}

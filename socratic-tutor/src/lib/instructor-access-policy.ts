export type InstructorRole = "viewer" | "editor" | "owner";

const ROLE_RANK: Record<InstructorRole, number> = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

export function normalizeInstructorRole(value: string | undefined | null) {
  return value === "editor" || value === "viewer" ? value : null;
}

export function resolveInstructorRole(
  ownerClerkUserId: string | null,
  grants: Array<{ clerkUserId: string; role: string }>,
  userId: string
): InstructorRole | null {
  if (ownerClerkUserId === userId) return "owner";
  const grant = grants.find((item) => item.clerkUserId === userId);
  return normalizeInstructorRole(grant?.role);
}

export function isRoleSufficient(
  actual: InstructorRole | null,
  required: InstructorRole
) {
  return actual !== null && ROLE_RANK[actual] >= ROLE_RANK[required];
}

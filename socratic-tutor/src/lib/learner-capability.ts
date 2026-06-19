import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function createLearnerCapability() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashLearnerCapability(token) };
}

export function hashLearnerCapability(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function matchesLearnerCapability(
  token: string | null | undefined,
  expectedHash: string | null | undefined
) {
  if (!token || !expectedHash) return false;
  const actual = Buffer.from(hashLearnerCapability(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

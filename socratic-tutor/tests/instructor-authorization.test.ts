import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  isRoleSufficient,
  resolveInstructorRole,
} from "../src/lib/instructor-access-policy.ts";
import {
  createLearnerCapability,
  matchesLearnerCapability,
} from "../src/lib/learner-capability.ts";

test("owner, editor, and viewer permissions are ordered explicitly", () => {
  assert.equal(isRoleSufficient("owner", "owner"), true);
  assert.equal(isRoleSufficient("owner", "editor"), true);
  assert.equal(isRoleSufficient("editor", "viewer"), true);
  assert.equal(isRoleSufficient("viewer", "editor"), false);
  assert.equal(isRoleSufficient(null, "viewer"), false);
});

test("session roles are isolated by the grants supplied for that session", () => {
  assert.equal(resolveInstructorRole("owner-a", [], "owner-a"), "owner");
  assert.equal(
    resolveInstructorRole(
      "owner-a",
      [{ clerkUserId: "editor-b", role: "editor" }],
      "editor-b"
    ),
    "editor"
  );
  assert.equal(resolveInstructorRole("owner-a", [], "editor-b"), null);
  assert.equal(
    resolveInstructorRole(
      "owner-a",
      [{ clerkUserId: "viewer-c", role: "owner" }],
      "viewer-c"
    ),
    null
  );
});

test("every instructor session API declares server-side authorization", () => {
  const apiRoot = path.resolve(process.cwd(), "src/app/api/sessions");
  const routeFiles: string[] = [];

  function collect(directory: string) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(fullPath);
      if (entry.isFile() && entry.name === "route.ts") routeFiles.push(fullPath);
    }
  }

  collect(apiRoot);
  assert.ok(routeFiles.length > 0);
  for (const routeFile of routeFiles) {
    const source = fs.readFileSync(routeFile, "utf8");
    assert.match(
      source,
      /requireSessionAccess|requireInstructor/,
      `Missing authorization in ${routeFile}`
    );
  }
});

test("learner capabilities are scoped secrets rather than raw session IDs", () => {
  const first = createLearnerCapability();
  const second = createLearnerCapability();
  assert.notEqual(first.token, second.token);
  assert.equal(matchesLearnerCapability(first.token, first.tokenHash), true);
  assert.equal(matchesLearnerCapability(second.token, first.tokenHash), false);
  assert.equal(matchesLearnerCapability("student-session-id", first.tokenHash), false);
  assert.equal(matchesLearnerCapability(null, first.tokenHash), false);
});

test("evidence review UI exposes every required instructor action", () => {
  const source = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "src/components/instructor/evidence-review-panel.tsx"
    ),
    "utf8"
  );
  for (const action of [
    "approve",
    "revise",
    "reject",
    "mark_acceptable",
    "flag_for_discussion",
    "add_context",
    "undo",
  ]) {
    assert.match(source, new RegExp(`review\\(signal, \\"${action}\\"\\)`));
  }
});

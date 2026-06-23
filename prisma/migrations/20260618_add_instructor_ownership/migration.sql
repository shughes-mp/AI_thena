-- AlterTable
ALTER TABLE "Session" ADD COLUMN "ownerClerkUserId" TEXT;

-- CreateTable
CREATE TABLE "SessionInstructor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "grantedByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SessionInstructor_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SessionInstructor_clerkUserId_idx" ON "SessionInstructor"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionInstructor_sessionId_clerkUserId_key" ON "SessionInstructor"("sessionId", "clerkUserId");

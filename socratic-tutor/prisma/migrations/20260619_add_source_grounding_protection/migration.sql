CREATE TABLE "TutorGrounding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "studentSessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sourceSetVersion" TEXT,
    "retrievalVersion" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "parserVersion" TEXT NOT NULL,
    "learnerCitationVisible" BOOLEAN NOT NULL DEFAULT false,
    "unsupportedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TutorGrounding_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TutorGrounding_studentSessionId_fkey" FOREIGN KEY ("studentSessionId") REFERENCES "StudentSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "TutorSourceCitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groundingId" TEXT NOT NULL,
    "readingId" TEXT,
    "filename" TEXT NOT NULL,
    "passageId" TEXT NOT NULL,
    "quotedText" TEXT NOT NULL,
    "startOffset" INTEGER NOT NULL,
    "endOffset" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TutorSourceCitation_groundingId_fkey" FOREIGN KEY ("groundingId") REFERENCES "TutorGrounding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TutorSourceCitation_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "ProtectedAssessmentAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "studentSessionId" TEXT NOT NULL,
    "messageId" TEXT,
    "assessmentIds" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "sourceConflict" BOOLEAN NOT NULL DEFAULT false,
    "detail" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProtectedAssessmentAudit_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProtectedAssessmentAudit_studentSessionId_fkey" FOREIGN KEY ("studentSessionId") REFERENCES "StudentSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProtectedAssessmentAudit_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TutorGrounding_messageId_key" ON "TutorGrounding"("messageId");
CREATE INDEX "TutorGrounding_studentSessionId_createdAt_idx" ON "TutorGrounding"("studentSessionId", "createdAt");
CREATE INDEX "TutorGrounding_status_idx" ON "TutorGrounding"("status");
CREATE INDEX "TutorSourceCitation_groundingId_idx" ON "TutorSourceCitation"("groundingId");
CREATE INDEX "TutorSourceCitation_readingId_idx" ON "TutorSourceCitation"("readingId");
CREATE INDEX "ProtectedAssessmentAudit_sessionId_createdAt_idx" ON "ProtectedAssessmentAudit"("sessionId", "createdAt");
CREATE INDEX "ProtectedAssessmentAudit_studentSessionId_idx" ON "ProtectedAssessmentAudit"("studentSessionId");

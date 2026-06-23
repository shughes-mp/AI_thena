-- CreateTable
CREATE TABLE "LearningOutcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "legacySource" TEXT NOT NULL DEFAULT 'session.learningOutcomes',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LearningOutcome_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "checkpointId" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "processLevel" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "legacySource" TEXT NOT NULL DEFAULT 'checkpoint',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EvidenceQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvidenceQuestion_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceSignalLearningOutcome" (
    "signalId" TEXT NOT NULL,
    "learningOutcomeId" TEXT NOT NULL,
    "relevanceRationale" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("signalId", "learningOutcomeId"),
    CONSTRAINT "EvidenceSignalLearningOutcome_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "EvidenceSignal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvidenceSignalLearningOutcome_learningOutcomeId_fkey" FOREIGN KEY ("learningOutcomeId") REFERENCES "LearningOutcome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceSignalQuestion" (
    "signalId" TEXT NOT NULL,
    "evidenceQuestionId" TEXT NOT NULL,
    "relevanceRationale" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("signalId", "evidenceQuestionId"),
    CONSTRAINT "EvidenceSignalQuestion_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "EvidenceSignal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvidenceSignalQuestion_evidenceQuestionId_fkey" FOREIGN KEY ("evidenceQuestionId") REFERENCES "EvidenceQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EvidenceSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "studentSessionId" TEXT,
    "misconceptionId" TEXT,
    "signalType" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "claim" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'provisional',
    "confidenceLevel" TEXT NOT NULL,
    "confidenceRationale" TEXT NOT NULL,
    "limitations" TEXT NOT NULL,
    "missingEvidence" TEXT NOT NULL,
    "contradictoryEvidence" TEXT NOT NULL,
    "learningOutcomeIds" TEXT NOT NULL DEFAULT '[]',
    "evidenceQuestionIds" TEXT NOT NULL DEFAULT '[]',
    "opportunitySummary" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "productPolicyVersion" TEXT NOT NULL,
    "terminologyVersion" TEXT NOT NULL,
    "evidencePolicyVersion" TEXT NOT NULL,
    "governancePolicyVersion" TEXT NOT NULL,
    "promptVersion" TEXT,
    "modelProvider" TEXT,
    "modelId" TEXT,
    "modelConfigurationVersion" TEXT,
    "parserVersion" TEXT,
    "rubricVersion" TEXT,
    "facilitationRuleVersion" TEXT,
    "sourceSetVersion" TEXT,
    "supersedesSignalId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EvidenceSignal_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvidenceSignal_studentSessionId_fkey" FOREIGN KEY ("studentSessionId") REFERENCES "StudentSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvidenceSignal_misconceptionId_fkey" FOREIGN KEY ("misconceptionId") REFERENCES "Misconception" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EvidenceSignal_supersedesSignalId_fkey" FOREIGN KEY ("supersedesSignalId") REFERENCES "EvidenceSignal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EvidenceSignal" ("claim", "confidenceLevel", "confidenceRationale", "contradictoryEvidence", "createdAt", "createdBy", "evidencePolicyVersion", "evidenceQuestionIds", "facilitationRuleVersion", "governancePolicyVersion", "id", "learningOutcomeIds", "limitations", "misconceptionId", "missingEvidence", "modelConfigurationVersion", "modelId", "modelProvider", "opportunitySummary", "parserVersion", "productPolicyVersion", "promptVersion", "rubricVersion", "schemaVersion", "scopeId", "scopeType", "sessionId", "signalType", "sourceSetVersion", "status", "studentSessionId", "supersedesSignalId", "terminologyVersion", "updatedAt") SELECT "claim", "confidenceLevel", "confidenceRationale", "contradictoryEvidence", "createdAt", "createdBy", "evidencePolicyVersion", "evidenceQuestionIds", "facilitationRuleVersion", "governancePolicyVersion", "id", "learningOutcomeIds", "limitations", "misconceptionId", "missingEvidence", "modelConfigurationVersion", "modelId", "modelProvider", "opportunitySummary", "parserVersion", "productPolicyVersion", "promptVersion", "rubricVersion", "schemaVersion", "scopeId", "scopeType", "sessionId", "signalType", "sourceSetVersion", "status", "studentSessionId", "supersedesSignalId", "terminologyVersion", "updatedAt" FROM "EvidenceSignal";
DROP TABLE "EvidenceSignal";
ALTER TABLE "new_EvidenceSignal" RENAME TO "EvidenceSignal";
CREATE UNIQUE INDEX "EvidenceSignal_misconceptionId_key" ON "EvidenceSignal"("misconceptionId");
CREATE INDEX "EvidenceSignal_sessionId_idx" ON "EvidenceSignal"("sessionId");
CREATE INDEX "EvidenceSignal_studentSessionId_idx" ON "EvidenceSignal"("studentSessionId");
CREATE INDEX "EvidenceSignal_status_idx" ON "EvidenceSignal"("status");
CREATE INDEX "EvidenceSignal_signalType_idx" ON "EvidenceSignal"("signalType");
CREATE INDEX "EvidenceSignal_supersedesSignalId_idx" ON "EvidenceSignal"("supersedesSignalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "LearningOutcome_sessionId_active_idx" ON "LearningOutcome"("sessionId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "LearningOutcome_sessionId_normalizedKey_key" ON "LearningOutcome"("sessionId", "normalizedKey");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceQuestion_checkpointId_key" ON "EvidenceQuestion"("checkpointId");

-- CreateIndex
CREATE INDEX "EvidenceQuestion_sessionId_active_idx" ON "EvidenceQuestion"("sessionId", "active");

-- CreateIndex
CREATE INDEX "EvidenceSignalLearningOutcome_learningOutcomeId_idx" ON "EvidenceSignalLearningOutcome"("learningOutcomeId");

-- CreateIndex
CREATE INDEX "EvidenceSignalQuestion_evidenceQuestionId_idx" ON "EvidenceSignalQuestion"("evidenceQuestionId");

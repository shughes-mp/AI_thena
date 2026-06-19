-- Preserve the session-purpose field that was previously bootstrapped at
-- runtime but was missing from migration history.
ALTER TABLE "Session" ADD COLUMN "sessionPurpose" TEXT NOT NULL DEFAULT 'pre_class';

-- CreateTable
CREATE TABLE "EvidenceSignal" (
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
    CONSTRAINT "EvidenceSignal_misconceptionId_fkey" FOREIGN KEY ("misconceptionId") REFERENCES "Misconception" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceCitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "signalId" TEXT NOT NULL,
    "citationType" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "messageId" TEXT,
    "readingId" TEXT,
    "quotedText" TEXT NOT NULL,
    "startOffset" INTEGER,
    "endOffset" INTEGER,
    "sourceFilename" TEXT,
    "passageId" TEXT,
    "relevanceRationale" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceCitation_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "EvidenceSignal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvidenceCitation_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EvidenceCitation_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "signalId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "previousClaim" TEXT NOT NULL,
    "revisedClaim" TEXT,
    "rationale" TEXT,
    "contextualNote" TEXT,
    "actorType" TEXT NOT NULL DEFAULT 'instructor',
    "actorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceReview_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "EvidenceSignal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacilitationRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "signalId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeIds" TEXT NOT NULL,
    "observedCondition" TEXT NOT NULL,
    "diagnosisQuestion" TEXT,
    "rationale" TEXT NOT NULL,
    "suggestedMove" TEXT NOT NULL,
    "suggestedPhrase" TEXT,
    "confidenceLevel" TEXT NOT NULL,
    "limitations" TEXT NOT NULL,
    "escalationCondition" TEXT,
    "releaseCondition" TEXT NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "reviewState" TEXT NOT NULL DEFAULT 'provisional',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FacilitationRecommendation_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "EvidenceSignal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceSignal_misconceptionId_key" ON "EvidenceSignal"("misconceptionId");

-- CreateIndex
CREATE INDEX "EvidenceSignal_sessionId_idx" ON "EvidenceSignal"("sessionId");

-- CreateIndex
CREATE INDEX "EvidenceSignal_studentSessionId_idx" ON "EvidenceSignal"("studentSessionId");

-- CreateIndex
CREATE INDEX "EvidenceSignal_status_idx" ON "EvidenceSignal"("status");

-- CreateIndex
CREATE INDEX "EvidenceSignal_signalType_idx" ON "EvidenceSignal"("signalType");

-- CreateIndex
CREATE INDEX "EvidenceCitation_signalId_idx" ON "EvidenceCitation"("signalId");

-- CreateIndex
CREATE INDEX "EvidenceCitation_messageId_idx" ON "EvidenceCitation"("messageId");

-- CreateIndex
CREATE INDEX "EvidenceCitation_readingId_idx" ON "EvidenceCitation"("readingId");

-- CreateIndex
CREATE INDEX "EvidenceReview_signalId_idx" ON "EvidenceReview"("signalId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilitationRecommendation_signalId_key" ON "FacilitationRecommendation"("signalId");

-- CreateIndex
CREATE INDEX "Assessment_sessionId_idx" ON "Assessment"("sessionId");

-- CreateIndex
CREATE INDEX "ConfidenceCheck_studentSessionId_idx" ON "ConfidenceCheck"("studentSessionId");

-- CreateIndex
CREATE INDEX "Message_studentSessionId_idx" ON "Message"("studentSessionId");

-- CreateIndex
CREATE INDEX "Misconception_studentSessionId_idx" ON "Misconception"("studentSessionId");

-- CreateIndex
CREATE INDEX "Reading_sessionId_idx" ON "Reading"("sessionId");

-- CreateIndex
CREATE INDEX "StudentSession_sessionId_idx" ON "StudentSession"("sessionId");

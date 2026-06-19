-- CreateTable
CREATE TABLE "EvidenceQualification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "signalId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceQualification_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "EvidenceSignal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EvidenceQualification_signalId_kind_idx" ON "EvidenceQualification"("signalId", "kind");

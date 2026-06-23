ALTER TABLE "FacilitationRecommendation" ADD COLUMN "sessionId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "FacilitationRecommendation" ADD COLUMN "triggerSignalIds" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "FacilitationRecommendation" ADD COLUMN "selectedMode" TEXT;
ALTER TABLE "FacilitationRecommendation" ADD COLUMN "editedPhrase" TEXT;
ALTER TABLE "FacilitationRecommendation" ADD COLUMN "actionUsed" TEXT;
ALTER TABLE "FacilitationRecommendation" ADD COLUMN "helpfulness" TEXT;
ALTER TABLE "FacilitationRecommendation" ADD COLUMN "instructorFeedback" TEXT;
ALTER TABLE "FacilitationRecommendation" ADD COLUMN "decisionActorId" TEXT;
ALTER TABLE "FacilitationRecommendation" ADD COLUMN "decidedAt" DATETIME;

UPDATE "FacilitationRecommendation"
SET "sessionId" = COALESCE(
  (SELECT "sessionId" FROM "EvidenceSignal" WHERE "EvidenceSignal"."id" = "FacilitationRecommendation"."signalId"),
  ''
);

CREATE INDEX "FacilitationRecommendation_sessionId_reviewState_idx"
ON "FacilitationRecommendation"("sessionId", "reviewState");
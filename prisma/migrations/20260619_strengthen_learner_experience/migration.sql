-- Phase 4 learner reflection and summary-correction fields are additive.
ALTER TABLE "StudentSession" ADD COLUMN "reflectionChangedThinking" TEXT;
ALTER TABLE "StudentSession" ADD COLUMN "reflectionSupportedClaim" TEXT;
ALTER TABLE "StudentSession" ADD COLUMN "reflectionRemainingUncertainty" TEXT;
ALTER TABLE "StudentSession" ADD COLUMN "reflectionNextStep" TEXT;
ALTER TABLE "StudentSession" ADD COLUMN "summaryAnnotation" TEXT;
ALTER TABLE "StudentSession" ADD COLUMN "summaryContested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "StudentSession" ADD COLUMN "reflectionSubmittedAt" DATETIME;

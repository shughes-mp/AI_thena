ALTER TABLE "Session" ADD COLUMN "planningOpeningQuestion" TEXT;
ALTER TABLE "Session" ADD COLUMN "planningTaskInstructions" TEXT;
ALTER TABLE "Session" ADD COLUMN "planningIntendedOutput" TEXT;
ALTER TABLE "Session" ADD COLUMN "participationPlan" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Session" ADD COLUMN "anticipatedPivots" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Session" ADD COLUMN "planningVersion" TEXT NOT NULL DEFAULT 'planning-1.0.0';

ALTER TABLE "Report" ADD COLUMN "structuredContent" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Report" ADD COLUMN "schemaVersion" TEXT NOT NULL DEFAULT 'teaching-brief-1.0.0';
ALTER TABLE "Report" ADD COLUMN "promptVersion" TEXT;
ALTER TABLE "Report" ADD COLUMN "modelProvider" TEXT;
ALTER TABLE "Report" ADD COLUMN "modelId" TEXT;
ALTER TABLE "Report" ADD COLUMN "reviewStateSummary" TEXT NOT NULL DEFAULT 'unreviewed';

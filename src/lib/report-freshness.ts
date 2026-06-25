import { prisma } from "./db";
import {
  buildFileSetFingerprint,
  buildSessionConfigFingerprint,
  hasStructuredTeachingBrief,
  parseTeachingBrief,
  TEACHING_BRIEF_PROMPT_VERSION,
  TEACHING_BRIEF_SCHEMA_VERSION,
} from "./teaching-brief";

type ReportFreshnessInput = {
  structuredContent: string;
  schemaVersion: string;
  promptVersion: string | null;
  generatedAt: Date;
};

export async function getReportFreshness(
  sessionId: string,
  report: ReportFreshnessInput
) {
  const [session, message, signal, review, recommendation, pivot, readings, assessments, outcome, question] = await Promise.all([
    prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        name: true,
        description: true,
        courseContext: true,
        learningGoal: true,
        learningOutcomes: true,
        prerequisiteMap: true,
        sessionPurpose: true,
        stance: true,
        maxExchanges: true,
        planningOpeningQuestion: true,
        planningTaskInstructions: true,
        planningIntendedOutput: true,
        participationPlan: true,
        anticipatedPivots: true,
        planningVersion: true,
      },
    }),
    prisma.message.findFirst({
      where: { studentSession: { sessionId } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.evidenceSignal.findFirst({
      where: { sessionId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.evidenceReview.findFirst({
      where: { signal: { sessionId } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.teachingRecommendation.findFirst({
      where: { sessionId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.facilitationRecommendation.findFirst({
      where: { sessionId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.reading.findMany({
      where: { sessionId },
      select: { id: true, filename: true, uploadedAt: true },
    }),
    prisma.assessment.findMany({
      where: { sessionId },
      select: { id: true, filename: true, uploadedAt: true },
    }),
    prisma.learningOutcome.findFirst({
      where: { sessionId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.evidenceQuestion.findFirst({
      where: { sessionId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
  ]);

  const timestamps = [
    message?.createdAt,
    signal?.updatedAt,
    review?.createdAt,
    recommendation?.updatedAt,
    pivot?.updatedAt,
    ...readings.map((reading: any) => reading.uploadedAt),
    ...assessments.map((assessment: any) => assessment.uploadedAt),
    outcome?.updatedAt,
    question?.updatedAt,
  ].filter((value): value is Date => Boolean(value));
  const latestChange = timestamps.reduce<Date | null>(
    (latest, value) => (!latest || value > latest ? value : latest),
    null
  );
  const configFingerprint = session
    ? buildSessionConfigFingerprint(session)
    : null;
  const brief = parseTeachingBrief(report.structuredContent);
  const versionMismatch =
    !hasStructuredTeachingBrief(report.structuredContent) ||
    report.schemaVersion !== TEACHING_BRIEF_SCHEMA_VERSION ||
    report.promptVersion !== TEACHING_BRIEF_PROMPT_VERSION ||
    brief?.session.configFingerprint !== configFingerprint ||
    brief?.session.sourceSetFingerprint !== buildFileSetFingerprint(readings) ||
    brief?.session.assessmentSetFingerprint !== buildFileSetFingerprint(assessments);

  return {
    stale:
      versionMismatch ||
      Boolean(latestChange && latestChange > report.generatedAt),
    latestChange,
    configFingerprint,
  };
}

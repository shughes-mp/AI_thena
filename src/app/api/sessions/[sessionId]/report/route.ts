import { NextResponse } from "next/server";
import { ensureDatabaseReady, prisma } from "@/lib/db";
import { generateInstructorReport } from "@/lib/report-generator";
import { getReportFreshness } from "@/lib/report-freshness";
import { requireSessionAccess } from "@/lib/instructor-auth";
import { parseTeachingBrief } from "@/lib/teaching-brief";

async function getLOAssessments(sessionId: string) {
  return prisma.lOAssessment.findMany({
    where: { studentSession: { sessionId } },
    include: {
      studentSession: { select: { id: true, studentName: true } },
    },
    orderBy: [
      { studentSession: { studentName: "asc" } },
      { createdAt: "asc" },
    ],
  });
}

async function reportResponse(
  sessionId: string,
  report: NonNullable<Awaited<ReturnType<typeof prisma.report.findFirst>>>,
  stale: boolean,
  regenerationAllowed: boolean
) {
  return NextResponse.json({
    ...report,
    brief: parseTeachingBrief(report.structuredContent),
    loAssessments: await getLOAssessments(sessionId),
    stale,
    regenerationAllowed,
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId } = await params;
    const access = await requireSessionAccess(sessionId, "viewer");
    if (!access.ok) return access.response;

    const latestReport = await prisma.report.findFirst({
      where: { sessionId },
      orderBy: { generatedAt: "desc" },
    });
    const regenerationAllowed = access.role !== "viewer";

    if (!latestReport) {
      return NextResponse.json(
        {
          error: regenerationAllowed
            ? "No teaching brief exists yet."
            : "No teaching brief exists yet. Ask an owner or editor to generate one.",
          code: "REPORT_NOT_FOUND",
          regenerationAllowed,
        },
        { status: 404 }
      );
    }

    const { stale } = await getReportFreshness(sessionId, latestReport);

    return reportResponse(
      sessionId,
      latestReport,
      stale,
      regenerationAllowed
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Report retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve report", details: message },
      { status: 500 }
    );
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { sessionId } = await params;
    const access = await requireSessionAccess(sessionId, "editor");
    if (!access.ok) return access.response;

    const report = await generateInstructorReport(sessionId);
    return reportResponse(sessionId, report, false, true);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report", details: message },
      { status: 500 }
    );
  }
}

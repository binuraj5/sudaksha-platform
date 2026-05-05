import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const session = await getApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { memberId } = await params;
  const member = await prisma.member.findFirst({
    where: { email: session.user.email ?? "" },
    select: { id: true },
  });

  if (!member || member.id !== memberId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const delta = await prisma.assessmentDelta.findFirst({
      where: { memberId },
      orderBy: { calculatedAt: "desc" },
      select: {
        id: true,
        baselineAssessmentId: true,
        followupAssessmentId: true,
        overallDelta: true,
        deltaScores: true,
        calculatedAt: true,
        baselineAssessment: { select: { completedAt: true } },
      },
    });

    if (!delta) {
      return NextResponse.json({ delta: null });
    }

    const [baselineScores, followupScores] = await Promise.all([
      prisma.competencyScore.findMany({
        where: { memberAssessmentId: delta.baselineAssessmentId },
        select: { competencyCode: true, proficiencyLevel: true },
      }),
      prisma.competencyScore.findMany({
        where: { memberAssessmentId: delta.followupAssessmentId },
        select: { competencyCode: true, proficiencyLevel: true },
      }),
    ]);

    const baselineMap = Object.fromEntries(
      baselineScores.map((s) => [s.competencyCode, s.proficiencyLevel])
    );
    const followupMap = Object.fromEntries(
      followupScores.map((s) => [s.competencyCode, s.proficiencyLevel])
    );
    const codes = Array.from(
      new Set([...Object.keys(baselineMap), ...Object.keys(followupMap)])
    );

    const competencies = codes.length
      ? await prisma.competency.findMany({
          where: { name: { in: codes } },
          select: { name: true, description: true },
        })
      : [];
    const nameMap = Object.fromEntries(
      competencies.map((c) => [c.name, c.description || c.name])
    );

    const rows = codes
      .map((code) => {
        const before = baselineMap[code];
        const after = followupMap[code];
        if (before == null || after == null) return null;
        return {
          competencyCode: code,
          competencyName: nameMap[code] || code,
          beforeLevel: before,
          afterLevel: after,
          delta: after - before,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      delta: {
        id: delta.id,
        baselineDate: delta.baselineAssessment?.completedAt?.toISOString() ?? null,
        overallDelta: delta.overallDelta ?? 0,
        competenciesCount: rows.length,
        rows,
      },
    });
  } catch (error) {
    console.error("[MEMBER_DELTA_API]", error);
    return NextResponse.json({ delta: null });
  }
}

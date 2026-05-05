/**
 * LMS Module Completion API
 * SEPL/INT/2026/IMPL-GAPS-01 Step G16
 * Patent claims C-04, C-05 — module completion tracking
 *
 * POST /api/lms/[activityId]/complete
 *   Marks the caller's ActivityMember as COMPLETED + records completedAt.
 *   Returns nextStep guidance for the client to navigate.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ activityId: string }> },
) {
  try {
    const session = await getApiSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activityId } = await params;

    const member = await prisma.member.findFirst({
      where: { email: (session.user as { email?: string }).email ?? "" },
      select: { id: true, tenantId: true },
    });
    if (!member) {
      return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
    }

    // SEPL/INT/2026/IMPL-GAPS-01 Step G17 — fetch linked assessments + their components
    // + a sample of questions per component (used to build micro-assessments).
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        id: true, tenantId: true, type: true, moduleOrder: true,
        assessments: {
          select: {
            id: true,
            assessmentModelId: true,
            assessmentModel: {
              select: {
                components: {
                  select: {
                    competencyId: true,
                    competency: { select: { id: true, name: true } },
                    questions: {
                      take: 5,
                      select: {
                        id: true,
                        questionText: true,
                        questionType: true,
                        options: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // Update or create ActivityMember (some flows enroll via assignment without
    // a pre-existing ActivityMember row, so upsert covers both cases).
    const activityMember = await prisma.activityMember.upsert({
      where: { activityId_memberId: { activityId, memberId: member.id } },
      update: {
        status: "COMPLETED",
        completedAt: new Date(),
        progressPct: 100,
      },
      create: {
        activityId,
        memberId: member.id,
        status: "COMPLETED",
        completedAt: new Date(),
        progressPct: 100,
      },
      select: { id: true, completedAt: true },
    });

    // ── SEPL/INT/2026/IMPL-GAPS-01 Step G17 — milestone micro-assessment trigger ──
    // For each competency linked to this module, create a MicroAssessment with
    // up to 3 quick questions. Returns the created IDs so the client can navigate.
    type CompetencyBucket = { competencyId: string; competencyName: string; questions: Array<{ id: string; text: string; type: string; options: unknown }> };
    const competencyBuckets: CompetencyBucket[] = [];

    for (const link of activity.assessments) {
      for (const comp of link.assessmentModel.components) {
        if (!comp.competencyId) continue;
        const sampled = comp.questions.slice(0, 3).map(q => ({
          id: q.id,
          text: q.questionText,
          type: String(q.questionType),
          options: q.options,
        }));
        if (sampled.length === 0) continue;
        competencyBuckets.push({
          competencyId: comp.competencyId,
          competencyName: comp.competency?.name ?? comp.competencyId,
          questions: sampled,
        });
      }
    }

    const microAssessmentIds: string[] = [];
    for (const bucket of competencyBuckets) {
      const ma = await prisma.microAssessment.create({
        data: {
          memberId: member.id,
          activityId,
          // CompetencyScore.competencyCode stores name ?? id (see computeCompetencyScores.ts:130).
          // Use name first so micro-assessment scores can be blended into existing CompetencyScore rows.
          competencyCode: bucket.competencyName,
          questions: bucket.questions as any,
        },
        select: { id: true },
      });
      microAssessmentIds.push(ma.id);
    }

    // Determine next step:
    //   - MICRO_ASSESSMENT — at least one MicroAssessment was created
    //   - NEXT_MODULE      — there's another curriculum module after this one
    //   - PATHWAY_COMPLETE — no more modules in this tenant's curriculum
    let nextStep: "MICRO_ASSESSMENT" | "NEXT_MODULE" | "PATHWAY_COMPLETE";

    if (microAssessmentIds.length > 0) {
      nextStep = "MICRO_ASSESSMENT";
    } else {
      const nextModule = await prisma.activity.findFirst({
        where: {
          tenantId: activity.tenantId,
          type: "CURRICULUM",
          moduleOrder: { gt: activity.moduleOrder },
          id: { not: activityId },
          status: "ACTIVE",
          deletedAt: null,
        },
        orderBy: { moduleOrder: "asc" },
        select: { id: true },
      });
      nextStep = nextModule ? "NEXT_MODULE" : "PATHWAY_COMPLETE";
    }

    return NextResponse.json({
      success: true,
      activityMemberId: activityMember.id,
      completedAt: activityMember.completedAt,
      nextStep,
      microAssessmentIds, // [] if none created
    });
  } catch (error) {
    console.error("[LMS] Module completion error:", error);
    return NextResponse.json({ error: "Failed to mark complete" }, { status: 500 });
  }
}

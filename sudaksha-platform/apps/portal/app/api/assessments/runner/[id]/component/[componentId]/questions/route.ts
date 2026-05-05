import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { filterQuestionsByCohort, resolveMemberCohort } from "@/lib/assessment/selectItemPool";

export async function GET(
    _req: NextRequest,
    ctx: { params: Promise<{ id: string; componentId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id: assessmentId, componentId } = await ctx.params;

        const projectAssessment = await prisma.projectUserAssessment.findFirst({
            where: { id: assessmentId, userId: (session.user as { id?: string }).id ?? "" },
        });
        if (projectAssessment) {
            const assignment = await prisma.projectAssessmentModel.findUnique({
                where: { id: projectAssessment.projectAssignmentId },
                select: { modelId: true },
            });
            const component = await prisma.assessmentModelComponent.findFirst({
                where: { id: componentId, modelId: assignment?.modelId ?? "" },
            });
            if (!component) return NextResponse.json({ error: "Component not found" }, { status: 404 });
            const questions = await prisma.componentQuestion.findMany({
                where: { componentId },
                orderBy: { order: "asc" },
            });
            // SEPL/INT/2026/IMPL-GAPS-01 Step G13 — cohort filtering for org/B2B users
            // Org users are CORPORATE by default (project assessments)
            const filtered = filterQuestionsByCohort(questions, 'CORPORATE');
            return NextResponse.json(filtered);
        }

        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "" },
            select: { id: true, type: true, tenant: { select: { type: true } } },
        });
        if (member) {
            const memberAssessment = await prisma.memberAssessment.findFirst({
                where: { id: assessmentId, memberId: member.id },
            });
            if (memberAssessment) {
                const component = await prisma.assessmentModelComponent.findFirst({
                    where: { id: componentId, modelId: memberAssessment.assessmentModelId },
                });
                if (!component) return NextResponse.json({ error: "Component not found" }, { status: 404 });
                const questions = await prisma.componentQuestion.findMany({
                    where: { componentId },
                    orderBy: { order: "asc" },
                });
                // SEPL/INT/2026/IMPL-GAPS-01 Step G13 — resolve cohort + filter SJT pool
                const cohort = resolveMemberCohort(member.type, member.tenant?.type ?? null);
                const filtered = filterQuestionsByCohort(questions, cohort);
                return NextResponse.json(filtered);
            }
        }

        return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    } catch (error) {
        console.error("Runner questions error:", error);
        return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }
}

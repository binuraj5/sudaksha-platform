import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

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
            return NextResponse.json(questions);
        }

        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "", type: "INDIVIDUAL" },
            select: { id: true },
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
                return NextResponse.json(questions);
            }
        }

        return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    } catch (error) {
        console.error("Runner questions error:", error);
        return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }
}

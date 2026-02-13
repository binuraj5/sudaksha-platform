import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/assessments/runner/[id]/component/[componentId]/start
 * Creates or returns UserAssessmentComponent and returns questions for the runner.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; componentId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: assessmentId, componentId } = await params;

        // Resolve component and maxScore
        const component = await prisma.assessmentModelComponent.findFirst({
            where: { id: componentId },
            include: { questions: { orderBy: { order: "asc" } } }
        });
        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        const metadata = (component as any).metadata as { useRuntimeAI?: boolean; runtimeQuestionCount?: number } | null;
        const useRuntimeAI = metadata?.useRuntimeAI === true;
        const totalRuntimeQuestions = metadata?.runtimeQuestionCount ?? 5;
        const maxScore = useRuntimeAI ? totalRuntimeQuestions * 10 : component.questions.reduce((sum, q) => sum + (q.points ?? 1), 0);

        // 1. Org flow: ProjectUserAssessment
        const projectAssessment = await prisma.projectUserAssessment.findFirst({
            where: { id: assessmentId, userId: session.user.id }
        });

        if (projectAssessment) {
            let userComponent = await prisma.userAssessmentComponent.findFirst({
                where: {
                    projectUserAssessmentId: assessmentId,
                    componentId
                },
                orderBy: { createdAt: "desc" }
            });

            if (!userComponent) {
                userComponent = await prisma.userAssessmentComponent.create({
                    data: {
                        projectUserAssessmentId: assessmentId,
                        componentId,
                        maxScore,
                        status: "ACTIVE",
                        startedAt: new Date()
                    }
                });
            } else if (userComponent.status === "DRAFT") {
                userComponent = await prisma.userAssessmentComponent.update({
                    where: { id: userComponent.id },
                    data: { status: "ACTIVE", startedAt: new Date() }
                });
            }

            return NextResponse.json({
                userComponentId: userComponent.id,
                questions: useRuntimeAI ? [] : component.questions,
                maxScore,
                ...(useRuntimeAI && { useRuntimeAI: true, totalRuntimeQuestions }),
            });
        }

        // 2. B2C: MemberAssessment – create UserAssessmentModel and UserAssessmentComponent (Member has email, not userId)
        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "", type: "INDIVIDUAL" },
            select: { id: true }
        });
        if (member) {
            const memberAssessment = await prisma.memberAssessment.findFirst({
                where: { id: assessmentId, memberId: member.id }
            });
            if (memberAssessment) {
                let uam = await prisma.userAssessmentModel.findFirst({
                    where: {
                        userId: session.user.id!,
                        modelId: memberAssessment.assessmentModelId
                    },
                    orderBy: { createdAt: "desc" }
                });
                if (!uam) {
                    uam = await prisma.userAssessmentModel.create({
                        data: {
                            userId: session.user.id!,
                            modelId: memberAssessment.assessmentModelId,
                            status: "ACTIVE",
                            startedAt: new Date()
                        }
                    });
                }

                let userComponent = await prisma.userAssessmentComponent.findFirst({
                    where: {
                        userAssessmentModelId: uam.id,
                        componentId
                    },
                    orderBy: { createdAt: "desc" }
                });
                if (!userComponent) {
                    userComponent = await prisma.userAssessmentComponent.create({
                        data: {
                            userAssessmentModelId: uam.id,
                            componentId,
                            maxScore,
                            status: "ACTIVE",
                            startedAt: new Date()
                        }
                    });
                } else if (userComponent.status === "DRAFT") {
                    userComponent = await prisma.userAssessmentComponent.update({
                        where: { id: userComponent.id },
                        data: { status: "ACTIVE", startedAt: new Date() }
                    });
                }

                return NextResponse.json({
                    userComponentId: userComponent.id,
                    questions: useRuntimeAI ? [] : component.questions,
                    maxScore,
                    ...(useRuntimeAI && { useRuntimeAI: true, totalRuntimeQuestions }),
                });
            }
        }

        return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    } catch (error) {
        console.error("Runner start component error:", error);
        return NextResponse.json({ error: "Failed to start component" }, { status: 500 });
    }
}

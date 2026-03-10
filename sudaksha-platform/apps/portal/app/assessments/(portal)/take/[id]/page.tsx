import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { AssessmentRunnerWithBoundary } from "@/components/assessments/AssessmentRunnerWithBoundary";

export default async function AssessmentTakePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getApiSession();
    const { id } = await params;

    if (!session) {
        redirect("/assessments/login");
    }

    // 1. Try ProjectUserAssessment (org-assigned)
    let userAssessment = await prisma.projectUserAssessment.findFirst({
        where: { id, userId: session.user.id },
        include: {
            user: {
                select: { name: true, email: true }
            },
            projectAssignment: {
                include: {
                    model: {
                        include: {
                            components: {
                                orderBy: { order: 'asc' }
                            }
                        }
                    }
                }
            }
        }
    });

    // 2. M15 B2C: Try MemberAssessment (self-selected by individual)
    if (!userAssessment) {
        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "" },
            select: { id: true, name: true, email: true },
        });
        if (member) {
            const memberAssessment = await prisma.memberAssessment.findFirst({
                where: { id, memberId: member.id },
                include: {
                    assessmentModel: {
                        include: {
                            components: { orderBy: { order: "asc" } },
                        },
                    },
                    member: {
                        select: { name: true, email: true },
                    },
                },
            });
            if (memberAssessment) {
                // Normalize to AssessmentRunner shape (projectAssignment.model || assessmentModel)
                userAssessment = {
                    id: memberAssessment.id,
                    status: memberAssessment.status,
                    projectAssignment: {
                        model: {
                            ...memberAssessment.assessmentModel,
                            totalDuration: memberAssessment.assessmentModel.durationMinutes ?? 30,
                            components: memberAssessment.assessmentModel.components,
                        },
                    },
                    user: {
                        name: memberAssessment.member.name,
                        email: memberAssessment.member.email ?? "",
                    },
                    _source: "MemberAssessment",
                } as any;
            }
        }
    }

    if (!userAssessment) {
        notFound();
    }

    // Check if assessment is already completed
    if (userAssessment.status === "COMPLETED" || userAssessment.status === "SUBMITTED") {
        redirect("/assessments/results/" + id);
    }

    // Determine which section to resume from by counting completed UserAssessmentComponents.
    // This runs server-side so the runner opens at the correct section with no flicker.
    let initialSectionIndex = 0;
    const isInProgress = !["NOT_STARTED", "DRAFT"].includes((userAssessment as any).status ?? "");
    if (isInProgress) {
        const modelId = (userAssessment as any).projectAssignment?.model?.id as string | undefined;
        if (modelId) {
            const uam = await prisma.userAssessmentModel.findFirst({
                where: { userId: session.user.id, modelId },
                orderBy: { createdAt: "desc" },
                select: { id: true },
            });
            if (uam) {
                const completedCount = await (prisma as any).userAssessmentComponent.count({
                    where: { userAssessmentModelId: uam.id, status: "COMPLETED" },
                });
                initialSectionIndex = completedCount as number;
            }
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <AssessmentRunnerWithBoundary userAssessment={userAssessment} initialSectionIndex={initialSectionIndex} />
        </div>
    );
}

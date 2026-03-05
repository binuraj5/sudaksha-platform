import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

        // Additional validation: ensure componentId is valid before creating UserAssessmentComponent
        if (!component.id || component.id !== componentId) {
            return NextResponse.json({ error: "Invalid component ID" }, { status: 400 });
        }

        const metadata = (component as any).metadata as { useRuntimeAI?: boolean; runtimeQuestionCount?: number } | null;
        const useRuntimeAI = metadata?.useRuntimeAI === true;
        const totalRuntimeQuestions = metadata?.runtimeQuestionCount ?? 5;
        const componentType = (component as { componentType?: string }).componentType ?? "";
        let componentConfig = (component as { config?: unknown }).config as { questionCount?: number; maxDurationPerQuestion?: number; retakesAllowed?: number; competencyName?: string; targetLevel?: string; min_questions?: number } | null;
        // Fallback: config may be in first question metadata (legacy)
        if (!componentConfig?.competencyName && component.questions[0]) {
            const meta = (component.questions[0] as { metadata?: unknown }).metadata as { competencyName?: string; targetLevel?: string; questionCount?: number; maxDurationPerQuestion?: number; retakesAllowed?: number; min_questions?: number } | null;
            if (meta?.competencyName && meta?.targetLevel) {
                componentConfig = meta;
            }
        }
        const adaptiveConfig = (component as { config?: unknown }).config as { min_questions?: number; max_questions?: number } | null;
        const panelConfig = (component as { config?: unknown }).config as { panelId?: string; competencyName?: string; targetLevel?: string; durationMinutes?: number } | null;
        const isVoiceInterview = componentType === "VOICE" && componentConfig?.competencyName && componentConfig?.targetLevel;
        const isVideoInterview = componentType === "VIDEO" && componentConfig?.competencyName && componentConfig?.targetLevel;
        const isConversationalInterview = componentType === "CONVERSATIONAL" && componentConfig?.competencyName && componentConfig?.targetLevel;
        const isAdaptiveAI =
            (componentType === "ADAPTIVE_AI" || componentType === "ADAPTIVE_QUESTIONNAIRE") &&
            (adaptiveConfig?.min_questions != null || componentConfig?.competencyName);
        const isPanelInterview = componentType === "PANEL" && panelConfig?.panelId;
        const maxScore = useRuntimeAI
            ? totalRuntimeQuestions * 10
            : isVoiceInterview || isVideoInterview || isAdaptiveAI || isPanelInterview
                ? 100
                : component.questions.reduce((sum, q) => sum + (q.points ?? 1), 0);

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
                if (!componentId || !assessmentId) {
                    return NextResponse.json({ error: "Missing required fields for component creation" }, { status: 400 });
                }
                try {
                    userComponent = await prisma.userAssessmentComponent.create({
                        data: {
                            projectUserAssessmentId: assessmentId,
                            componentId,
                            maxScore,
                            status: "ACTIVE",
                            startedAt: new Date()
                        }
                    });
                } catch (createError: any) {
                    console.error("UserAssessmentComponent creation error:", createError);
                    if (createError.code === 'P2003') {
                        return NextResponse.json({
                            error: "Foreign key constraint violation. Ensure componentId and projectUserAssessmentId are valid.",
                            details: { componentId, projectUserAssessmentId: assessmentId }
                        }, { status: 400 });
                    }
                    throw createError;
                }
            } else if (userComponent.status === "DRAFT") {
                userComponent = await prisma.userAssessmentComponent.update({
                    where: { id: userComponent.id },
                    data: { status: "ACTIVE", startedAt: new Date() }
                });
            }

            return NextResponse.json({
                userComponentId: userComponent.id,
                questions: useRuntimeAI ? [] : (isVoiceInterview ? component.questions : component.questions),
                maxScore,
                ...(useRuntimeAI && { useRuntimeAI: true, totalRuntimeQuestions }),
                ...(isVoiceInterview && {
                    useVoiceInterview: true,
                    voiceConfig: {
                        questionCount: componentConfig?.questionCount ?? 5,
                        maxDurationPerQuestion: componentConfig?.maxDurationPerQuestion ?? 120,
                        competencyName: componentConfig!.competencyName,
                        targetLevel: componentConfig!.targetLevel,
                    },
                    voiceQuestionId: component.questions[0]?.id ?? null,
                }),
                ...(isVideoInterview && {
                    useVideoInterview: true,
                    videoConfig: {
                        questionCount: componentConfig?.questionCount ?? 3,
                        maxDurationPerQuestion: componentConfig?.maxDurationPerQuestion ?? 180,
                        retakesAllowed: componentConfig?.retakesAllowed ?? 1,
                        competencyName: componentConfig!.competencyName,
                        targetLevel: componentConfig!.targetLevel,
                    },
                    videoQuestionId: component.questions[0]?.id ?? null,
                }),
                ...(isConversationalInterview && {
                    useConversationalInterview: true,
                    conversationalConfig: {
                        questionCount: componentConfig?.questionCount ?? 5,
                        competencyName: componentConfig!.competencyName,
                        targetLevel: componentConfig!.targetLevel,
                    },
                    conversationalQuestionId: component.questions[0]?.id ?? null,
                }),
                ...(isAdaptiveAI && {
                    useAdaptiveInterview: true,
                    adaptiveAssessmentId: assessmentId,
                    adaptiveComponentId: componentId,
                    adaptiveQuestionId: component.questions[0]?.id ?? null,
                    adaptiveCompetencyId: (component as any).competencyId ?? "",
                    adaptiveTargetLevel: (component as any).targetLevel ?? componentConfig?.targetLevel ?? "JUNIOR",
                }),
                ...(isPanelInterview && {
                    usePanelInterview: true,
                    panelConfig: {
                        panelId: panelConfig!.panelId,
                        competencyName: panelConfig?.competencyName ?? "",
                        targetLevel: panelConfig?.targetLevel ?? "",
                        durationMinutes: panelConfig?.durationMinutes ?? 60,
                    },
                    panelQuestionId: component.questions[0]?.id ?? null,
                }),
            });
        }

        // 2. B2C: MemberAssessment – create UserAssessmentModel and UserAssessmentComponent (Member has email; session.user.id may be member.id, so resolve User by email)
        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "" },
            select: { id: true, email: true, name: true }
        });
        if (member) {
            const memberAssessment = await prisma.memberAssessment.findFirst({
                where: { id: assessmentId, memberId: member.id }
            });
            if (memberAssessment) {
                // UserAssessmentModel.userId must reference User.id. For Member-only login, session.user.id is member.id, so resolve or create User by email.
                const emailNorm = (session.user.email ?? member.email).trim().toLowerCase();
                let user = await prisma.user.findFirst({
                    where: { email: { equals: emailNorm, mode: "insensitive" } },
                    select: { id: true }
                });
                if (!user) {
                    try {
                        const placeholderPassword = await bcrypt.hash(`member-${member.id}-${Date.now()}`, 10);
                        user = await prisma.user.create({
                            data: {
                                email: member.email,
                                name: member.name,
                                password: placeholderPassword,
                                accountType: "INDIVIDUAL"
                            },
                            select: { id: true }
                        });
                    } catch (createErr: unknown) {
                        // Race: User may have been created by another request (e.g. same member, same assessment)
                        const existing = await prisma.user.findFirst({
                            where: { email: { equals: emailNorm, mode: "insensitive" } },
                            select: { id: true }
                        });
                        if (existing) user = existing;
                        else throw createErr;
                    }
                }
                const userIdForModel = user.id;

                let uam = await prisma.userAssessmentModel.findFirst({
                    where: {
                        userId: userIdForModel,
                        modelId: memberAssessment.assessmentModelId
                    },
                    orderBy: { createdAt: "desc" }
                });
                if (!uam) {
                    uam = await prisma.userAssessmentModel.create({
                        data: {
                            userId: userIdForModel,
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
                    if (!componentId || !uam.id) {
                        return NextResponse.json({ error: "Missing required fields for component creation" }, { status: 400 });
                    }
                    try {
                        userComponent = await prisma.userAssessmentComponent.create({
                            data: {
                                userAssessmentModelId: uam.id,
                                componentId,
                                maxScore,
                                status: "ACTIVE",
                                startedAt: new Date()
                            }
                        });
                    } catch (createError: any) {
                        console.error("UserAssessmentComponent creation error (member flow):", createError);
                        if (createError.code === 'P2003') {
                            return NextResponse.json({
                                error: "Foreign key constraint violation. Ensure componentId and userAssessmentModelId are valid.",
                                details: { componentId, userAssessmentModelId: uam.id }
                            }, { status: 400 });
                        }
                        throw createError;
                    }
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
                    ...(isVoiceInterview && {
                        useVoiceInterview: true,
                        voiceConfig: {
                            questionCount: componentConfig?.questionCount ?? 5,
                            maxDurationPerQuestion: componentConfig?.maxDurationPerQuestion ?? 120,
                            competencyName: componentConfig!.competencyName,
                            targetLevel: componentConfig!.targetLevel,
                        },
                        voiceQuestionId: component.questions[0]?.id ?? null,
                    }),
                    ...(isVideoInterview && {
                        useVideoInterview: true,
                        videoConfig: {
                            questionCount: componentConfig?.questionCount ?? 3,
                            maxDurationPerQuestion: componentConfig?.maxDurationPerQuestion ?? 180,
                            retakesAllowed: componentConfig?.retakesAllowed ?? 1,
                            competencyName: componentConfig!.competencyName,
                            targetLevel: componentConfig!.targetLevel,
                        },
                        videoQuestionId: component.questions[0]?.id ?? null,
                    }),
                    ...(isConversationalInterview && {
                        useConversationalInterview: true,
                        conversationalConfig: {
                            questionCount: componentConfig?.questionCount ?? 5,
                            competencyName: componentConfig!.competencyName,
                            targetLevel: componentConfig!.targetLevel,
                        },
                        conversationalQuestionId: component.questions[0]?.id ?? null,
                    }),
                    ...(isAdaptiveAI && {
                        useAdaptiveInterview: true,
                        adaptiveAssessmentId: assessmentId,
                        adaptiveComponentId: componentId,
                        adaptiveQuestionId: component.questions[0]?.id ?? null,
                    }),
                    ...(isPanelInterview && {
                        usePanelInterview: true,
                        panelConfig: {
                            panelId: panelConfig!.panelId,
                            competencyName: panelConfig?.competencyName ?? "",
                            targetLevel: panelConfig?.targetLevel ?? "",
                            durationMinutes: panelConfig?.durationMinutes ?? 60,
                        },
                        panelQuestionId: component.questions[0]?.id ?? null,
                    }),
                });
            }
        }

        return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    } catch (error) {
        console.error("Runner start component error:", error);
        return NextResponse.json({ error: "Failed to start component" }, { status: 500 });
    }
}

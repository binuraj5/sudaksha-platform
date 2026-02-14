import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { AdaptiveEngine } from "@/lib/assessment/adaptive-engine";
import { generateAdaptiveQuestion } from "@/lib/assessment/adaptive-question-generator";
import type { AdaptiveConfig } from "@/components/assessments/AdaptiveConfigForm";

/**
 * POST /api/assessments/adaptive/start
 * Start adaptive session for MemberAssessment flow.
 * Body: { assessmentId (memberAssessmentId), componentId }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { assessmentId, componentId } = body;

        if (!assessmentId || !componentId) {
            return NextResponse.json(
                { error: "assessmentId and componentId are required" },
                { status: 400 }
            );
        }

        const memberAssessment = await prisma.memberAssessment.findFirst({
            where: { id: assessmentId },
            include: { member: true, assessmentModel: true },
        });

        if (!memberAssessment?.member) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        const component = await prisma.assessmentModelComponent.findFirst({
            where: { id: componentId, modelId: memberAssessment.assessmentModelId },
        });

        if (!component || component.componentType !== "ADAPTIVE_AI") {
            return NextResponse.json({ error: "Component not found or not adaptive" }, { status: 404 });
        }

        const config = (component.config ?? component) as AdaptiveConfig;
        if (!config.min_questions || !config.allowed_question_types?.length) {
            return NextResponse.json({ error: "Invalid adaptive config" }, { status: 400 });
        }

        const competency = await prisma.competency.findUnique({
            where: { id: component.competencyId ?? "" },
            include: { indicators: true },
        });

        const targetLevel =
            (memberAssessment.assessmentModel?.targetLevel as string) ??
            (component as { targetLevel?: string }).targetLevel ??
            "MIDDLE";
        const initialAbility = AdaptiveEngine.getBaselineAbility(targetLevel);

        const adaptiveSession = await prisma.adaptiveSession.create({
            data: {
                memberAssessmentId: assessmentId,
                componentId,
                memberId: memberAssessment.memberId,
                competencyId: component.competencyId ?? "",
                currentAbility: initialAbility,
                initialAbility,
                targetLevel,
                config: config as unknown as Record<string, unknown>,
                status: "IN_PROGRESS",
            },
        });

        const firstQuestion = await generateAdaptiveQuestion({
            sessionId: adaptiveSession.id,
            competencyId: component.competencyId ?? "",
            competencyName: competency?.name ?? "Competency",
            difficulty: config.starting_difficulty ?? 5,
            allowedTypes: config.allowed_question_types,
            previousQuestions: [],
            sequenceNumber: 1,
            indicators: competency?.indicators?.map((i) => ({ id: i.id, text: (i as { text?: string }).text ?? "" })) ?? [],
            contextAware: config.context_aware_followups ?? true,
            targetLevel,
        });

        return NextResponse.json({
            sessionId: adaptiveSession.id,
            initialAbility,
            targetLevel,
            config,
            firstQuestion: {
                id: firstQuestion.id,
                questionText: firstQuestion.questionText,
                questionType: firstQuestion.questionType,
                options: firstQuestion.options,
                difficulty: firstQuestion.difficulty,
            },
        });
    } catch (error) {
        console.error("Adaptive start error:", error);
        return NextResponse.json(
            { error: "Failed to start adaptive assessment" },
            { status: 500 }
        );
    }
}

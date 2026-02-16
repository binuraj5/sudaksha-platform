import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { AdaptiveEngine } from "@/lib/assessment/adaptive-engine";
import { generateAdaptiveQuestion } from "@/lib/assessment/adaptive-question-generator";
import type { AdaptiveConfig } from "@/components/assessments/AdaptiveConfigForm";

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

        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "", type: "INDIVIDUAL" },
            select: { id: true },
        });
        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const memberAssessment = await prisma.memberAssessment.findFirst({
            where: { id: assessmentId, memberId: member.id },
            include: { assessmentModel: true },
        });
        if (!memberAssessment) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        const component = await prisma.assessmentModelComponent.findFirst({
            where: { id: componentId, modelId: memberAssessment.assessmentModelId },
            include: { competency: { include: { indicators: true } } },
        });
        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        const componentType = (component as { componentType?: string }).componentType ?? "";
        if (componentType !== "ADAPTIVE_AI" && componentType !== "ADAPTIVE_QUESTIONNAIRE") {
            return NextResponse.json(
                { error: "Component is not adaptive" },
                { status: 400 }
            );
        }

        const config = (component as { config?: unknown }).config as AdaptiveConfig | null;
        if (!config?.min_questions || !config?.max_questions) {
            return NextResponse.json(
                { error: "Adaptive config missing" },
                { status: 400 }
            );
        }

        const targetLevel =
            (component as { targetLevel?: string }).targetLevel ??
            (memberAssessment.assessmentModel as { targetLevel?: string })?.targetLevel ??
            "MIDDLE";
        const initialAbility = AdaptiveEngine.getBaselineAbility(targetLevel);

        const adaptiveSession = await prisma.adaptiveSession.create({
            data: {
                memberAssessmentId: assessmentId,
                componentId,
                memberId: member.id,
                competencyId: component.competencyId ?? "",
                currentAbility: initialAbility,
                initialAbility,
                targetLevel,
                config: config as object,
                status: "IN_PROGRESS",
            },
        });

        const firstQuestion = await generateAdaptiveQuestion({
            sessionId: adaptiveSession.id,
            competencyId: component.competencyId ?? "",
            competencyName: component.competency?.name ?? "Competency",
            difficulty: config.starting_difficulty ?? 5,
            allowedTypes: config.allowed_question_types ?? ["MCQ"],
            previousQuestions: [],
            sequenceNumber: 1,
            indicators: (component.competency?.indicators as { id: string; text: string }[]) ?? [],
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

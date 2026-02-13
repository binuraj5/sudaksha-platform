import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuestions } from "@/lib/ai/question-generator";
import { AIQuestionGenerator } from "@/lib/assessment/ai-generator";

/**
 * POST /api/assessments/admin/models/[modelId]/components/[componentId]/questions/ai-generate
 * Model-scoped AI question generation - verifies component belongs to model.
 * Routes by componentType: MCQ/SITUATIONAL/ESSAY use AIQuestionGenerator; others use legacy generateQuestions.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ modelId: string; componentId: string }> }
) {
    try {
        const session = await getApiSession();
        const { modelId, componentId } = await params;

        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { count, questionTypes, difficulty, additionalContext } = body;

        // 1. Fetch component - verify it belongs to this model
        const component = await prisma.assessmentModelComponent.findFirst({
            where: {
                id: componentId,
                modelId
            },
            include: {
                model: {
                    include: {
                        role: true
                    }
                },
                competency: {
                    include: {
                        indicators: true
                    }
                }
            }
        });

        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        const competency = component.competency;
        if (!competency) {
            return NextResponse.json({ error: "Component has no linked competency" }, { status: 400 });
        }

        // 2. Filter indicators by component's target level (include at or below)
        const targetLevel = (component.targetLevel ?? "JUNIOR") as "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";
        const relevantIndicators = competency.indicators.filter(
            (ind) => ind.level === targetLevel || ind.level === "JUNIOR"
        );
        const indicatorsToUse = relevantIndicators.length > 0 ? relevantIndicators : competency.indicators;

        const questionCount = count || 5;
        const compType = (component.componentType || "QUESTIONNAIRE").toUpperCase();

        // 3. Route by componentType to appropriate generator
        if (compType === "MCQ" || compType === "SITUATIONAL" || compType === "ESSAY") {
            const generationRequest = {
                competencyName: competency.name,
                competencyDescription: competency.description ?? undefined,
                roleName: component.model?.role?.name,
                targetLevel,
                indicators: indicatorsToUse.map((i) => ({
                    id: i.id,
                    text: i.text,
                    type: i.type ?? undefined
                })),
                componentType: compType as "MCQ" | "SITUATIONAL" | "ESSAY",
                questionCount,
                difficulty: (difficulty || "MEDIUM") as "EASY" | "MEDIUM" | "HARD",
                additionalContext
            };

            let questions;
            if (compType === "MCQ") {
                questions = await AIQuestionGenerator.generateMCQQuestions(generationRequest);
            } else if (compType === "SITUATIONAL") {
                questions = await AIQuestionGenerator.generateSituationalQuestions(generationRequest);
            } else {
                questions = await AIQuestionGenerator.generateEssayPrompts(generationRequest);
            }

            return NextResponse.json({ questions });
        }

        // 4. Legacy: QUESTIONNAIRE, TRUE_FALSE, etc. use existing generateQuestions
        const config = {
            roleName: component.model?.role?.name || "Professional",
            competencyName: competency.name,
            level: targetLevel,
            indicators: indicatorsToUse.map((i) => ({
                id: i.id,
                text: i.text,
                type: i.type
            })),
            count: questionCount,
            questionTypes: questionTypes || ["MULTIPLE_CHOICE"],
            difficulty: difficulty || "MEDIUM",
            additionalContext
        };

        const questions = await generateQuestions(config);
        return NextResponse.json({ questions });
    } catch (error: unknown) {
        console.error("AI Generation API error:", error);
        const message = error instanceof Error ? error.message : "Failed to generate questions via AI";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canEditModelComponents } from "@/lib/assessments/model-edit-permission";
import type { ProficiencyLevel } from "@sudaksha/db-core";

/**
 * POST /api/assessments/admin/questions/[questionId]/regenerate
 * Regenerates a single question using AI.
 * Uses dynamic imports for AI modules to prevent Turbopack compilation failures.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ questionId: string }> }
) {
    try {
        const session = await getApiSession();
        const { questionId } = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch current question and its context
        const question = await prisma.componentQuestion.findUnique({
            where: { id: questionId },
            include: {
                component: {
                    include: {
                        model: {
                            include: { role: true }
                        },
                        competency: {
                            include: { indicators: true }
                        }
                    }
                }
            }
        });

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        const component = question.component;
        const model = component.model;

        // Verify permissions
        const editCheck = await canEditModelComponents(model, session);
        if (!editCheck.allowed) {
            return NextResponse.json({ error: editCheck.reason }, { status: 403 });
        }

        const competency = component.competency;
        if (!competency) {
            return NextResponse.json({ error: "Question component has no competency" }, { status: 400 });
        }

        const targetLevel = (component.targetLevel ?? model.targetLevel ?? "JUNIOR") as ProficiencyLevel;

        // 2. Fetch relevant indicators (matching question's current indicator or component target level)
        const relevantIndicators = competency.indicators.filter(ind => {
            return question.linkedIndicators.includes(ind.id);
        });

        const indicatorsToUse = relevantIndicators.length > 0
            ? relevantIndicators
            : competency.indicators.filter(i => i.level === targetLevel);

        const compType = (component.componentType || "QUESTIONNAIRE").toUpperCase();
        const additionalContext = `This is a regeneration of the following question: "${question.questionText}"`;

        if (compType === "MCQ" || compType === "SITUATIONAL" || compType === "ESSAY" || compType === "SHORT_ANSWER") {
            const { AIQuestionGenerator } = await import("@/lib/assessment/ai-generator");
            const generationRequest = {
                competencyName: competency.name,
                competencyDescription: competency.description ?? undefined,
                roleName: model.role?.name,
                targetLevel,
                indicators: indicatorsToUse.map(i => ({
                    id: i.id,
                    text: i.text,
                    type: i.type ?? undefined
                })),
                componentType: compType as "MCQ" | "SITUATIONAL" | "ESSAY" | "SHORT_ANSWER",
                questionCount: 1,
                difficulty: "MEDIUM" as const,
                additionalContext
            };

            let questions;
            if (compType === "MCQ") {
                questions = await AIQuestionGenerator.generateMCQQuestions(generationRequest);
            } else if (compType === "SITUATIONAL") {
                questions = await AIQuestionGenerator.generateSituationalQuestions(generationRequest);
            } else if (compType === "SHORT_ANSWER") {
                questions = await AIQuestionGenerator.generateShortAnswerPrompts(generationRequest);
            } else {
                questions = await AIQuestionGenerator.generateEssayPrompts(generationRequest);
            }

            if (!questions || questions.length === 0) {
                return NextResponse.json({ error: "Failed to regenerate question" }, { status: 500 });
            }

            return NextResponse.json({ question: questions[0] });
        }

        // Fallback to legacy generator
        const { generateQuestions } = await import("@/lib/ai/question-generator");
        const config = {
            roleName: model.role?.name || "Professional",
            competencyName: competency.name,
            level: targetLevel,
            indicators: indicatorsToUse.map(i => ({ id: i.id, text: i.text, type: i.type })),
            count: 1,
            questionTypes: [question.questionType],
            difficulty: 'MEDIUM' as const,
            additionalContext
        };

        const newQuestions = await generateQuestions(config);

        if (!newQuestions || newQuestions.length === 0) {
            return NextResponse.json({ error: "Failed to regenerate question" }, { status: 500 });
        }

        return NextResponse.json({ question: newQuestions[0] });

    } catch (error: any) {
        console.error("Single Question Regeneration error:", error);
        return NextResponse.json({ error: "Failed to regenerate question" }, { status: 500 });
    }
}

import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canUnpublishModel } from "@/lib/assessments/model-edit-permission";
import type { ProficiencyLevel } from "@sudaksha/db-core";

/**
 * POST /api/assessments/admin/models/[modelId]/components/[componentId]/questions/ai-generate
 * Model-scoped AI question generation - verifies component belongs to model.
 * Uses dynamic imports for AI modules to prevent Turbopack compilation failures.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ modelId: string; componentId: string }> }
) {
    try {
        const session = await getApiSession();
        const { modelId, componentId } = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
            select: { id: true, status: true, tenantId: true, clientId: true }
        });
        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }
        // AI generation is a preview-only action — allow for published models too.
        // Only question-saving routes enforce the published lock.
        const accessCheck = await canUnpublishModel(model, session);
        if (!accessCheck.allowed) {
            return NextResponse.json({ error: accessCheck.reason }, { status: 403 });
        }

        const body = await request.json();
        const { count, questionTypes, difficulty, additionalContext } = body;

        const component = await prisma.assessmentModelComponent.findFirst({
            where: { id: componentId, modelId },
            include: {
                model: { include: { role: true } },
                competency: { include: { indicators: true } }
            }
        });

        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        const competency = component.competency;
        if (!competency) {
            return NextResponse.json({ error: "Component has no linked competency" }, { status: 400 });
        }

        const targetLevel = (component.targetLevel ?? component.model?.targetLevel ?? "JUNIOR") as ProficiencyLevel;

        const { selectRelevantIndicators } = await import("@/lib/assessment/indicator-selection");
        const relevantIndicators = await selectRelevantIndicators(competency.id, targetLevel);
        const indicatorsToUse = relevantIndicators.length > 0
            ? relevantIndicators
            : competency.indicators.map((i) => ({ id: i.id, text: i.text, type: i.type, level: i.level, weight: 1 }));

        const questionCount = count || 5;
        const compType = (component.componentType || "QUESTIONNAIRE").toUpperCase();

        if (compType === "MCQ" || compType === "SITUATIONAL" || compType === "ESSAY" || compType === "SHORT_ANSWER") {
            const { AIQuestionGenerator } = await import("@/lib/assessment/ai-generator");
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
                componentType: compType as "MCQ" | "SITUATIONAL" | "ESSAY" | "SHORT_ANSWER",
                questionCount,
                difficulty: (difficulty || "MEDIUM") as "EASY" | "MEDIUM" | "HARD",
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

            return NextResponse.json({ questions });
        }

        const { generateQuestions } = await import("@/lib/ai/question-generator");
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
        const raw = error instanceof Error ? error.message : String(error);
        // Detect quota/billing exhaustion across all providers
        const isQuotaError = /quota|billing|insufficient_quota|credit balance|rate.limit/i.test(raw);
        if (isQuotaError) {
            return NextResponse.json({
                error: "AI quota exceeded",
                detail: "All configured AI providers have exhausted their quotas or credits. Please top up Gemini, OpenAI, or Anthropic API credits, or add an xAI / Perplexity API key to .env.",
            }, { status: 503 });
        }
        return NextResponse.json({ error: raw }, { status: 500 });
    }
}

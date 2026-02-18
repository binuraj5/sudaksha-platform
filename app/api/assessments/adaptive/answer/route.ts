import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { AdaptiveEngine } from "@/lib/assessment/adaptive-engine";
import { generateAdaptiveQuestion } from "@/lib/assessment/adaptive-question-generator";
import type { AdaptiveConfig } from "@/components/assessments/AdaptiveConfigForm";

/**
 * POST /api/assessments/adaptive/answer
 * Process answer and return next question or completion.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { sessionId, questionId, answer, timeTaken } = body;

        if (!sessionId || !questionId || answer === undefined) {
            return NextResponse.json(
                { error: "sessionId, questionId, and answer are required" },
                { status: 400 }
            );
        }

        const [adaptiveSession, question] = await Promise.all([
            prisma.adaptiveSession.findUnique({
                where: { id: sessionId },
                include: { competency: { include: { indicators: true } } },
            }),
            prisma.adaptiveQuestion.findUnique({
                where: { id: questionId },
            }),
        ]);

        if (!adaptiveSession || !question) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const isCorrect = evaluateAnswer(question, answer);

        await prisma.adaptiveQuestion.update({
            where: { id: questionId },
            data: {
                candidateAnswer: answer,
                isCorrect,
                timeTakenSeconds: typeof timeTaken === "number" ? timeTaken : undefined,
                answeredAt: new Date(),
            },
        });

        const updatedSession = await prisma.adaptiveSession.update({
            where: { id: sessionId },
            data: {
                questionsAsked: { increment: 1 },
                questionsCorrect: isCorrect ? { increment: 1 } : undefined,
                lastActivityAt: new Date(),
            },
        });

        const config = adaptiveSession.config as unknown as AdaptiveConfig;
        const engine = new AdaptiveEngine({
            sessionId: adaptiveSession.id,
            currentAbility: Number(updatedSession.currentAbility),
            questionsAsked: updatedSession.questionsAsked,
            questionsCorrect: updatedSession.questionsCorrect,
            config,
        });

        const shouldContinue = engine.shouldContinue();

        let nextQuestion = null;
        if (shouldContinue) {
            const nextDifficulty = engine.calculateNextDifficulty();

            await prisma.adaptiveSession.update({
                where: { id: sessionId },
                data: { currentAbility: nextDifficulty },
            });

            const previousQuestions = (await prisma.adaptiveQuestion.findMany({
                where: { sessionId },
                orderBy: { sequenceNumber: "asc" },
                select: { questionText: true, isCorrect: true },
            })).map(q => ({
                questionText: q.questionText,
                isCorrect: q.isCorrect ?? false
            }));

            nextQuestion = await generateAdaptiveQuestion({
                sessionId,
                competencyId: adaptiveSession.competencyId,
                competencyName: adaptiveSession.competency?.name ?? "Competency",
                difficulty: nextDifficulty,
                allowedTypes: config.allowed_question_types ?? ["MCQ"],
                previousQuestions,
                sequenceNumber: updatedSession.questionsAsked + 1,
                indicators: adaptiveSession.competency?.indicators?.map((i) => ({ id: i.id, text: i.text })) ?? [],
                contextAware: config.context_aware_followups ?? true,
                targetLevel: adaptiveSession.targetLevel,
            });
        }

        return NextResponse.json({
            wasCorrect: isCorrect,
            explanation: question.explanation,
            correctAnswer: question.correctAnswer,
            abilityUpdate: engine.state.currentAbility,
            nextQuestion: nextQuestion
                ? {
                    id: nextQuestion.id,
                    questionText: nextQuestion.questionText,
                    questionType: nextQuestion.questionType,
                    options: nextQuestion.options,
                    difficulty: nextQuestion.difficulty,
                }
                : null,
            shouldContinue,
            estimatedRemaining: shouldContinue ? engine.estimateRemainingQuestions() : "0",
        });
    } catch (error) {
        console.error("Adaptive answer error:", error);
        return NextResponse.json(
            { error: "Failed to process answer" },
            { status: 500 }
        );
    }
}

function evaluateAnswer(
    question: { questionType: string; correctAnswer: string | null; options?: unknown },
    candidateAnswer: string
): boolean {
    const correct = question.correctAnswer?.trim() ?? "";
    const answer = String(candidateAnswer).trim();
    if (question.questionType === "MCQ" || question.questionType === "MULTIPLE_CHOICE") {
        return answer.toLowerCase() === correct.toLowerCase();
    }
    const opts = Array.isArray(question.options) ? (question.options as { key?: string; text?: string; isCorrect?: boolean }[]) : [];
    const correctOpt = opts.find((o) => o.isCorrect || o.text === correct || o.key === correct);
    return correctOpt ? answer === (correctOpt.text ?? correctOpt.key) || answer === correct : false;
}

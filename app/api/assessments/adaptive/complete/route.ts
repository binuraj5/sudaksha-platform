import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { AdaptiveEngine } from "@/lib/assessment/adaptive-engine";
import type { AdaptiveConfig } from "@/components/assessments/AdaptiveConfigForm";

/**
 * POST /api/assessments/adaptive/complete
 * Finalize session and return final score.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
        }

        const adaptiveSession = await prisma.adaptiveSession.findUnique({
            where: { id: sessionId },
        });

        if (!adaptiveSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const config = adaptiveSession.config as AdaptiveConfig;
        const engine = new AdaptiveEngine({
            sessionId: adaptiveSession.id,
            currentAbility: Number(adaptiveSession.currentAbility),
            questionsAsked: adaptiveSession.questionsAsked,
            questionsCorrect: adaptiveSession.questionsCorrect,
            config,
        });

        const finalScore = engine.calculateFinalScore();

        await prisma.adaptiveSession.update({
            where: { id: sessionId },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                finalScore: finalScore.percentage,
                abilityEstimate: finalScore.ability,
            },
        });

        const questions = await prisma.adaptiveQuestion.findMany({
            where: { sessionId },
            orderBy: { sequenceNumber: "asc" },
        });

        return NextResponse.json({
            finalScore: {
                percentage: finalScore.percentage,
                ability: finalScore.ability,
                accuracy: finalScore.accuracy,
                questionsAnswered: adaptiveSession.questionsAsked,
                difficultyProgression: questions.map((q) => Number(q.difficulty)),
            },
            performanceLevel: getPerformanceLevel(finalScore.ability),
            questions: questions.map((q) => ({
                question: q.questionText,
                difficulty: Number(q.difficulty),
                isCorrect: q.isCorrect,
                timeTaken: q.timeTakenSeconds,
            })),
        });
    } catch (error) {
        console.error("Adaptive complete error:", error);
        return NextResponse.json(
            { error: "Failed to complete assessment" },
            { status: 500 }
        );
    }
}

function getPerformanceLevel(ability: number): string {
    if (ability >= 8.5) return "EXPERT";
    if (ability >= 6.5) return "SENIOR";
    if (ability >= 4.5) return "MIDDLE";
    return "JUNIOR";
}

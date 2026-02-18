import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { AdaptiveEngine } from "@/lib/assessment/adaptive-engine";
import type { AdaptiveConfig } from "@/components/assessments/AdaptiveConfigForm";

/**
 * POST /api/assessments/adaptive/complete
 * Marks AdaptiveSession COMPLETED and returns final score (M9-5: linear 7.5/10 = 75/100).
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

        const { percentage, ability, accuracy } = engine.calculateFinalScore();

        await prisma.adaptiveSession.update({
            where: { id: sessionId },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                finalScore: percentage,
                abilityEstimate: ability,
            },
        });

        return NextResponse.json({
            sessionId,
            finalScore: percentage,
            abilityEstimate: ability,
            accuracy,
            questionsAsked: adaptiveSession.questionsAsked,
            questionsCorrect: adaptiveSession.questionsCorrect,
        });
    } catch (error) {
        console.error("Adaptive complete error:", error);
        return NextResponse.json(
            { error: "Failed to complete adaptive assessment" },
            { status: 500 }
        );
    }
}

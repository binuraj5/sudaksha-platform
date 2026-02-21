import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function POST(req: Request) {
    try {
        const session = await getApiSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
        }

        const adaptiveSession = await prisma.adaptiveSession.findUnique({
            where: { id: sessionId },
            include: { questions: { where: { isCorrect: { not: null } } } }
        });

        if (!adaptiveSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const questions = adaptiveSession.questions;
        if (questions.length === 0) {
            return NextResponse.json({ error: "No questions answered yet" }, { status: 400 });
        }

        const totalDifficulty = questions.reduce((sum: number, q: any) => sum + Number(q.difficulty), 0);
        let weightedScore = 0;
        let totalCorrect = 0;

        for (const q of questions) {
            if (q.isCorrect) {
                weightedScore += Number(q.difficulty);
                totalCorrect++;
            }
        }

        const finalScore = totalDifficulty > 0 ? (weightedScore / totalDifficulty) * 100 : 0;
        const abilityEstimate = Number(adaptiveSession.currentAbility);

        const updatedSession = await prisma.adaptiveSession.update({
            where: { id: sessionId },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                questionsAsked: questions.length,
                questionsCorrect: totalCorrect,
                finalScore,
                abilityEstimate,
            }
        });

        // Optional: you can sync this to MemberAssessment or UserAssessmentComponent
        // depending on your tracking table's structure. For now, the AdaptiveSession itself holds the results.

        return NextResponse.json({
            success: true,
            session: updatedSession,
            metrics: {
                percentage: parseFloat(finalScore.toFixed(2)),
                questionsAsked: questions.length,
                correctAnswers: totalCorrect,
                finalAbility: abilityEstimate
            }
        });

    } catch (e: any) {
        console.error("Adaptive Complete Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

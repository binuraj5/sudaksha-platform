import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { startVideoInterviewPython } from "@/lib/python-api";

/**
 * POST /api/video/start-interview
 * Generates AI interview questions for a video session via Python backend.
 */
export async function POST(req: NextRequest) {
    let competencyName = "";
    let targetLevel = "JUNIOR";
    let questionCount = 3;

    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        competencyName = body.competencyName || "";
        targetLevel = body.targetLevel || "JUNIOR";
        questionCount = body.questionCount ?? 3;

        if (!competencyName || !targetLevel) {
            return NextResponse.json(
                { error: "competencyName and targetLevel are required" },
                { status: 400 }
            );
        }

        const result = await startVideoInterviewPython({
            competencyName,
            targetLevel,
            questionCount,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Video start-interview error:", error);

        // Fallback: return generic questions if Python backend is unavailable
        const fallbackQuestions = [
            `Describe your experience with ${competencyName || "this competency"} at ${targetLevel} level.`,
            `Tell us about a specific situation where you demonstrated ${competencyName || "this competency"}.`,
            `How do you approach challenges related to ${competencyName || "this competency"}?`,
            `What challenges have you faced in this area, and how did you overcome them?`,
            `Share an example of how you've grown in ${competencyName || "this area"}.`,
        ].slice(0, questionCount);

        return NextResponse.json({
            session_id: `fallback-${Date.now()}`,
            questions: fallbackQuestions,
            question_count: fallbackQuestions.length,
        });
    }
}

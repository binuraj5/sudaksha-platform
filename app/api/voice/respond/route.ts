import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { processVoiceResponse } from "@/lib/python-api";

/**
 * POST /api/voice/respond
 * Proxies to Python backend. Body: { sessionId, question, transcript, questionNumber }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { sessionId, question, transcript, questionNumber } = body;
        if (!sessionId || !question || transcript === undefined || questionNumber === undefined) {
            return NextResponse.json(
                { error: "sessionId, question, transcript, and questionNumber are required" },
                { status: 400 }
            );
        }

        const result = await processVoiceResponse({
            sessionId,
            question,
            transcript: String(transcript),
            questionNumber: Number(questionNumber),
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Voice respond error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Failed to process response" },
            { status: 500 }
        );
    }
}

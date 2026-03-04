import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { evaluateVoiceInterview } from "@/lib/python-api";

/**
 * POST /api/voice/evaluate
 * Proxies to Python backend. Body: { competencyName, targetLevel, transcript, indicators? }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { competencyName, targetLevel, transcript, indicators } = body;
        if (!competencyName || !targetLevel || transcript === undefined) {
            return NextResponse.json(
                { error: "competencyName, targetLevel, and transcript are required" },
                { status: 400 }
            );
        }

        const result = await evaluateVoiceInterview({
            competencyName,
            targetLevel,
            transcript: String(transcript),
            indicators: Array.isArray(indicators) ? indicators : [],
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Voice evaluate error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Failed to evaluate interview" },
            { status: 500 }
        );
    }
}

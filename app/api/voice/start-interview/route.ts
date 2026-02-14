import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { startVoiceInterview } from "@/lib/python-api";

/**
 * POST /api/voice/start-interview
 * Proxies to Python backend. Body: { competencyName, targetLevel, questionCount? }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { competencyName, targetLevel, questionCount } = body;
        if (!competencyName || !targetLevel) {
            return NextResponse.json(
                { error: "competencyName and targetLevel are required" },
                { status: 400 }
            );
        }

        const result = await startVoiceInterview({
            competencyName,
            targetLevel,
            questionCount,
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Voice start-interview error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Failed to start interview" },
            { status: 500 }
        );
    }
}

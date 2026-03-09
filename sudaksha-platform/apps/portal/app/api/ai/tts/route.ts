import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { generateSpeech } from "@/lib/ai/audio";

/**
 * POST /api/ai/tts
 * Converts text to speech and returns base64 MP3 audio.
 * Used by VideoInterviewRunner to speak questions aloud.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text } = await req.json();
        if (!text || typeof text !== "string") {
            return NextResponse.json({ error: "text is required" }, { status: 400 });
        }

        const audioBuffer = await generateSpeech(text);
        const audio = Buffer.from(audioBuffer).toString("base64");
        return NextResponse.json({ audio });
    } catch (error) {
        console.error("TTS error:", error);
        // Silently return null — TTS is an enhancement, not blocking
        return NextResponse.json({ audio: null });
    }
}

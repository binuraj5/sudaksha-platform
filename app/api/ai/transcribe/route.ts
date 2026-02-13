import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/ai/audio";

/**
 * POST /api/ai/transcribe
 * Body: FormData with "audio" file (Blob).
 * Returns { text } for assessment voice responses.
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get("audio") as Blob | null;

        if (!audioFile) {
            return NextResponse.json({ error: "Missing audio" }, { status: 400 });
        }

        const text = await transcribeAudio(audioFile);
        return NextResponse.json({ text, transcript: text });
    } catch (error: unknown) {
        console.error("Transcribe error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Transcription failed" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { transcribeAudioPython } from "@/lib/python-api";

/**
 * POST /api/voice/transcribe
 * Proxies to Python backend. Body: FormData with "audio" file.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const audio = formData.get("audio");
        if (!audio || !(audio instanceof Blob)) {
            return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
        }

        const file = audio instanceof File ? audio : new File([audio], "audio.webm", { type: (audio as any).type });
        const result = await transcribeAudioPython(file);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Voice transcribe error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Transcription failed" },
            { status: 500 }
        );
    }
}

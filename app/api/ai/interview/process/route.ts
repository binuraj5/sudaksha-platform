
import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio, generateSpeech } from "@/lib/ai/audio";
import { generateChatCompletion } from "@/lib/ai/providers";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get("audio") as Blob | null;
        const messagesJson = formData.get("messages") as string;

        if (!audioFile || !messagesJson) {
            return NextResponse.json(
                { error: "Missing audio or messages" },
                { status: 400 }
            );
        }

        const messages = JSON.parse(messagesJson);

        // 1. Transcribe Audio
        const userText = await transcribeAudio(audioFile);
        console.log("User said:", userText);

        // 2. Update History & Generate AI Response
        const updatedMessages = [
            ...messages,
            { role: "user", content: userText }
        ];

        // Add a system prompt if not present (or rely on client to send it, but safer here)
        // Check if system prompt exists, if not add one.
        // Actually, let's assume the client manages the full context including system prompt for now, 
        // or we can prepend it if missing.
        // Let's rely on the `messages` passed from client for flexibility.

        const aiResponse = await generateChatCompletion(updatedMessages);
        const aiText = aiResponse.choices[0].message.content;
        console.log("AI replied:", aiText);

        // 3. Generate Speech
        const audioBuffer = await generateSpeech(aiText);
        const audioBase64 = Buffer.from(audioBuffer).toString("base64");

        return NextResponse.json({
            userText,
            aiText,
            audio: audioBase64
        });

    } catch (error: any) {
        console.error("Interview Process Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

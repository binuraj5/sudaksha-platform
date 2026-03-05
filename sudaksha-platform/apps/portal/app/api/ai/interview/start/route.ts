import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { generateChatCompletion } from "@/lib/ai/providers";
import { generateSpeech } from "@/lib/ai/audio";

/**
 * POST /api/ai/interview/start
 * Generates the opening interviewer greeting + TTS audio for a conversational interview.
 * Call this once on mount before the user speaks.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { competencyName, targetLevel, questionCount = 5 } = body;

        if (!competencyName || !targetLevel) {
            return NextResponse.json(
                { error: "competencyName and targetLevel are required" },
                { status: 400 }
            );
        }

        const systemPrompt = `You are an expert behavioral interviewer assessing the competency "${competencyName}" at ${targetLevel} level.
You have ${questionCount} questions to ask. Keep each response concise (2-3 sentences max) so the conversation flows naturally.
Ask one focused behavioral question at a time using the STAR method.
After the candidate answers, ask a probing follow-up or move to the next question naturally.
When all ${questionCount} questions have been asked and answered, thank the candidate warmly and say: "Thank you. That concludes our interview."
Do not number your questions. Do not mention the question count.`;

        const messages = [
            { role: "system", content: systemPrompt },
        ];

        // Ask the AI to produce an opening greeting + first question in one turn
        const seed: { role: string; content: string }[] = [
            ...messages,
            {
                role: "user",
                content: "[Start the interview now with a brief professional greeting and your first question.]",
            },
        ];

        const aiResponse = await generateChatCompletion(seed);
        const greeting = aiResponse.choices[0].message.content ?? `Hello! I'm your AI interviewer today. Let's begin by discussing your experience with ${competencyName}.`;

        // Generate speech for the greeting
        const audioBuffer = await generateSpeech(greeting);
        const audioBase64 = Buffer.from(audioBuffer).toString("base64");

        // Return the full initial messages array (system + first AI turn) so the client
        // can carry it forward into subsequent /api/ai/interview/process calls.
        const initialMessages = [
            { role: "system", content: systemPrompt },
            { role: "assistant", content: greeting },
        ];

        return NextResponse.json({
            greeting,
            audio: audioBase64,
            messages: initialMessages,
        });
    } catch (error: any) {
        console.error("Interview start error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to start interview" },
            { status: 500 }
        );
    }
}

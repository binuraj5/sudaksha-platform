import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { generateChatCompletion } from "@/lib/ai/providers";

/**
 * POST /api/ai/interview/evaluate
 * Evaluates a completed conversational interview transcript and returns structured scores.
 * Body: { competencyName, targetLevel, transcript: [{role, content}[]] }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { competencyName, targetLevel, transcript } = body;

        if (!competencyName || !targetLevel || !Array.isArray(transcript)) {
            return NextResponse.json(
                { error: "competencyName, targetLevel, and transcript are required" },
                { status: 400 }
            );
        }

        // Build a flat readable transcript from the messages array
        const readableTranscript = transcript
            .filter((m: { role: string; content: string }) => m.role !== "system")
            .map((m: { role: string; content: string }) =>
                `${m.role === "assistant" ? "INTERVIEWER" : "CANDIDATE"}: ${m.content}`
            )
            .join("\n\n");

        const evalMessages = [
            {
                role: "system",
                content: `You are an expert competency evaluator. Evaluate the following behavioral interview transcript for the competency "${competencyName}" at ${targetLevel} level.

Return ONLY valid JSON in this exact shape — no markdown fences, no explanation:
{
  "overall_score": <0-100>,
  "content_quality": <0-100>,
  "communication_clarity": <0-100>,
  "confidence": <0-100>,
  "professionalism": <0-100>,
  "feedback": "<2-3 sentence overall feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<area for improvement 1>", "<area for improvement 2>"]
}

Scoring guide:
- overall_score: holistic competency demonstration
- content_quality: relevance, depth, and use of STAR method
- communication_clarity: structure, conciseness, articulation
- confidence: decisiveness, tone, self-assurance
- professionalism: appropriate language, composure`,
            },
            {
                role: "user",
                content: `Transcript:\n\n${readableTranscript}`,
            },
        ];

        const aiResponse = await generateChatCompletion(evalMessages);
        const rawText = aiResponse.choices[0].message.content ?? "{}";

        let scores: Record<string, unknown>;
        try {
            scores = JSON.parse(rawText);
        } catch {
            // Attempt to extract JSON from markdown fences if LLM disobeys
            const match = rawText.match(/\{[\s\S]*\}/);
            scores = match ? JSON.parse(match[0]) : {};
        }

        return NextResponse.json({
            overall_score: Number(scores.overall_score ?? 70),
            content_quality: Number(scores.content_quality ?? 70),
            communication_clarity: Number(scores.communication_clarity ?? 70),
            confidence: Number(scores.confidence ?? 70),
            professionalism: Number(scores.professionalism ?? 70),
            feedback: String(scores.feedback ?? "Interview completed."),
            strengths: Array.isArray(scores.strengths) ? scores.strengths : [],
            weaknesses: Array.isArray(scores.weaknesses) ? scores.weaknesses : [],
        });
    } catch (error: any) {
        console.error("Interview evaluate error:", error);
        return NextResponse.json(
            { error: error.message || "Evaluation failed" },
            { status: 500 }
        );
    }
}

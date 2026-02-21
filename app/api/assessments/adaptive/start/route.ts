import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function getBaselineAbility(level: string) {
    switch (level.toUpperCase()) {
        case 'JUNIOR': return 3.0;
        case 'MIDDLE': return 5.0;
        case 'SENIOR': return 7.0;
        case 'EXPERT': return 9.0;
        default: return 5.0;
    }
}

export async function POST(req: Request) {
    try {
        const session = await getApiSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { memberAssessmentId, componentId, competencyId, targetLevel } = body;

        if (!memberAssessmentId || !componentId || !competencyId || !targetLevel) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const initialAbility = getBaselineAbility(targetLevel);

        // Check if an IN_PROGRESS session exists
        let adaptiveSession = await prisma.adaptiveSession.findFirst({
            where: { memberAssessmentId, componentId, status: "IN_PROGRESS", memberId: session.user.id },
            include: { questions: { orderBy: { sequenceNumber: 'asc' } } }
        });

        if (!adaptiveSession) {
            adaptiveSession = await prisma.adaptiveSession.create({
                data: {
                    memberAssessmentId,
                    componentId,
                    memberId: session.user.id,
                    competencyId,
                    currentAbility: initialAbility,
                    initialAbility,
                    targetLevel,
                    config: {},
                    status: "IN_PROGRESS"
                },
                include: { questions: true }
            });
        }

        // Return unanswered question if one exists to prevent rerolls
        const unanswered = adaptiveSession.questions.find(q => q.candidateAnswer === null);
        if (unanswered) {
            return NextResponse.json({ session: adaptiveSession, question: unanswered });
        }

        const competency = await prisma.competency.findUnique({
            where: { id: competencyId },
            include: { indicators: { where: { level: targetLevel } } }
        });

        if (!competency) {
            return NextResponse.json({ error: "Competency not found" }, { status: 404 });
        }

        const difficulty = Number(adaptiveSession.currentAbility);
        const sequenceNumber = adaptiveSession.questions.length + 1;

        const prompt = `
You are generating a multiple-choice question for a ${targetLevel} level candidate.
Competency: ${competency.name}
Description: ${competency.description}

Target Difficulty: ${difficulty}/10 (1-3: Entry, 4-6: Intermediate, 7-8: Advanced, 9-10: Expert)

Generate ONE practical, scenario-based multiple choice question.
Return strictly as JSON with this exact structure:
{
  "questionText": "The question scenario.",
  "options": [
    {"id": "A", "text": "Option A"},
    {"id": "B", "text": "Option B"},
    {"id": "C", "text": "Option C"},
    {"id": "D", "text": "Option D"}
  ],
  "correctAnswerId": "A",
  "explanation": "Why this is correct."
}`;

        const gptResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert technical assessor adhering strictly to IRT." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const generatedData = JSON.parse(gptResponse.choices[0].message.content || "{}");

        const newQuestion = await prisma.adaptiveQuestion.create({
            data: {
                sessionId: adaptiveSession.id,
                sequenceNumber,
                questionText: generatedData.questionText,
                questionType: "MULTIPLE_CHOICE",
                options: generatedData.options,
                correctAnswer: generatedData.correctAnswerId,
                explanation: generatedData.explanation,
                difficulty,
                generationPrompt: prompt
            }
        });

        return NextResponse.json({ session: adaptiveSession, question: newQuestion });

    } catch (e: any) {
        console.error("Adaptive Start Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

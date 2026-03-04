import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { GoogleGenerativeAI } from "@google/generative-ai";


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
        const { memberAssessmentId, componentId, targetLevel: bodyTargetLevel } = body;
        let { competencyId } = body;

        if (!memberAssessmentId || !componentId) {
            return NextResponse.json(
                { error: "Missing required fields", missing: ["memberAssessmentId", "componentId"].filter(f => !body[f]) },
                { status: 400 }
            );
        }

        // Resolve competencyId from the component relation if not supplied or empty
        if (!competencyId) {
            const component = await prisma.assessmentModelComponent.findUnique({
                where: { id: componentId },
                select: {
                    competencyId: true,
                    config: true,
                    competency: { select: { id: true } }
                }
            });
            competencyId = component?.competencyId
                ?? (component?.competency as { id?: string } | null)?.id
                ?? ((component?.config as any)?.competencyId ?? null);
        }

        if (!competencyId) {
            return NextResponse.json(
                { error: "Could not resolve competencyId for this component. Ensure the ADAPTIVE_AI component is linked to a competency.", missing: ["competencyId"] },
                { status: 400 }
            );
        }

        // Resolve targetLevel from body or component config
        let targetLevel = bodyTargetLevel;
        if (!targetLevel) {
            const comp = await prisma.assessmentModelComponent.findUnique({
                where: { id: componentId },
                select: { config: true }
            });
            targetLevel = (comp?.config as any)?.targetLevel ?? "MIDDLE";
        }

        const initialAbility = getBaselineAbility(targetLevel);

        // ── Resolve Member.id from the MemberAssessment (AdaptiveSession.memberId is FK → Member, not User) ──
        const memberAssessment = await prisma.memberAssessment.findUnique({
            where: { id: memberAssessmentId },
            select: { memberId: true }
        });

        if (!memberAssessment) {
            return NextResponse.json({ error: "Member assessment not found" }, { status: 404 });
        }

        const resolvedMemberId = memberAssessment.memberId;

        // Check if an IN_PROGRESS session exists
        let adaptiveSession = await prisma.adaptiveSession.findFirst({
            where: { memberAssessmentId, componentId, status: "IN_PROGRESS", memberId: resolvedMemberId },
            include: { questions: { orderBy: { sequenceNumber: 'asc' } } }
        });

        if (!adaptiveSession) {
            adaptiveSession = await prisma.adaptiveSession.create({
                data: {
                    memberAssessmentId,
                    componentId,
                    memberId: resolvedMemberId,
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

        // Using Google Gemini instead of OpenAI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are an expert technical assessor adhering strictly to IRT." }]
                },
                {
                    role: "model",
                    parts: [{ text: "I understand. I am an expert technical assessor adhering strictly to Item Response Theory (IRT). I am ready to generate assessment questions in the strict JSON format requested." }]
                }
            ]
        });

        const result = await chat.sendMessage([{ text: prompt }]);
        const responseText = result.response.text();
        const generatedData = JSON.parse(responseText || "{}");

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

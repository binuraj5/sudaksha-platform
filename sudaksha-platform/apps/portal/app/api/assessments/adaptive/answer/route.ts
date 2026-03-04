import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const session = await getApiSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { sessionId, questionId, answer } = body;

        if (!sessionId || !questionId || answer === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const adaptiveSession = await prisma.adaptiveSession.findUnique({
            where: { id: sessionId },
            include: { questions: { orderBy: { sequenceNumber: 'asc' } }, competency: true }
        });

        if (!adaptiveSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });
        if (adaptiveSession.status !== "IN_PROGRESS") return NextResponse.json({ error: "Session is not active" }, { status: 400 });

        const questionIndex = adaptiveSession.questions.findIndex((q: any) => q.id === questionId);
        if (questionIndex === -1) return NextResponse.json({ error: "Question not found" }, { status: 404 });

        const question = adaptiveSession.questions[questionIndex];

        let isCorrect = question.isCorrect ?? (answer === question.correctAnswer);
        let newAbility = Number(adaptiveSession.currentAbility);
        let shouldComplete = adaptiveSession.status === ("COMPLETED" as string);

        // Only update DB if the question hasn't been answered yet
        if (question.candidateAnswer === null) {
            isCorrect = answer === question.correctAnswer;

            await prisma.adaptiveQuestion.update({
                where: { id: questionId },
                data: {
                    candidateAnswer: answer,
                    isCorrect,
                    answeredAt: new Date(),
                    pointsAwarded: isCorrect ? question.difficulty : 0,
                    maxPoints: question.difficulty
                }
            });

            adaptiveSession.questions[questionIndex].isCorrect = isCorrect;
            adaptiveSession.questions[questionIndex].candidateAnswer = answer;

            const answeredQuestions = adaptiveSession.questions.filter((q: any) => q.isCorrect !== null);

            if (answeredQuestions.length >= 3) {
                const recent = answeredQuestions.slice(-3);
                const correctCount = recent.filter((r: any) => r.isCorrect).length;
                const accuracy = correctCount / 3;

                if (accuracy >= 0.8) newAbility += 0.5;
                else if (accuracy <= 0.4) newAbility -= 0.5;

                newAbility = Math.max(1, Math.min(10, newAbility));
            }

            const totalAnswered = answeredQuestions.length;

            if (totalAnswered >= 15) {
                shouldComplete = true;
            } else if (totalAnswered >= 8) {
                const last4 = answeredQuestions.slice(-4);
                const accuracy4 = last4.filter((r: any) => r.isCorrect).length / 4;
                if (accuracy4 === 1.0 || accuracy4 === 0.0) shouldComplete = true;
                else if (totalAnswered >= 12 && (accuracy4 >= 0.75 || accuracy4 <= 0.25)) shouldComplete = true;
            }

            await prisma.adaptiveSession.update({
                where: { id: sessionId },
                data: {
                    currentAbility: newAbility,
                    questionsAsked: totalAnswered,
                    questionsCorrect: answeredQuestions.filter((q: any) => q.isCorrect).length,
                    lastActivityAt: new Date(),
                    status: shouldComplete ? "COMPLETED" : "IN_PROGRESS"
                }
            });
        }

        if (shouldComplete) {
            return NextResponse.json({ completed: true, sessionId });
        }

        const answeredQuestions = adaptiveSession.questions.filter((q: any) => q.isCorrect !== null);
        const nextDifficulty = Math.min(10, newAbility + 0.5);

        let previousQaText = "";
        answeredQuestions.slice(-3).forEach((q: any, i: number) => {
            previousQaText += `Q${i + 1}: ${q.questionText}\nCandidate Answered: ${q.candidateAnswer}\nCorrect: ${q.isCorrect}\nDifficulty: ${q.difficulty}\n\n`;
        });

        const prompt = `
You are generating a multiple-choice question for a ${adaptiveSession.targetLevel} level candidate.
Competency: ${adaptiveSession.competency.name}
Description: ${adaptiveSession.competency.description}

Target Difficulty: ${nextDifficulty}/10 (1-3: Entry, 4-6: Intermediate, 7-8: Advanced, 9-10: Expert)

Recent Performance Context:
${previousQaText}

CRITICAL RULES:
1. Generate ONE question at EXACTLY difficulty ${nextDifficulty}/10
2. DO NOT repeat concepts from previous questions. Look at the Recent Performance Context and test a different aspect.
3. If they got the previous right, explore a nuanced harder angle. If wrong, step back to test a varied foundation.

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
                sequenceNumber: adaptiveSession.questions.length + 1,
                questionText: generatedData.questionText,
                questionType: "MULTIPLE_CHOICE",
                options: generatedData.options,
                correctAnswer: generatedData.correctAnswerId,
                explanation: generatedData.explanation,
                difficulty: nextDifficulty,
                generationPrompt: prompt
            }
        });

        return NextResponse.json({ completed: false, session: adaptiveSession, question: newQuestion, isCorrect });

    } catch (e: any) {
        console.error("Adaptive Answer Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

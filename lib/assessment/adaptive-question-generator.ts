/**
 * Adaptive AI Question Generator
 * Generates questions at specified difficulty for adaptive assessments.
 * Based on M9-5_ADAPTIVE_AI_COMPONENT_IMPLEMENTATION.md
 */
import { prisma } from "@/lib/prisma";
import { generateChatCompletion } from "@/lib/ai/providers";

export interface GenerateAdaptiveQuestionParams {
    sessionId: string;
    competencyId: string;
    competencyName: string;
    difficulty: number;
    allowedTypes: string[];
    previousQuestions: { questionText: string; isCorrect: boolean | null }[];
    sequenceNumber: number;
    indicators: { id: string; text: string }[];
    contextAware: boolean;
    targetLevel: string;
}

export interface GeneratedAdaptiveQuestion {
    id: string;
    questionText: string;
    questionType: string;
    options: { key: string; text: string; isCorrect?: boolean }[];
    correctAnswer: string;
    explanation: string | null;
    difficulty: number;
}

export async function generateAdaptiveQuestion(
    params: GenerateAdaptiveQuestionParams
): Promise<GeneratedAdaptiveQuestion> {
    const {
        sessionId,
        competencyId,
        competencyName,
        difficulty,
        allowedTypes,
        previousQuestions,
        sequenceNumber,
        indicators,
        contextAware,
        targetLevel,
    } = params;

    const questionType = allowedTypes.includes("MCQ") ? "MCQ" : allowedTypes[0] ?? "MCQ";
    const context = contextAware ? buildContext(previousQuestions) : "";
    const prompt = buildPrompt({
        competencyName,
        difficulty,
        questionType,
        indicators,
        context,
        previousQuestions,
        targetLevel,
    });

    const messages = [
        {
            role: "system",
            content:
                "You are an expert assessment designer creating adaptive difficulty questions for competency-based assessments. Always respond with valid JSON only, no markdown.",
        },
        { role: "user", content: prompt },
    ];

    const response = await generateChatCompletion(messages);
    const content = response.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("Empty response from AI");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const generated = JSON.parse(jsonStr) as Record<string, unknown>;

    const questionText = (generated.question as string) || (generated.text as string) || "Question";
    const rawOptions = (generated.options as Array<{ key?: string; text: string; isCorrect?: boolean }>) ?? [];
    const correctKey = String((generated.correctAnswer as string) ?? "").trim();
    const explanation = (generated.explanation as string) || null;

    const options = rawOptions.map((opt) => {
        const text = typeof opt === "string" ? opt : (opt.text as string);
        const key = (opt.key as string) || text?.slice(0, 1) || "A";
        const isCorrect = key === correctKey || text === correctKey;
        return { key, text, isCorrect };
    });
    const correctOpt = options.find((o) => o.isCorrect);
    const correctAnswer = correctOpt?.text ?? correctKey;

    const question = await prisma.adaptiveQuestion.create({
        data: {
            sessionId,
            questionText,
            questionType,
            options: options as unknown as Record<string, unknown>,
            correctAnswer,
            explanation,
            difficulty,
            sequenceNumber,
            generationPrompt: prompt,
        },
    });

    return {
        id: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        options: options,
        correctAnswer,
        explanation,
        difficulty,
    };
}

function buildContext(previousQuestions: { questionText: string; isCorrect: boolean | null }[]): string {
    if (previousQuestions.length === 0) return "";
    const recent = previousQuestions.slice(-2);
    const correctCount = recent.filter((q) => q.isCorrect).length;
    if (correctCount === recent.length) return "Candidate is performing well.";
    if (correctCount === 0) return "Candidate is struggling.";
    return "";
}

function buildPrompt(params: {
    competencyName: string;
    difficulty: number;
    questionType: string;
    indicators: { id: string; text: string }[];
    context: string;
    previousQuestions: { questionText: string; isCorrect: boolean | null }[];
    targetLevel: string;
}): string {
    const { competencyName, difficulty, questionType, indicators, context, previousQuestions, targetLevel } = params;

    const difficultyDesc =
        difficulty <= 3
            ? "Basic/Foundational"
            : difficulty <= 6
              ? "Intermediate/Practical"
              : difficulty <= 8
                ? "Advanced/Strategic"
                : "Expert/Thought Leadership";

    const prevSection =
        previousQuestions.length > 0
            ? `
Previous Questions:
${previousQuestions
    .slice(-3)
    .map(
        (q, i) =>
            `Q${i + 1}: ${q.questionText}\nCandidate: ${q.isCorrect ? "Correct" : "Incorrect"}`
    )
    .join("\n\n")}

CRITICAL: Do NOT repeat or be too similar to previous questions.
`
            : "";

    return `Generate ONE ${questionType} question for adaptive assessment.

Competency: ${competencyName}
Target Level: ${targetLevel}
Difficulty: ${difficulty}/10 (${difficultyDesc})

Indicators to test:
${indicators.map((i) => `- ${i.text}`).join("\n")}
${prevSection}
${context ? `Context: ${context}` : ""}

Requirements:
1. Difficulty must match ${difficulty}/10
2. Include 4 options (A, B, C, D)
3. Mark ONE correct answer
4. Provide clear explanation
5. Be practical and role-relevant

Return JSON:
{
  "question": "Question text...",
  "options": [
    {"key": "A", "text": "Option A"},
    {"key": "B", "text": "Option B"},
    {"key": "C", "text": "Option C"},
    {"key": "D", "text": "Option D"}
  ],
  "correctAnswer": "B",
  "explanation": "Why B is correct..."
}`;
}

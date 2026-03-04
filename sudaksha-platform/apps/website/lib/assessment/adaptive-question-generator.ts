/**
 * Generate a single adaptive question via AI and persist as AdaptiveQuestion (M9-5).
 */
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface GenerateAdaptiveQuestionParams {
    sessionId: string;
    competencyId: string;
    competencyName: string;
    difficulty: number;
    allowedTypes: string[];
    previousQuestions: { questionText: string; isCorrect: boolean }[];
    sequenceNumber: number;
    indicators: { id: string; text: string }[];
    contextAware: boolean;
    targetLevel: string;
}

export interface AdaptiveQuestionResult {
    id: string;
    questionText: string;
    questionType: string;
    options: unknown;
    correctAnswer: string | null;
    explanation: string | null;
    difficulty: number;
}

export async function generateAdaptiveQuestion(
    params: GenerateAdaptiveQuestionParams
): Promise<AdaptiveQuestionResult> {
    const type =
        params.allowedTypes.length > 0
            ? params.allowedTypes[params.sequenceNumber % params.allowedTypes.length]
            : "MCQ";
    const prompt = buildPrompt(params, type);

    let raw: Record<string, unknown>;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You generate a single assessment question in JSON. Return only valid JSON with keys: questionText, questionType, options (array of {text, isCorrect}), correctAnswer (text of correct option), explanation.",
                },
                { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 800,
        });
        const content = response.choices[0].message.content;
        if (!content) throw new Error("Empty AI response");
        raw = JSON.parse(content) as Record<string, unknown>;
    } catch (e) {
        console.error("Adaptive question generation failed:", e);
        raw = fallbackQuestion(params, type);
    }

    const questionText = (raw.questionText as string) || (raw.text as string) || "Explain your approach.";
    const questionType = (raw.questionType as string) || type;
    const options = (raw.options as unknown) ?? [];
    const optionsArr = Array.isArray(options) ? options : [];
    const correctOpt = optionsArr.find((o: { isCorrect?: boolean }) => o.isCorrect);
    const correctAnswer =
        (raw.correctAnswer as string) ||
        (correctOpt && (correctOpt as { text?: string }).text) ||
        null;
    const explanation = (raw.explanation as string) || null;

    const question = await prisma.adaptiveQuestion.create({
        data: {
            sessionId: params.sessionId,
            questionText,
            questionType: questionType === "SCENARIO_BASED" ? "SCENARIO_BASED" : "MULTIPLE_CHOICE",
            options: optionsArr.length ? optionsArr : undefined,
            correctAnswer,
            explanation,
            difficulty: params.difficulty,
            sequenceNumber: params.sequenceNumber,
            generationPrompt: prompt.slice(0, 2000),
        },
    });

    return {
        id: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: Number(question.difficulty),
    };
}

function buildPrompt(
    params: GenerateAdaptiveQuestionParams,
    type: string
): string {
    const prevContext = params.contextAware && params.previousQuestions.length > 0
        ? `Previous questions (do not repeat): ${params.previousQuestions.map((q) => q.questionText.slice(0, 80)).join("; ")}`
        : "";
    const indicatorsText =
        params.indicators.length > 0
            ? params.indicators.map((i) => i.text).join(", ")
            : params.competencyName;
    return `Generate ONE ${type} question for competency "${params.competencyName}" at ${params.targetLevel} level.
Difficulty (1-10): ${params.difficulty}.
Indicators to assess: ${indicatorsText}
${prevContext}

Return JSON: { "questionText": "...", "questionType": "${type}", "options": [{"text":"A","isCorrect":false},{"text":"B","isCorrect":true}], "correctAnswer": "B", "explanation": "..." }
For MCQ/SCENARIO_BASED include 4 options and one correct. Return only JSON.`;
}

function fallbackQuestion(
    params: GenerateAdaptiveQuestionParams,
    type: string
): Record<string, unknown> {
    return {
        questionText: `Describe your approach to ${params.competencyName} at ${params.targetLevel} level (question ${params.sequenceNumber}).`,
        questionType: type,
        options: [
            { text: "Option A", isCorrect: false },
            { text: "Option B", isCorrect: true },
            { text: "Option C", isCorrect: false },
            { text: "Option D", isCorrect: false },
        ],
        correctAnswer: "Option B",
        explanation: "Fallback question.",
    };
}

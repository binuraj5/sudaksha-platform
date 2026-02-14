import OpenAI from "openai";
import type { QuestionType } from "@prisma/client";
import { generateChatCompletion } from "@/lib/ai/providers";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export interface GenerationRequest {
    competencyName: string;
    competencyDescription?: string;
    roleName?: string;
    targetLevel: "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";
    indicators: { id: string; text: string; type?: string }[];
    componentType: "MCQ" | "SITUATIONAL" | "ESSAY" | "SHORT_ANSWER";
    questionCount: number;
    difficulty?: "EASY" | "MEDIUM" | "HARD";
    additionalContext?: string;
}

/**
 * Output format compatible with ComponentQuestion and AIGenerateQuestions.
 */
export interface GeneratedQuestion {
    questionText: string;
    questionType: QuestionType;
    options: { text: string; isCorrect: boolean; order?: number }[];
    correctAnswer: string | null;
    points: number;
    timeLimit: number | null;
    linkedIndicators: string[];
    explanation: string;
}

function mapToOutputFormat(
    raw: Record<string, unknown>,
    questionType: QuestionType,
    indicatorIds: string[]
): GeneratedQuestion {
    const scenario = (raw.scenario as string) || "";
    const question = (raw.question as string) || (raw.questionText as string) || "";
    const questionText =
        scenario && question ? `${scenario}\n\n${question}` : question || scenario;
    const points = (raw.points as number) ?? 2;
    const difficulty = (raw.difficulty as string) || "MEDIUM";
    const timeLimit = difficulty === "HARD" ? 300 : difficulty === "EASY" ? 90 : 120;

    // linkedIndicators: use provided IDs; raw may have text, we use first N indicator IDs
    let linkedIds = (raw.linkedIndicators as string[] | undefined) || [];
    if (linkedIds.length === 0 && indicatorIds.length > 0) {
        linkedIds = [indicatorIds[0]];
    }
    // If raw has text, filter to only valid indicator IDs
    let linkedIndicators = linkedIds.filter((id) => indicatorIds.includes(id));
    if (linkedIndicators.length === 0 && indicatorIds.length > 0) {
        linkedIndicators = [indicatorIds[0]];
    }

    const explanation = (raw.explanation as string) || "";

    if (questionType === "ESSAY") {
        return {
            questionText,
            questionType: "ESSAY",
            options: [],
            correctAnswer: null,
            points,
            timeLimit,
            linkedIndicators,
            explanation
        };
    }

    const rawOptions = (raw.options as Array<Record<string, unknown>>) || [];
    const options = rawOptions.map((opt, idx) => {
        const text = (opt.text as string) || String(opt);
        let isCorrect = Boolean(opt.isCorrect);
        if ("effectiveness" in opt && typeof opt.effectiveness === "number") {
            const maxEff = Math.max(...rawOptions.map((o) => (o.effectiveness as number) ?? 0));
            isCorrect = (opt.effectiveness as number) === maxEff;
        }
        return { text, isCorrect, order: idx };
    });

    const correctOption = options.find((o) => o.isCorrect);
    const correctAnswer = correctOption ? correctOption.text : null;

    return {
        questionText,
        questionType: questionType === "SCENARIO_BASED" ? "SCENARIO_BASED" : "MULTIPLE_CHOICE",
        options,
        correctAnswer,
        points,
        timeLimit,
        linkedIndicators,
        explanation
    };
}

/**
 * AI Question Generator for assessment components.
 * Supports MCQ, Situational (SCENARIO_BASED), and Essay questions.
 */
export class AIQuestionGenerator {
    /**
     * Generate MCQ questions using GPT-4
     */
    static async generateMCQQuestions(request: GenerationRequest): Promise<GeneratedQuestion[]> {
        const prompt = this.buildMCQPrompt(request);
        const raw = await this.callOpenAI(prompt, "multiple-choice");
        const questions = (raw.questions as Record<string, unknown>[]) || [];
        const indicatorIds = request.indicators.map((i) => i.id);
        return questions.map((q) =>
            mapToOutputFormat(q, "MULTIPLE_CHOICE", indicatorIds)
        );
    }

    /**
     * Generate situational/scenario-based questions using GPT-4
     */
    static async generateSituationalQuestions(
        request: GenerationRequest
    ): Promise<GeneratedQuestion[]> {
        const prompt = this.buildSituationalPrompt(request);
        const raw = await this.callOpenAI(prompt, "situational");
        const questions = (raw.questions as Record<string, unknown>[]) || [];
        const indicatorIds = request.indicators.map((i) => i.id);
        return questions.map((q) =>
            mapToOutputFormat(q, "SCENARIO_BASED", indicatorIds)
        );
    }

    /**
     * Generate essay prompts using GPT-4
     */
    static async generateEssayPrompts(request: GenerationRequest): Promise<GeneratedQuestion[]> {
        const prompt = this.buildEssayPrompt(request);
        const raw = await this.callOpenAI(prompt, "essay");
        const questions = (raw.questions as Record<string, unknown>[]) || [];
        const indicatorIds = request.indicators.map((i) => i.id);
        return questions.map((q) => mapToOutputFormat(q, "ESSAY", indicatorIds));
    }

    /**
     * Generate short-answer prompts (concise responses, 2-4 sentences)
     */
    static async generateShortAnswerPrompts(request: GenerationRequest): Promise<GeneratedQuestion[]> {
        const prompt = this.buildShortAnswerPrompt(request);
        const raw = await this.callOpenAI(prompt, "essay");
        const questions = (raw.questions as Record<string, unknown>[]) || [];
        const indicatorIds = request.indicators.map((i) => i.id);
        return questions.map((q) => mapToOutputFormat(q, "ESSAY", indicatorIds));
    }

    private static async callOpenAI(
        prompt: string,
        mode: "multiple-choice" | "situational" | "essay"
    ): Promise<Record<string, unknown>> {
        const systemContent =
            mode === "multiple-choice"
                ? "You are an expert assessment designer creating high-quality multiple-choice questions for competency-based assessments. Generate questions that accurately measure the specified indicators at the target proficiency level. Always respond in valid JSON format only, no markdown."
                : mode === "situational"
                  ? "You are an expert in situational judgment tests and behavioral assessments. Create realistic workplace scenarios that assess decision-making and problem-solving aligned with specific competency indicators. Always respond in valid JSON format only, no markdown."
                  : "You are an expert in creating essay questions that assess deep understanding and analytical thinking. Create prompts that require candidates to demonstrate comprehensive knowledge and critical thinking aligned with competency indicators. Always respond in valid JSON format only, no markdown.";

        const messages = [
            { role: "system", content: systemContent },
            { role: "user", content: prompt }
        ];

        if (process.env.GEMINI_API_KEY) {
            try {
                const response = await generateChatCompletion(messages);
                const content = response.choices[0].message.content;
                if (!content) throw new Error("Empty response from AI");
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : content;
                return JSON.parse(jsonStr) as Record<string, unknown>;
            } catch (e) {
                console.warn("Gemini fallback:", e);
            }
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemContent },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: mode === "situational" ? 0.8 : 0.7,
            max_tokens: 4000
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("Empty response from OpenAI");

        return JSON.parse(content) as Record<string, unknown>;
    }

    private static buildMCQPrompt(request: GenerationRequest): string {
        const levelDescriptions: Record<string, string> = {
            JUNIOR: "entry-level proficiency, foundational knowledge",
            MIDDLE: "intermediate proficiency, practical application",
            SENIOR: "advanced proficiency, strategic thinking",
            EXPERT: "expert-level proficiency, thought leadership"
        };

        const indicatorList = request.indicators.map((i) => i.text);
        const indicatorIds = request.indicators.map((i) => i.id);

        return `
Generate ${request.questionCount} multiple-choice questions to assess the following:

Competency: ${request.competencyName}
${request.competencyDescription ? `Description: ${request.competencyDescription}` : ""}
${request.roleName ? `Role: ${request.roleName}` : ""}
Target Level: ${request.targetLevel} (${levelDescriptions[request.targetLevel] ?? "professional"})

Indicators to assess (use the exact ID in linkedIndicators for each question):
${indicatorList.map((text, i) => `- ID "${indicatorIds[i]}": ${text}`).join("\n")}

Requirements:
- Each question must have 4 options (A, B, C, D)
- Only ONE correct answer per question
- Questions must be relevant to the ${request.targetLevel} level
- Difficulty: ${request.difficulty || "MEDIUM"}
- Each question should test specific indicator(s) - put the indicator ID in linkedIndicators
- Provide clear explanations for correct answers
- Assign points based on difficulty (Easy: 1pt, Medium: 2pts, Hard: 3pts)

${request.additionalContext ? `ADDITIONAL CONTEXT:\n${request.additionalContext}\n` : ""}

Return JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here...",
      "type": "MCQ",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true },
        { "text": "Option C", "isCorrect": false },
        { "text": "Option D", "isCorrect": false }
      ],
      "explanation": "Explanation why B is correct...",
      "linkedIndicators": ["${indicatorIds[0] || ""}"],
      "points": 2,
      "difficulty": "MEDIUM"
    }
  ]
}

Generate ${request.questionCount} questions now.
`;
    }

    private static buildSituationalPrompt(request: GenerationRequest): string {
        const indicatorList = request.indicators.map((i) => i.text);
        const indicatorIds = request.indicators.map((i) => i.id);

        return `
Generate ${request.questionCount} situational judgment questions to assess the following:

Competency: ${request.competencyName}
Target Level: ${request.targetLevel}

Indicators to assess (use the exact ID in linkedIndicators):
${indicatorList.map((text, i) => `- ID "${indicatorIds[i]}": ${text}`).join("\n")}

Requirements:
- Create realistic workplace scenarios
- Each scenario should have a clear situation and decision point
- Provide 4 action options with effectiveness (1-5 scale, 5 = best)
- Include a "scenario" field with the situation description; the "question" field is the decision prompt
- Scenarios must be relevant to ${request.targetLevel} level responsibilities
- Test judgment, decision-making, and problem-solving
- Use linkedIndicators with the indicator IDs above

${request.additionalContext ? `ADDITIONAL CONTEXT:\n${request.additionalContext}\n` : ""}

Return JSON in this exact format:
{
  "questions": [
    {
      "scenario": "Detailed scenario description...",
      "question": "What would you do in this situation?",
      "type": "SITUATIONAL",
      "options": [
        { "text": "Action option A", "effectiveness": 5 },
        { "text": "Action option B", "effectiveness": 3 },
        { "text": "Action option C", "effectiveness": 2 },
        { "text": "Action option D", "effectiveness": 1 }
      ],
      "explanation": "Overall guidance on the best approach...",
      "linkedIndicators": ["${indicatorIds[0] || ""}"],
      "points": 5,
      "difficulty": "MEDIUM"
    }
  ]
}

Generate ${request.questionCount} questions now.
`;
    }

    private static buildEssayPrompt(request: GenerationRequest): string {
        const indicatorList = request.indicators.map((i) => i.text);
        const indicatorIds = request.indicators.map((i) => i.id);

        return `
Generate ${request.questionCount} essay prompts to assess the following:

Competency: ${request.competencyName}
Target Level: ${request.targetLevel}

Indicators to assess (use the exact ID in linkedIndicators):
${indicatorList.map((text, i) => `- ID "${indicatorIds[i]}": ${text}`).join("\n")}

Requirements:
- Create thought-provoking essay questions
- Questions should require comprehensive analysis
- Appropriate complexity for ${request.targetLevel} level
- Use linkedIndicators with the indicator IDs above
- Put evaluation guidance in the explanation field

${request.additionalContext ? `ADDITIONAL CONTEXT:\n${request.additionalContext}\n` : ""}

Return JSON in this exact format:
{
  "questions": [
    {
      "question": "Essay question prompt...",
      "type": "ESSAY",
      "explanation": "What makes a strong response and key points to evaluate...",
      "linkedIndicators": ["${indicatorIds[0] || ""}"],
      "points": 10,
      "difficulty": "HARD"
    }
  ]
}

Generate ${request.questionCount} questions now.
`;
    }

    private static buildShortAnswerPrompt(request: GenerationRequest): string {
        const indicatorList = request.indicators.map((i) => i.text);
        const indicatorIds = request.indicators.map((i) => i.id);

        return `
Generate ${request.questionCount} short-answer questions to assess the following:

Competency: ${request.competencyName}
Target Level: ${request.targetLevel}

Indicators to assess (use the exact ID in linkedIndicators):
${indicatorList.map((text, i) => `- ID "${indicatorIds[i]}": ${text}`).join("\n")}

Requirements:
- Create questions that require CONCISE answers (2-4 sentences max)
- Focus on specific, targeted knowledge or application
- Appropriate complexity for ${request.targetLevel} level
- Use linkedIndicators with the indicator IDs above
- Put evaluation guidance in the explanation field (key points for a strong brief answer)

${request.additionalContext ? `ADDITIONAL CONTEXT:\n${request.additionalContext}\n` : ""}

Return JSON in this exact format:
{
  "questions": [
    {
      "question": "Short-answer question requiring concise response...",
      "type": "ESSAY",
      "explanation": "Key points to evaluate in a strong 2-4 sentence response...",
      "linkedIndicators": ["${indicatorIds[0] || ""}"],
      "points": 5,
      "difficulty": "MEDIUM"
    }
  ]
}

Generate ${request.questionCount} questions now.
`;
    }
}

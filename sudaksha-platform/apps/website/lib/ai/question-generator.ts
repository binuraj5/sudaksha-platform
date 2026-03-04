import OpenAI from 'openai';
import { QuestionType, ProficiencyLevel } from '@prisma/client';
import { generateChatCompletion } from "@/lib/ai/providers";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export interface GenerationConfig {
    roleName: string;
    competencyName: string;
    level: ProficiencyLevel;
    indicators: { text: string; type: string; id: string }[];
    count: number;
    questionTypes: QuestionType[];
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    additionalContext?: string;
}

export async function generateQuestions(config: GenerationConfig) {
    const { roleName, competencyName, level, indicators, count, questionTypes, difficulty } = config;

    const positiveIndicators = indicators.filter(i => i.type === 'POSITIVE');
    const negativeIndicators = indicators.filter(i => i.type === 'NEGATIVE');

    const prompt = `
You are an expert assessment designer creating questions for a professional competency assessment.

CONTEXT:
- Role: ${roleName}
- Competency: ${competencyName}
- Level: ${level}
- Target Difficulty: ${difficulty}

POSITIVE INDICATORS (Skills to test):
${positiveIndicators.map(i => `- ${i.text}`).join('\n')}

NEGATIVE INDICATORS (Anti-patterns to avoid):
${negativeIndicators.map(i => `- ${i.text}`).join('\n')}

TASK:
Generate ${count} assessment questions testing the POSITIVE indicators.
Question types to use: ${questionTypes.join(', ')}

For NEGATIVE indicators, create scenario-based questions where the candidate must identify the problem or anti-pattern.

REQUIREMENTS:
1. Each question must test at least one indicator from the lists above.
2. Questions should be clear, unambiguous, and professional.
3. For MULTIPLE_CHOICE: Provide 4 options, exactly 1 marked as correct.
4. For TRUE_FALSE: Specify "true" or "false" as the correct answer.
5. Assigned points should be between 1 and 5.
6. Time limit should be between 60 and 300 seconds.
7. Include a clear explanation of why the correct answer is correct.

${config.additionalContext ? `ADDITIONAL CONTEXT:\n${config.additionalContext}\n` : ''}

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "questionText": "Question text here...",
      "questionType": "MULTIPLE_CHOICE",
      "options": [
        { "text": "Option 1", "isCorrect": false, "order": 0 },
        { "text": "Option 2", "isCorrect": true, "order": 1 },
        { "text": "Option 3", "isCorrect": false, "order": 2 },
        { "text": "Option 4", "isCorrect": false, "order": 3 }
      ],
      "correctAnswer": null,
      "points": 2,
      "timeLimit": 120,
      "linkedIndicators": ["exact-indicator-id-from-list"],
      "explanation": "Explanation here..."
    }
  ]
}

Ensure all "linkedIndicators" match the IDs provided in the context. Generate ${count} questions now.
`;

    const messages: any[] = [
        {
            role: 'system',
            content: 'You are an expert assessment designer and psychometrician. Your goal is to generate high-quality, valid, and reliable assessment questions. Always respond in valid JSON format only, no markdown or extra text.'
        },
        {
            role: 'user',
            content: prompt
        }
    ];

    try {
        if (process.env.GEMINI_API_KEY) {
            const response = await generateChatCompletion(messages);
            const content = response.choices[0].message.content;
            if (!content) throw new Error("Empty response from AI");
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : content;
            const parsed = JSON.parse(jsonStr);
            return parsed.questions;
        }
    } catch (geminiError) {
        console.warn("Gemini AI fallback:", geminiError);
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 3000
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("Empty response from OpenAI");

        const parsed = JSON.parse(content);
        return parsed.questions;
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
}

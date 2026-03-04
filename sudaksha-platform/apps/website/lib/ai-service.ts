
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Service for Assessment Content Generation
 */
export const AIService = {
    /**
     * Generate questions for a specific competency and level
     */
    async generateQuestions(params: {
        competency: string,
        level: string,
        indicators: string[],
        count: number,
        type: string
    }) {
        const prompt = `
            Generate ${params.count} questions for a ${params.type} assessment.
            Competency: ${params.competency}
            Target Level: ${params.level}
            Behavioral Indicators to cover:
            ${params.indicators.join('\n')}
            
            Return ONLY a JSON array of questions matching this schema:
            {
                "questionText": string,
                "questionType": "${params.type}",
                "options": string[] (if MCQ),
                "correctAnswer": string (if MCQ),
                "evaluationCriteria": string[] (if essay/scenario)
            }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content || "[]");
    },

    /**
     * Generate a full competency model for a job role
     */
    async generateCompetency(params: {
        role: string,
        industry: string,
        category: string
    }) {
        const prompt = `
            Generate a comprehensive competency definition for the role of "${params.role}" in the "${params.industry}" industry.
            Category: ${params.category}
            
            Return ONLY a JSON object with:
            {
                "name": string,
                "description": string,
                "indicators": [
                    { "level": "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT", "type": "POSITIVE" | "NEGATIVE", "text": string }
                ] (at least 2 positive and 2 negative per level)
            }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content || "{}");
    }
};

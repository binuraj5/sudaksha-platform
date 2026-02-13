import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            sessionId,
            componentId,
            performanceHistory = { recent: [], total: 0, correct: 0, streak: 0, userId: null },
            currentDifficulty,
            answeredCount = 0,
            runtimeConfig: bodyConfig,
        } = body;

        // Get runtime configuration from DB (if model exists) or from request body
        let config: any = null;
        if (typeof (prisma as any).runtimeGenerationConfig !== 'undefined') {
            config = await (prisma as any).runtimeGenerationConfig.findUnique({
                where: { componentId },
            });
        }
        if (!config && bodyConfig && (bodyConfig.totalQuestions || bodyConfig.enabled !== false)) {
            config = {
                ...bodyConfig,
                enabled: true,
                startingDifficulty: bodyConfig.startingDifficulty || 'intermediate',
                totalQuestions: bodyConfig.totalQuestions ?? 10,
                increaseDifficultyAfter: bodyConfig.increaseDifficultyAfter ?? 2,
                decreaseDifficultyAfter: bodyConfig.decreaseDifficultyAfter ?? 2,
                questionTypeDistribution: bodyConfig.questionTypeDistribution || { multiple_choice: 100 },
                competencyAreas: bodyConfig.competencyAreas || ['General'],
                initialContext: bodyConfig.initialContext || 'Assessment',
                storeGeneratedQuestions: bodyConfig.storeGeneratedQuestions ?? false,
                aiModel: bodyConfig.aiModel,
                aiProvider: bodyConfig.aiProvider,
            };
        }
        if (!config || config.enabled === false) {
            return NextResponse.json(
                { error: 'Runtime generation not configured. Pass runtimeConfig in body or configure component.' },
                { status: 400 }
            );
        }

        // Determine if difficulty should be adjusted
        const newDifficulty = calculateAdaptiveDifficulty(
            performanceHistory,
            currentDifficulty || config.startingDifficulty,
            config
        );

        // Determine next question type based on distribution
        const nextQuestionType = selectQuestionType(
            config.questionTypeDistribution,
            performanceHistory
        );

        // Select next competency area (round-robin or based on performance)
        const nextCompetencyArea = selectNextCompetencyArea(
            config.competencyAreas,
            performanceHistory
        );

        // Build prompt for AI
        const prompt = buildRuntimeQuestionPrompt({
            context: config.initialContext,
            competencyArea: nextCompetencyArea,
            difficulty: newDifficulty,
            questionType: nextQuestionType,
            performanceHistory,
            answeredCount,
            totalQuestions: config.totalQuestions,
        });

        // Generate question using AI
        const question = await generateQuestionWithAI(prompt, config.aiModel);

        // Store generated question if configured
        if (config.storeGeneratedQuestions && typeof (prisma as any).runtimeGeneratedQuestion !== 'undefined') {
            await (prisma as any).runtimeGeneratedQuestion.create({
                data: {
                    assessmentSessionId: sessionId,
                    respondentId: performanceHistory.userId || 'anonymous',
                    questionText: question.text,
                    questionType: question.type,
                    difficulty: newDifficulty,
                    competencyArea: nextCompetencyArea,
                    options: question.options ?? undefined,
                    correctAnswer: question.correctAnswer ?? null,
                    adaptiveContext: {
                        performanceHistory,
                        difficulty: newDifficulty,
                        questionType: nextQuestionType,
                        competencyArea: nextCompetencyArea,
                    },
                },
            });
        }

        return NextResponse.json({
            question,
            metadata: {
                difficulty: newDifficulty,
                competencyArea: nextCompetencyArea,
                questionNumber: answeredCount + 1,
                totalQuestions: config.totalQuestions,
            },
        });
    } catch (error) {
        console.error('Runtime generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate question' },
            { status: 500 }
        );
    }
}

function calculateAdaptiveDifficulty(
    history: any,
    currentDifficulty: string,
    config: any
): string {
    const recentAnswers = history.recent || [];
    const correctStreak = recentAnswers.filter((a: any) => a.isCorrect).length;
    const incorrectStreak = recentAnswers.filter((a: any) => a.isCorrect === false).length;

    const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = difficultyLevels.indexOf((currentDifficulty || 'intermediate').toLowerCase());

    if (correctStreak >= config.increaseDifficultyAfter && currentIndex < difficultyLevels.length - 1) {
        return difficultyLevels[currentIndex + 1];
    }

    if (incorrectStreak >= config.decreaseDifficultyAfter && currentIndex > 0) {
        return difficultyLevels[currentIndex - 1];
    }

    return currentDifficulty;
}

function selectQuestionType(distribution: any, history: any): string {
    if (!distribution) return 'multiple_choice';
    // Simple logic: return highest percentage type for now
    const types = Object.entries(distribution);
    if (types.length === 0) return 'multiple_choice';
    return types.sort((a: any, b: any) => (b[1] as number) - (a[1] as number))[0][0];
}

function selectNextCompetencyArea(areas: string[], history: any): string {
    if (!areas || areas.length === 0) return 'General';
    const index = (history.total || 0) % areas.length;
    return areas[index];
}

async function generateQuestionWithAI(prompt: string, config: any) {
    const provider = config.aiProvider || 'ANTHROPIC';
    const model = config.aiModel || 'claude-3-5-sonnet';

    let jsonResponse;

    switch (provider) {
        case 'OPENAI':
            if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
            const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that generates assessment questions in JSON format.' },
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: "json_object" }
                }),
            });
            if (!openAIResponse.ok) throw new Error(`OpenAI API Error: ${openAIResponse.statusText}`);
            const openAIData = await openAIResponse.json();
            jsonResponse = openAIData.choices[0].message.content;
            break;

        case 'PERPLEXITY':
            if (!process.env.PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not set");
            const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.1-sonar-large-128k-online',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that generates assessment questions in JSON format.' },
                        { role: 'user', content: prompt }
                    ]
                }),
            });
            if (!perplexityResponse.ok) throw new Error(`Perplexity API Error: ${perplexityResponse.statusText}`);
            const perplexityData = await perplexityResponse.json();
            jsonResponse = perplexityData.choices[0].message.content;
            break;

        case 'XAI':
            if (!process.env.XAI_API_KEY) throw new Error("XAI_API_KEY not set");
            const xAIResponse = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'grok-beta',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that generates assessment questions in JSON format.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7
                }),
            });
            if (!xAIResponse.ok) throw new Error(`xAI API Error: ${xAIResponse.statusText}`);
            const xAIData = await xAIResponse.json();
            jsonResponse = xAIData.choices[0].message.content;
            break;

        case 'ANTHROPIC':
        default:
            if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
            const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
                    messages: [{ role: 'user', content: prompt }],
                }),
            });
            if (!anthropicResponse.ok) throw new Error(`Anthropic API Error: ${anthropicResponse.statusText}`);
            const anthropicData = await anthropicResponse.json();
            jsonResponse = anthropicData.content[0].text;
            break;
    }

    // Parse JSON from markdown or raw string
    try {
        const jsonMatch = jsonResponse.match(/```json\n([\s\S]*?)\n```/) || jsonResponse.match(/\{([\s\S]*?)\}/);
        const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : jsonResponse;
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse AI response:", jsonResponse);
        throw new Error("Invalid format from AI Provider");
    }
}

function buildRuntimeQuestionPrompt(params: any): string {
    return `You are generating question #${params.answeredCount + 1} of ${params.totalQuestions} for an adaptive assessment.

**Assessment Context**: ${params.context}

**Current Focus**: ${params.competencyArea}

**Difficulty Level**: ${params.difficulty}

**Question Type**: ${params.questionType}

**Performance History**:
- Total Answered: ${params.performanceHistory.total || 0}
- Correct: ${params.performanceHistory.correct || 0}
- Current Streak: ${params.performanceHistory.streak || 0}

**Requirements**:
1. Generate ONE ${params.questionType} question at ${params.difficulty} level
2. Focus on ${params.competencyArea}
3. The question should build on or complement previous questions
4. Avoid repeating similar concepts
5. Ensure the question is appropriate for the current difficulty level

**Output Format**:
\`\`\`json
{
  "text": "Question text here",
  "type": "${params.questionType}",
  "difficulty": "${params.difficulty}",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": "Correct option",
  "explanation": "Why this answer is correct",
  "points": 1-5
}
\`\`\`

Generate the question now. Return ONLY the JSON object.`;
}

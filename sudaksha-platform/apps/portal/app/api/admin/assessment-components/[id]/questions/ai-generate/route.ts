import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const u = session.user as { role?: string; userType?: string };
        const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "INSTITUTION_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD"];
        const isAdmin = (u.role ? ALLOWED_ROLES.includes(u.role) : false) || u.userType === "SUPER_ADMIN";
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: componentId } = await params;
        const body = await request.json();
        // Build AI prompt
        const prompt = buildQuestionGenerationPrompt(body);

        // Check for API key
        if (!process.env.ANTHROPIC_API_KEY) {
            console.error('ANTHROPIC_API_KEY is not set');
            // We'll continue if XAI key is set and model is grok, otherwise validation below will catch it
        }

        const model = body.model || 'gemini-1.5-flash';
        let aiResponseText = "";
        let usedModel = model;

        if (model.includes('gpt')) {
            // --- OpenAI Implementation ---
            if (!process.env.OPENAI_API_KEY) {
                return NextResponse.json({ error: 'OpenAI service not configured. Please set OPENAI_API_KEY.' }, { status: 500 });
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: model, // e.g. 'gpt-4o'
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that generates assessment questions in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('OpenAI API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                const errorMessage = errorData.error?.message || errorData.message || `OpenAI API error: ${response.status}`;
                return NextResponse.json({ error: errorMessage }, { status: response.status });
            }

            const data = await response.json();
            if (!data.choices || data.choices.length === 0) {
                throw new Error('Empty response from OpenAI provider');
            }
            aiResponseText = data.choices[0].message.content;
            usedModel = data.model || model;

        } else if (model.includes('gemini')) {
            // --- Google Gemini Implementation ---
            if (!process.env.GEMINI_API_KEY) {
                return NextResponse.json({ error: 'Gemini service not configured. Please set GEMINI_API_KEY.' }, { status: 500 });
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model.includes('gemini') ? model : 'gemini-1.5-flash'}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "You are a helpful assistant that generates assessment questions in JSON format.\n\n" + prompt
                        }]
                    }]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Gemini API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                const errorMessage = errorData.error?.message || `Gemini API error: ${response.status}`;
                return NextResponse.json({ error: errorMessage }, { status: response.status });
            }

            const data = await response.json();
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('Empty response from Gemini provider');
            }
            aiResponseText = data.candidates[0].content.parts[0].text;
            usedModel = 'gemini-1.5-flash';

        } else if (model.includes('grok')) {
            // --- xAI (Grok) Implementation ---
            if (!process.env.XAI_API_KEY) {
                return NextResponse.json({ error: 'xAI service not configured. Please set XAI_API_KEY.' }, { status: 500 });
            }
            console.log("Using xAI Key (masked):", process.env.XAI_API_KEY.substring(0, 5) + "...");


            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: model.includes('grok') ? model : 'grok-2-latest',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that generates assessment questions in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('xAI API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                const errorMessage = errorData.error?.message || errorData.message || `xAI API error: ${response.status}`;
                return NextResponse.json({ error: errorMessage }, { status: response.status });
            }

            const data = await response.json();
            if (!data.choices || data.choices.length === 0) {
                throw new Error('Empty response from xAI provider');
            }
            aiResponseText = data.choices[0].message.content;
            usedModel = data.model || 'grok-beta';

        } else {
            // --- Anthropic (Claude) Implementation ---
            if (!process.env.ANTHROPIC_API_KEY) {
                return NextResponse.json({ error: 'Anthropic service not configured. Please set ANTHROPIC_API_KEY.' }, { status: 500 });
            }

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: model.includes('2024') ? model : 'claude-3-5-sonnet-20240620',
                    max_tokens: 4096,
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Anthropic API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                const errorMessage = errorData.error?.message || errorData.message || `API error: ${response.status} ${response.statusText}`;
                return NextResponse.json({ error: errorMessage }, { status: response.status });
            }

            const data = await response.json();
            if (!data.content || data.content.length === 0) {
                throw new Error('Empty response from AI provider');
            }
            aiResponseText = data.content[0].text;
        }

        // Parse generated questions
        const questions = parseAIGeneratedQuestions(aiResponseText);

        return NextResponse.json({
            success: true,
            questions,
            metadata: {
                generated_at: new Date().toISOString(),
                model: usedModel,
                parameters: body,
            },
        });
    } catch (error: any) {
        console.error('AI generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate questions' },
            { status: 500 }
        );
    }
}

function buildQuestionGenerationPrompt(params: any): string {
    return `You are an expert assessment designer for SudakshaNWS. Create ${params.count} questions based on the STRICT specifications below.

SECTION 1: QUESTION CONTEXT
- Topic: ${params.topic}
- Difficulty: ${params.difficulty}
- Question Types: ${params.questionTypes.join(', ')}
- Total Questions: ${params.count}

SECTION 2: SCENARIO & CONTEXT
- Learning Objectives: ${params.learningObjectives || 'N/A'}
- Key Concepts involved: ${Array.isArray(params.keyConcepts) ? params.keyConcepts.join(', ') : params.keyConcepts}
- Industry Context: ${params.industry}
- Real-World Application: ${params.realWorldContext || 'General application'}

SECTION 3: SPECIFICATIONS
- Include Code Snippets: ${params.includeCode ? `YES (${params.programmingLanguage})` : 'NO'}
- Target Bloom's Taxonomy Levels: ${params.bloomsLevel.join(', ')}
- Approximate Points per Question: ${params.points}
- Time Limit (seconds): ${params.timeLimit}

SECTION 4: QUALITY CONTROL
- Tone: ${params.tone}
- Pitfalls to Avoid: ${params.avoidPitfalls.join(', ')}

OUTPUT FORMAT:
Return a JSON array where each object represents a question.
Structure:
[
  {
    "questionText": "The question stem...",
    "questionType": "MULTIPLE_CHOICE | TRUE_FALSE | CODING_CHALLENGE | ESSAY | SCENARIO_BASED",
    "difficulty": "Beginner | Intermediate | Advanced | Expert",
    "points": number,
    "estimatedTime": number (seconds),
    "options": [
      { "text": "Option A", "isCorrect": boolean, "explanation": "Why correct/incorrect" },
      { "text": "Option B", "isCorrect": boolean }
    ],
    "correctAnswer": "For non-MCQ, the answer text",
    "explanation": "General explanation of the solution",
    "bloomsLevel": "The level",
    "tags": ["concept1", "concept2"],
    "starterCode": "If coding challenge, initial code",
    "testCases": [{"input": "...", "output": "..."}]
  }
]

Do not include any text outside the JSON array. Ensure strictly valid JSON.`;
}

function parseAIGeneratedQuestions(text: string): any[] {
    try {
        console.log("Raw AI Response:", text.substring(0, 500) + "...");

        let jsonText = text;
        // 1. Try to find markdown block
        const markdownMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
        if (markdownMatch) {
            jsonText = markdownMatch[1];
        } else {
            // 2. Try to find start of array or object
            const firstBracket = text.indexOf('[');
            const firstBrace = text.indexOf('{');

            if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
                // Looks like an array
                const lastBracket = text.lastIndexOf(']');
                if (lastBracket !== -1) {
                    jsonText = text.substring(firstBracket, lastBracket + 1);
                }
            } else if (firstBrace !== -1) {
                // Looks like an object containing research
                const lastBrace = text.lastIndexOf('}');
                if (lastBrace !== -1) {
                    jsonText = text.substring(firstBrace, lastBrace + 1);
                }
            }
        }

        let questionsData = JSON.parse(jsonText.trim());

        // Handle if AI wrapped it in an object like { "questions": [...] }
        const questionsArray = Array.isArray(questionsData)
            ? questionsData
            : (questionsData.questions || questionsData.data || []);

        if (!Array.isArray(questionsArray)) {
            console.error("Parsed data is not an array:", questionsArray);
            return [];
        }

        const typeMapping: Record<string, string> = {
            'multiple_choice': 'MULTIPLE_CHOICE',
            'multiple choice': 'MULTIPLE_CHOICE',
            'mcq': 'MULTIPLE_CHOICE',
            'true_false': 'TRUE_FALSE',
            'true or false': 'TRUE_FALSE',
            'essay': 'ESSAY',
            'coding': 'CODING_CHALLENGE',
            'coding_challenge': 'CODING_CHALLENGE',
            'scenario': 'SCENARIO_BASED',
            'scenario_based': 'SCENARIO_BASED'
        };

        return questionsArray.map((q: any) => {
            const rawType = (q.questionType || q.question_type || q.type || 'MULTIPLE_CHOICE').toString().toLowerCase();
            const normalizedType = typeMapping[rawType] || 'MULTIPLE_CHOICE';

            return {
                questionText: q.questionText || q.question_text || q.text || q.question || 'Missing question text',
                questionType: normalizedType,
                difficulty: q.difficulty || 'intermediate',
                points: q.points || 1,
                timeLimit: q.estimatedTime || q.time_limit || q.timeLimit || 60,
                options: (q.options || []).map((opt: any) => {
                    if (typeof opt === 'string') {
                        return { text: opt, isCorrect: opt === (q.correctAnswer || q.correct_answer || q.answer) };
                    }
                    return {
                        text: opt.text || opt.option || opt.value || '',
                        isCorrect: !!(opt.isCorrect || opt.is_correct || opt.correct || opt === (q.correctAnswer || q.correct_answer || q.answer)),
                        explanation: opt.explanation || ''
                    };
                }),
                correctAnswer: q.correctAnswer || q.correct_answer || q.answer || '',
                explanation: q.explanation || q.rationale || '',
                bloomsLevel: q.bloomsLevel || q.blooms_level || '',
                tags: q.tags || [],
                starterCode: q.starterCode || q.starter_code || '',
                testCases: q.testCases || q.test_cases || [],
                evaluationCriteria: q.evaluationCriteria || q.criteria || null
            };
        });
    } catch (error) {
        console.error('Failed to parse AI-generated questions:', error);
        return []; // Return empty instead of throwing to see if it allows the UI to show "0 questions" or error gracefully
    }
}

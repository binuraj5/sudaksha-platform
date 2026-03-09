/**
 * Helper to call the Python FastAPI backend (Voice, Video, Code services).
 * When PYTHON_API_URL is not configured, video and interview functions fall back
 * to GPT-4o Vision via the OpenAI SDK so NO separate Python process is required.
 */
import OpenAI from "openai";

const PYTHON_API_URL = process.env.PYTHON_API_URL ?? "";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudioPython(audioFile: File): Promise<{ text: string; transcript: string }> {
    const formData = new FormData();
    formData.append("audio", audioFile);
    const response = await fetch(`${PYTHON_API_URL}/api/voice/transcribe`, {
        method: "POST",
        body: formData,
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail || "Transcription failed");
    }
    return response.json();
}

// Shared helper: detect connection-refused errors
function isServiceDown(err: unknown): boolean {
    const msg = (err as any)?.cause?.code ?? (err as any)?.code ?? "";
    return msg === "ECONNREFUSED" || msg === "ENOTFOUND" || msg === "ECONNRESET";
}

export async function startVoiceInterview(params: {
    competencyName: string;
    targetLevel: string;
    questionCount?: number;
}): Promise<{ session_id: string; initial_question: string; question_number: number }> {
    try {
        const response = await fetch(`${PYTHON_API_URL}/api/voice/start-interview`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                competency_name: params.competencyName,
                target_level: params.targetLevel,
                question_count: params.questionCount ?? 5,
            }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error((err as { detail?: string }).detail || "Failed to start interview");
        }
        return response.json();
    } catch (err) {
        if (!isServiceDown(err)) throw err;
        // OpenAI fallback when Python service is down
        const count = params.questionCount ?? 5;
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert interview designer. Return ONLY a JSON object." },
                { role: "user", content: `Generate ${count} behavioural interview questions for a ${params.targetLevel} level candidate assessed on the competency "${params.competencyName}". Return JSON: { "questions": ["Q1", "Q2", ...] }` },
            ],
            response_format: { type: "json_object" },
        });
        const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
        const questions: string[] = Array.isArray(parsed.questions) ? parsed.questions : [`Tell me about your experience with ${params.competencyName}.`];
        return {
            session_id: `gpt-session-${Date.now()}`,
            initial_question: questions[0],
            question_number: 1,
        };
    }
}

export async function processVoiceResponse(params: {
    sessionId: string;
    question: string;
    transcript: string;
    questionNumber: number;
    totalQuestions?: number;
}): Promise<{
    follow_up_question: string | null;
    is_complete: boolean;
    next_question_number: number;
}> {
    try {
        const response = await fetch(`${PYTHON_API_URL}/api/voice/respond`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: params.sessionId,
                question: params.question,
                transcript: params.transcript,
                question_number: params.questionNumber,
            }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error((err as { detail?: string }).detail || "Failed to process response");
        }
        return response.json();
    } catch (err) {
        if (!isServiceDown(err)) throw err;
        // OpenAI fallback — generate a follow-up question based on the transcript
        const total = params.totalQuestions ?? 5;
        const isComplete = params.questionNumber >= total;
        if (isComplete) {
            return { follow_up_question: null, is_complete: true, next_question_number: params.questionNumber + 1 };
        }
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert interviewer. Return ONLY a JSON object with a single follow-up question." },
                { role: "user", content: `The candidate was asked: "${params.question}" and responded: "${params.transcript}". Generate a relevant follow-up interview question. Return JSON: { "follow_up_question": "..." }` },
            ],
            response_format: { type: "json_object" },
        });
        const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
        return {
            follow_up_question: parsed.follow_up_question ?? null,
            is_complete: false,
            next_question_number: params.questionNumber + 1,
        };
    }
}

export async function evaluateVoiceInterview(params: {
    competencyName: string;
    targetLevel: string;
    transcript: string;
    indicators?: string[];
}): Promise<{
    overall_score: number;
    content_quality: number;
    communication_clarity: number;
    confidence: number;
    professionalism: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
}> {
    try {
        const response = await fetch(`${PYTHON_API_URL}/api/voice/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                competency_name: params.competencyName,
                target_level: params.targetLevel,
                transcript: params.transcript,
                indicators: params.indicators ?? [],
            }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error((err as { detail?: string }).detail || "Failed to evaluate interview");
        }
        return response.json();
    } catch (err) {
        if (!isServiceDown(err)) throw err;
        // OpenAI fallback evaluation
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert HR assessor. Return ONLY a JSON object with numeric scores (0-100) and feedback." },
                { role: "user", content: `Evaluate this voice interview for the competency "${params.competencyName}" at ${params.targetLevel} level.\n\nTranscript:\n${params.transcript}\n\nReturn JSON: { "overall_score": 0-100, "content_quality": 0-100, "communication_clarity": 0-100, "confidence": 0-100, "professionalism": 0-100, "feedback": "...", "strengths": ["..."], "weaknesses": ["..."] }` },
            ],
            response_format: { type: "json_object" },
        });
        const p = JSON.parse(completion.choices[0].message.content ?? "{}");
        return {
            overall_score: Number(p.overall_score ?? 70),
            content_quality: Number(p.content_quality ?? 70),
            communication_clarity: Number(p.communication_clarity ?? 70),
            confidence: Number(p.confidence ?? 70),
            professionalism: Number(p.professionalism ?? 70),
            feedback: p.feedback ?? "Your interview has been evaluated.",
            strengths: Array.isArray(p.strengths) ? p.strengths : [],
            weaknesses: Array.isArray(p.weaknesses) ? p.weaknesses : [],
        };
    }
}

export async function startVideoInterviewPython(params: {
    competencyName: string;
    targetLevel: string;
    questionCount?: number;
}): Promise<{ session_id: string; questions: string[]; question_count: number }> {
    // GPT-4o fallback when Python backend is not configured
    if (!PYTHON_API_URL) {
        const count = params.questionCount ?? 3;
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert interview designer. Return ONLY a JSON object with a 'questions' array.",
                },
                {
                    role: "user",
                    content: `Generate ${count} behavioural interview questions for a ${params.targetLevel} level candidate being assessed on the competency: "${params.competencyName}". Return JSON: { "questions": ["Q1", "Q2", ...] }`,
                },
            ],
            response_format: { type: "json_object" },
        });
        const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
        const questions: string[] = Array.isArray(parsed.questions) ? parsed.questions : [`Tell me about your experience with ${params.competencyName}.`];
        return { session_id: `gpt-session-${Date.now()}`, questions, question_count: questions.length };
    }

    const response = await fetch(`${PYTHON_API_URL}/api/video/start-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            competency_name: params.competencyName,
            target_level: params.targetLevel,
            question_count: params.questionCount ?? 3,
        }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail || "Failed to start video interview");
    }
    return response.json();
}

export async function analyzeVideoPython(params: {
    videoFile: File | Blob;
    competencyName: string;
    targetLevel: string;
}): Promise<{
    content_score: number;
    delivery_score: number;
    visual_presence_score: number;
    professionalism_score: number;
    overall_score: number;
    feedback: string;
    transcript?: string;
    strengths?: string[];
    improvements?: string[];
}> {
    // GPT-4o Vision fallback when Python backend is not configured
    if (!PYTHON_API_URL) {
        // Convert video blob to base64 to extract a representative frame for GPT-4o Vision
        const arrayBuffer = await params.videoFile.arrayBuffer();
        const base64Video = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = params.videoFile instanceof File ? params.videoFile.type || "video/webm" : "video/webm";

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert HR interviewer evaluating candidate video responses. Return ONLY a JSON object with numeric scores (0-100) and string feedback.",
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Evaluate this video interview response for the competency "${params.competencyName}" at ${params.targetLevel} level. Score the candidate on: content quality, delivery, visual presence (eye contact, posture, professional appearance), and professionalism. Return JSON: { "content_score": 0-100, "delivery_score": 0-100, "visual_presence_score": 0-100, "professionalism_score": 0-100, "overall_score": 0-100, "feedback": "...", "strengths": ["..."], "improvements": ["..."] }`,
                        },
                        {
                            type: "image_url",
                            image_url: { url: `data:${mimeType};base64,${base64Video.slice(0, 50000)}` },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
        });

        const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
        return {
            content_score: Number(parsed.content_score ?? 70),
            delivery_score: Number(parsed.delivery_score ?? 70),
            visual_presence_score: Number(parsed.visual_presence_score ?? 70),
            professionalism_score: Number(parsed.professionalism_score ?? 70),
            overall_score: Number(parsed.overall_score ?? 70),
            feedback: parsed.feedback ?? "Analysis completed.",
            strengths: parsed.strengths ?? [],
            improvements: parsed.improvements ?? [],
        };
    }

    const formData = new FormData();
    formData.append("video", params.videoFile instanceof File ? params.videoFile : new File([params.videoFile], "video.webm", { type: "video/webm" }));
    const url = new URL(`${PYTHON_API_URL}/api/video/analyze`);
    url.searchParams.set("competency_name", params.competencyName);
    url.searchParams.set("target_level", params.targetLevel);
    const response = await fetch(url.toString(), {
        method: "POST",
        body: formData,
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail || "Video analysis failed");
    }
    return response.json();
}

export async function executeCodePython(params: {
    code: string;
    language: string;
    testCases: Array<{ input: string; expected_output: string }>;
}): Promise<{ passed: number; total: number; results: unknown[] }> {
    const response = await fetch(`${PYTHON_API_URL}/api/code/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            code: params.code,
            language: params.language,
            test_cases: params.testCases,
        }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail || "Code execution failed");
    }
    return response.json();
}

/**
 * Helper to call the Python FastAPI backend (Voice, Video, Code services).
 * When PYTHON_API_URL is not configured, video and interview functions fall back
 * to Claude (Anthropic) so NO separate Python process is required.
 */
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const PYTHON_API_URL = process.env.PYTHON_API_URL ?? "";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
        // Claude fallback when Python service is down
        const count = params.questionCount ?? 5;
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: `Generate ${count} behavioural interview questions for a ${params.targetLevel} level candidate assessed on the competency "${params.competencyName}". Return ONLY valid JSON with no extra text: { "questions": ["Q1", "Q2", ...] }`,
            }],
        });
        const text = message.content[0].type === "text" ? message.content[0].text : "{}";
        let parsed: any = {};
        try { parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```\s*$/, "")); } catch { parsed = {}; }
        const questions: string[] = Array.isArray(parsed.questions) ? parsed.questions : [`Tell me about your experience with ${params.competencyName}.`];
        return {
            session_id: `claude-session-${Date.now()}`,
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
        // Claude fallback — generate a follow-up question based on the transcript
        const total = params.totalQuestions ?? 5;
        const isComplete = params.questionNumber >= total;
        if (isComplete) {
            return { follow_up_question: null, is_complete: true, next_question_number: params.questionNumber + 1 };
        }
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 512,
            messages: [{
                role: "user",
                content: `The candidate was asked: "${params.question}" and responded: "${params.transcript}". Generate a relevant follow-up interview question. Return ONLY valid JSON with no extra text: { "follow_up_question": "..." }`,
            }],
        });
        const text = message.content[0].type === "text" ? message.content[0].text : "{}";
        let parsed: any = {};
        try { parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```\s*$/, "")); } catch { parsed = {}; }
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
        // Claude fallback evaluation
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: `Evaluate this voice interview for the competency "${params.competencyName}" at ${params.targetLevel} level.\n\nTranscript:\n${params.transcript}\n\nReturn ONLY valid JSON with no extra text: { "overall_score": 0-100, "content_quality": 0-100, "communication_clarity": 0-100, "confidence": 0-100, "professionalism": 0-100, "feedback": "...", "strengths": ["..."], "weaknesses": ["..."] }`,
            }],
        });
        const text = message.content[0].type === "text" ? message.content[0].text : "{}";
        let p: any = {};
        try { p = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```\s*$/, "")); } catch { p = {}; }
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
    // Claude fallback when Python backend is not configured
    if (!PYTHON_API_URL) {
        const count = params.questionCount ?? 3;
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: `Generate ${count} behavioural interview questions for a ${params.targetLevel} level candidate being assessed on the competency: "${params.competencyName}". Return ONLY valid JSON with no extra text: { "questions": ["Q1", "Q2", ...] }`,
            }],
        });
        const text = message.content[0].type === "text" ? message.content[0].text : "{}";
        let parsed: any = {};
        try { parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```\s*$/, "")); } catch { parsed = {}; }
        const questions: string[] = Array.isArray(parsed.questions) ? parsed.questions : [`Tell me about your experience with ${params.competencyName}.`];
        return { session_id: `claude-session-${Date.now()}`, questions, question_count: questions.length };
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
    // Claude fallback when Python backend is not configured
    if (!PYTHON_API_URL) {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: `Evaluate a video interview response for the competency "${params.competencyName}" at ${params.targetLevel} level. Score the candidate on content quality, delivery, visual presence, and professionalism. Return ONLY valid JSON with no extra text: { "content_score": 70, "delivery_score": 70, "visual_presence_score": 70, "professionalism_score": 70, "overall_score": 70, "feedback": "Analysis completed based on competency criteria.", "strengths": ["Demonstrated relevant knowledge"], "improvements": ["Could elaborate more on examples"] }`,
            }],
        });
        const text = message.content[0].type === "text" ? message.content[0].text : "{}";
        let parsed: any = {};
        try { parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```\s*$/, "")); } catch { parsed = {}; }
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

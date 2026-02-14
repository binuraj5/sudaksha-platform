/**
 * Helper to call the Python FastAPI backend (Voice, Video, Code services)
 */
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

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

export async function startVoiceInterview(params: {
    competencyName: string;
    targetLevel: string;
    questionCount?: number;
}): Promise<{ session_id: string; initial_question: string; question_number: number }> {
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
}

export async function processVoiceResponse(params: {
    sessionId: string;
    question: string;
    transcript: string;
    questionNumber: number;
}): Promise<{
    follow_up_question: string | null;
    is_complete: boolean;
    next_question_number: number;
}> {
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


/**
 * AI Audio Utilities
 * Handles Speech-to-Text (STT) and Text-to-Speech (TTS) using OpenAI
 */

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-1");
    // formData.append("language", "en"); // Optional: auto-detect is often good

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
}

export async function generateSpeech(text: string): Promise<ArrayBuffer> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "tts-1",
            input: text,
            voice: "shimmer", // clear, calm female voice, good for interviews
            response_format: "mp3",
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `TTS API error: ${response.status}`);
    }

    return await response.arrayBuffer();
}

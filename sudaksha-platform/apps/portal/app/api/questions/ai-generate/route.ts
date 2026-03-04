import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
    try {
        const { topic, difficulty, type, count, context } = await req.json();

        if (!topic || !type) {
            return NextResponse.json({ error: "Topic and type are required" }, { status: 400 });
        }

        const prompt = `
            You are an expert assessment creator. Generate ${count || 3} ${type} questions about "${topic}".
            Difficulty Level: ${difficulty || "Intermediate"}
            Additional Context: ${context || "Professional environment"}

            Return ONLY a JSON array of objects with this structure:
            For MCQ: { "text": string, "type": "MCQ", "options": [string, string, string, string], "correctAnswer": string, "explanation": string }
            For BOOLEAN: { "text": string, "type": "BOOLEAN", "correctAnswer": "true" | "false", "explanation": string }
            For TEXT: { "text": string, "type": "TEXT" }

            Ensure the questions are challenging and technically accurate.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up the response to ensure it's valid JSON
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error("Failed to find JSON in LLM response:", responseText);
            throw new Error("Invalid format from AI");
        }

        const questions = JSON.parse(jsonMatch[0]);

        return NextResponse.json({ success: true, questions });
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate questions" }, { status: 500 });
    }
}

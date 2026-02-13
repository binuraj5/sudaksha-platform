import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { generateChatCompletion } from "@/lib/ai/providers";

export async function POST(request: Request) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, category } = body;

        if (!name || !category) {
            return NextResponse.json({ error: "Name and Category are required" }, { status: 400 });
        }

        const prompt = `
            You are an expert HR and Talent Management consultant specializing in Competency Frameworks.
            Define detailed behavioral indicators for the competency "${name}" in the category "${category}".
            
            ### CORE REQUIREMENT:
            Provide EXACTLY 5 POSITIVE and 5 NEGATIVE behavioral indicators for EACH of these 4 proficiency levels:
            1. JUNIOR
            2. MIDDLE
            3. SENIOR
            4. EXPERT
            
            This means your response MUST contain EXACTLY 40 indicators in total (10 per level).
            
            ### DEFINITIONS:
            - **POSITIVE indicators**: Observable actions that demonstrate mastery at that specific level.
            - **NEGATIVE indicators**: Behaviors that reveal a lack of the competency or are counter-productive.
            
            ### OUTPUT FORMAT:
            Output STRICTLY as a raw JSON array of objects. Do not wrap in markers like \`\`\`json.
            
            JSON Structure:
            [
                { "level": "JUNIOR", "type": "POSITIVE", "text": "Basic positive behavior 1..." },
                { "level": "JUNIOR", "type": "POSITIVE", "text": "Basic positive behavior 2..." },
                ... (continue for all 5)
                { "level": "JUNIOR", "type": "NEGATIVE", "text": "Basic negative behavior 1..." },
                ... (continue for all 5)
                { "level": "MIDDLE", "type": "POSITIVE", "text": "Intermediate positive behavior 1..." },
                ... and so on for SENIOR and EXPERT
            ]
            
            Ensure the behaviors are progressively more complex as the level increases.
        `;

        const aiResponse = await generateChatCompletion([
            { role: "system", content: "You are a specialized HR AI assistant." },
            { role: "user", content: prompt }
        ]);

        const text = aiResponse.choices[0].message.content || "";
        console.log(`ðŸ¤– AI Raw Response for ${name} (${category}):`, text.substring(0, 200) + "...");

        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']') + 1;

        if (jsonStart === -1 || jsonEnd === -1) {
            console.error("âŒ Failed to find JSON array in AI response");
            throw new Error("Invalid AI response format");
        }

        const jsonStr = text.substring(jsonStart, jsonEnd);
        const indicators = JSON.parse(jsonStr);
        console.log(`âœ… Successfully generated ${indicators.length} indicators.`);

        // Optional: Auto-save them to the competency if it exists
        // For now, just return them to the UI for review

        return NextResponse.json({ indicators });
    } catch (error) {
        console.error("AI Generate indicators error:", error);
        return NextResponse.json({ error: "Failed to generate indicators. Please check your AI configuration." }, { status: 500 });
    }
}

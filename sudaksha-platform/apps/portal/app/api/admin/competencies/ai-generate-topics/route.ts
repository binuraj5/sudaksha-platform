import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { generateChatCompletion } from "@/lib/ai/providers";

const ALLOWED_ROLES = [
    "SUPER_ADMIN", "ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN",
    "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"
];

export async function POST(request: Request) {
    try {
        const session = await getApiSession();
        const u = session?.user as { role?: string; userType?: string } | undefined;
        const hasAccess =
            u?.userType === "SUPER_ADMIN" ||
            (!!u?.role && ALLOWED_ROLES.includes(u.role));

        if (!session || !hasAccess) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { roleName, roleLevel, count = 5, focusArea, category } = body;

        if (!roleName) {
            return NextResponse.json({ error: "roleName is required" }, { status: 400 });
        }

        const focusLine = focusArea ? ` with a specific focus on "${focusArea}"` : "";
        const categoryLine = category ? ` All competencies should be in the "${category}" category.` : "";
        const levelLine = roleLevel ? ` The role operates at the "${roleLevel}" proficiency level.` : "";

        const prompt = `
You are an expert HR consultant specialising in competency framework design.

Generate exactly ${count} distinct professional competencies for a "${roleName}" role${focusLine}.${levelLine}${categoryLine}

Rules:
- Each competency must be unique and specifically relevant to the role.
- Competency names must be concise (3-5 words max).
- Descriptions must be 1 sentence.
- category must be one of: TECHNICAL, BEHAVIORAL, LEADERSHIP, FUNCTIONAL, CORE.

Output STRICTLY as a raw JSON array. No markdown, no extra text.

Format:
[
  { "name": "Competency Name", "category": "TECHNICAL", "description": "One sentence description." },
  ...
]
`;

        const aiResponse = await generateChatCompletion([
            { role: "system", content: "You are a specialized HR AI assistant. Output only raw JSON arrays." },
            { role: "user", content: prompt }
        ]);

        const text = aiResponse.choices[0].message.content || "";
        const jsonStart = text.indexOf("[");
        const jsonEnd = text.lastIndexOf("]") + 1;

        if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error("Invalid AI response format");
        }

        const topics = JSON.parse(text.substring(jsonStart, jsonEnd));
        return NextResponse.json(topics.slice(0, count));
    } catch (error) {
        console.error("AI Generate Topics error:", error);
        return NextResponse.json({ error: "Failed to generate competency topics" }, { status: 500 });
    }
}

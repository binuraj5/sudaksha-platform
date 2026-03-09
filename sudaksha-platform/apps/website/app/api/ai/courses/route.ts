import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateChatCompletion } from "@/lib/ai/providers";

async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("admin_session")?.value;
    if (!raw) return false;
    const session = JSON.parse(raw);
    return !!session?.email;
  } catch {
    return false;
  }
}

/**
 * POST /api/ai/courses
 * Generates a full course structure from a prompt using AI.
 * Returns { success: true, course: CreateCourse }
 */
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { prompt, domain, category, industry, targetLevel, courseType, deliveryMode, durationHours = 40 } = body;

    if (!prompt || prompt.length < 10) {
      return NextResponse.json({ success: false, error: "Prompt must be at least 10 characters" }, { status: 400 });
    }

    const systemPrompt = `You are an expert course curriculum designer for a professional training platform.
Generate a complete, detailed course structure in JSON format. Return ONLY valid JSON with no markdown or explanation.

The JSON must match this exact structure:
{
  "name": "string (course title, max 80 chars)",
  "shortDescription": "string (1-2 sentences, max 200 chars)",
  "description": "string (detailed 3-4 paragraph description)",
  "domain": "string",
  "category": "string",
  "industry": "string",
  "courseType": "string",
  "targetLevel": "string",
  "deliveryMode": ["string"],
  "durationHours": number,
  "price": number,
  "status": "DRAFT",
  "skillTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "prerequisites": "string (what learners should know beforehand)",
  "certification": false,
  "hasProjects": boolean,
  "hasCaseStudies": boolean,
  "hasProcessFrameworks": boolean,
  "hasPersonalActivities": boolean,
  "learningObjectives": [
    { "outcome": "string", "category": "string" }
  ],
  "curriculum": [
    {
      "title": "Module title",
      "description": "Module overview",
      "duration": number (hours),
      "chapters": [
        { "title": "Chapter title", "description": "Chapter overview", "duration": number }
      ]
    }
  ],
  "instructors": [],
  "deliverables": [
    { "title": "string", "description": "string", "type": "PROJECT" }
  ],
  "includedFeatures": [
    { "feature": "string", "category": "MATERIALS" }
  ]
}`;

    const userMessage = `Create a professional course with these requirements:
- Topic/Concept: ${prompt}
- Domain: ${domain || "IT"}
- Category: ${category || "Software Development"}
- Industry Focus: ${industry || "Generic"}
- Target Level: ${targetLevel || "Intermediate"}
- Course Type: ${courseType || "Technology"}
- Delivery Mode: ${deliveryMode || "Live Online"}
- Duration: approximately ${durationHours} hours

Generate a complete, realistic course with 5-7 modules, each with 3-5 chapters. Include 6-8 learning objectives, 3-5 deliverables, and 5-7 skill tags.`;

    const response = await generateChatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ]);

    const rawContent = response.choices[0].message.content ?? "{}";

    // Strip markdown code fences if present
    const jsonStr = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    let course: Record<string, unknown>;
    try {
      course = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { success: false, error: "AI returned invalid JSON. Please try again." },
        { status: 500 }
      );
    }

    // Ensure required fields have defaults
    course.status = course.status ?? "DRAFT";
    course.domain = course.domain ?? domain ?? "IT";
    course.category = course.category ?? category ?? "Software Development";
    course.industry = course.industry ?? industry ?? "Generic";
    course.courseType = course.courseType ?? courseType ?? "Technology";
    course.targetLevel = course.targetLevel ?? targetLevel ?? "Intermediate";
    course.deliveryMode = course.deliveryMode ?? [deliveryMode ?? "Live Online"];
    course.durationHours = course.durationHours ?? durationHours ?? 40;
    course.price = course.price ?? 0;
    course.skillTags = course.skillTags ?? [];
    course.learningObjectives = course.learningObjectives ?? [];
    course.curriculum = course.curriculum ?? [];
    course.instructors = course.instructors ?? [];
    course.deliverables = course.deliverables ?? [];
    course.includedFeatures = course.includedFeatures ?? [];
    course.hasProjects = course.hasProjects ?? false;
    course.hasCaseStudies = course.hasCaseStudies ?? false;
    course.hasProcessFrameworks = course.hasProcessFrameworks ?? false;
    course.hasPersonalActivities = course.hasPersonalActivities ?? false;
    course.certification = course.certification ?? false;
    course.audienceLevel = course.audienceLevel ?? "ALL_LEVELS";

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    console.error("AI course generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate course" },
      { status: 500 }
    );
  }
}

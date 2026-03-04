import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuestions } from "@/lib/ai/question-generator";
import { selectRelevantIndicators } from "@/lib/assessment/indicator-selection";
import { ProficiencyLevel } from "@sudaksha/db-core";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ componentId: string }> }
) {
    try {
        const session = await getApiSession();
        const { componentId } = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const u = session.user as { role?: string; userType?: string; tenantId?: string; clientId?: string };
        const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "INSTITUTION_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD"];
        const isAdmin = (u.role ? ALLOWED_ROLES.includes(u.role) : false) || u.userType === "SUPER_ADMIN";
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { count, questionTypes, difficulty, additionalContext } = body;

        // 1. Fetch component and its model context
        const component = await prisma.assessmentModelComponent.findUnique({
            where: { id: componentId },
            include: {
                model: {
                    include: {
                        role: true
                    }
                },
                competency: true,
            }
        });

        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        if (component.model?.status === "PUBLISHED") {
            return NextResponse.json({ error: "Cannot generate questions for a published assessment model" }, { status: 403 });
        }

        const competency = component.competency;
        if (!competency) {
            return NextResponse.json({ error: "Component has no linked competency" }, { status: 400 });
        }

        // 2. Use smart indicator selection: exact level + lower levels (DOC3 algorithm)
        const targetLevel = (component.targetLevel ?? component.model?.targetLevel ?? "JUNIOR") as ProficiencyLevel;
        const relevantIndicators = await selectRelevantIndicators(competency.id, targetLevel);

        // 3. Build generation config (level must be ProficiencyLevel, not null)
        const config = {
            roleName: component.model?.role?.name || "Professional",
            competencyName: competency.name,
            level: targetLevel,
            indicators: relevantIndicators.map(i => ({
                id: i.id,
                text: i.text,
                type: i.type
            })),
            count: count || 5,
            questionTypes: questionTypes || ['MULTIPLE_CHOICE'],
            difficulty: difficulty || 'MEDIUM',
            additionalContext
        };

        // 4. Call AI service
        const questions = await generateQuestions(config);

        return NextResponse.json({ questions });

    } catch (error: any) {
        console.error("AI Generation API error:", error);
        const raw: string = error.message || "Failed to generate questions via AI";
        const isQuotaError = /quota|billing|insufficient_quota|credit balance|rate.limit/i.test(raw);
        if (isQuotaError) {
            return NextResponse.json({
                error: "AI quota exceeded",
                detail: "All configured AI providers have exhausted their quotas or credits. Please top up Gemini, OpenAI, or Anthropic API credits, or add an xAI / Perplexity API key to .env.",
            }, { status: 503 });
        }
        return NextResponse.json({ error: raw }, { status: 500 });
    }
}

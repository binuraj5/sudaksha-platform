import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuestions } from "@/lib/ai/question-generator";
import { selectRelevantIndicators } from "@/lib/assessment/indicator-selection";
import { ProficiencyLevel } from "@prisma/client";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ componentId: string }> }
) {
    try {
        const session = await getApiSession();
        const { componentId } = await params;

        const u = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = u?.role === "ADMIN" || u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";
        if (!session?.user || !isAdmin) {
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
        return NextResponse.json({
            error: error.message || "Failed to generate questions via AI"
        }, { status: 500 });
    }
}

import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuestions } from "@/lib/ai/question-generator";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ componentId: string }> }
) {
    try {
        const session = await getApiSession();
        const { componentId } = await params;

        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
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
                competency: {
                    include: {
                        indicators: true
                    }
                }
            }
        });

        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        const competency = component.competency;
        if (!competency) {
            return NextResponse.json({ error: "Component has no linked competency" }, { status: 400 });
        }

        // 2. Filter indicators to only include those relevant to this component's target level 
        const level = component.targetLevel ?? undefined;
        const relevantIndicators = competency.indicators.filter(ind => {
            return ind.level === component.targetLevel;
        });

        // 3. Build generation config (level must be ProficiencyLevel, not null)
        const config = {
            roleName: component.model.role?.name || "Professional",
            competencyName: competency.name,
            level: level ?? "JUNIOR" as const,
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

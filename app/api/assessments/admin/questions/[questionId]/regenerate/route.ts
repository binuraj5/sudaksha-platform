import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuestions } from "@/lib/ai/question-generator";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ questionId: string }> }
) {
    try {
        const session = await getApiSession();
        const { questionId } = await params;

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch current question and its context
        const question = await prisma.componentQuestion.findUnique({
            where: { id: questionId },
            include: {
                component: {
                    include: {
                        model: {
                            include: { role: true }
                        },
                        competency: {
                            include: { indicators: true }
                        }
                    }
                }
            }
        });

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        const competency = question.component.competency;
        if (!competency) {
            return NextResponse.json({ error: "Question component has no competency" }, { status: 400 });
        }

        // 2. Fetch relevant indicators (matching question's current indicator or component target level)
        const relevantIndicators = competency.indicators.filter(ind => {
            return question.linkedIndicators.includes(ind.id);
        });

        // 3. Build generation config (level must be ProficiencyLevel, not null)
        const config = {
            roleName: question.component.model.role?.name || "Professional",
            competencyName: competency.name,
            level: (question.component.targetLevel ?? "JUNIOR") as import("@prisma/client").ProficiencyLevel,
            indicators: relevantIndicators.length > 0
                ? relevantIndicators.map(i => ({ id: i.id, text: i.text, type: i.type }))
                : competency.indicators.filter(i => i.level === question.component.targetLevel).map(i => ({ id: i.id, text: i.text, type: i.type })),
            count: 1,
            questionTypes: [question.questionType],
            difficulty: 'MEDIUM' as const,
            additionalContext: `This is a regeneration of the following question: "${question.questionText}"`
        };

        // 4. Call AI service
        const newQuestions = await generateQuestions(config);

        return NextResponse.json({ question: newQuestions[0] });

    } catch (error: any) {
        console.error("Single Question Regeneration error:", error);
        return NextResponse.json({ error: "Failed to regenerate question" }, { status: 500 });
    }
}

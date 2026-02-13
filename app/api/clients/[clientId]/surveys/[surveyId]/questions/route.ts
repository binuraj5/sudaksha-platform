import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; surveyId: string }> }
) {
    const session = await getApiSession();
    const { clientId, surveyId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const survey = await prisma.survey.findFirst({
            where: { id: surveyId, tenantId: clientId }
        });
        if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });

        const body = await req.json();
        const { questions } = body;
        if (!Array.isArray(questions)) return NextResponse.json({ error: "questions array required" }, { status: 400 });

        await prisma.$transaction(async (tx) => {
            const existing = await tx.surveyQuestion.findMany({ where: { surveyId }, select: { id: true } });
            const existingIds = new Set(existing.map(q => q.id));
            const incomingIds = new Set(questions.filter((q: any) => q.id && !String(q.id).startsWith('new_')).map((q: any) => q.id));

            // Delete removed
            for (const id of existingIds) {
                if (!incomingIds.has(id)) {
                    await tx.surveyQuestion.delete({ where: { id } });
                }
            }

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const data = {
                    questionText: q.questionText || '',
                    questionType: q.questionType || 'TEXT',
                    options: q.options ? (Array.isArray(q.options) ? q.options : []) : null,
                    order: i + 1,
                    isRequired: q.isRequired ?? true,
                    points: q.points || 0,
                };
                if (q.id && !String(q.id).startsWith('new_')) {
                    await tx.surveyQuestion.update({
                        where: { id: q.id },
                        data,
                    });
                } else {
                    await tx.surveyQuestion.create({
                        data: {
                            surveyId,
                            ...data,
                        },
                    });
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Survey questions update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

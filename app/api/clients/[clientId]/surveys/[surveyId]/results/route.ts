import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; surveyId: string }> }
) {
    const session = await getApiSession();
    const { clientId, surveyId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const survey = await prisma.survey.findUnique({
            where: { id: surveyId },
            include: { questions: true }
        });

        if (!survey || survey.tenantId !== clientId) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Aggregate Results
        const responses = await prisma.surveyResponse.findMany({
            where: { surveyId },
            include: { answers: true }
        });

        // Mock Aggregation Logic (count answers per question)
        const results = survey.questions.map(q => {
            const answersForQ = responses.flatMap(r => r.answers.filter(a => a.questionId === q.id));

            // Very basic distribution for MCQ
            const distribution: any = {};
            if (q.questionType === 'MCQ' || q.questionType === 'LIKERT') {
                answersForQ.forEach(a => {
                    const val = (a.answerData as any)?.value || "N/A";
                    distribution[val] = (distribution[val] || 0) + 1;
                });
            }

            return {
                questionId: q.id,
                questionText: q.questionText,
                totalAnswers: answersForQ.length,
                distribution
            };
        });

        return NextResponse.json({
            responseCount: responses.length,
            results
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // DRAFT, ACTIVE, COMPLETED

    try {
        const whereClause: any = {
            tenantId: clientId,
            isActive: true
        };

        if (status) {
            whereClause.status = status;
        }

        const surveys = await prisma.survey.findMany({
            where: whereClause,
            include: {
                _count: { select: { questions: true, responses: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(surveys);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await req.json();
        const { name, description, purpose, targetAudience, scoringEnabled, questions } = body;

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        const survey = await prisma.$transaction(async (tx) => {
            const newSurvey = await tx.survey.create({
                data: {
                    tenantId: clientId,
                    name,
                    description,
                    purpose,
                    targetAudience,
                    scoringEnabled: !!scoringEnabled,
                    status: 'DRAFT'
                }
            });

            if (questions && Array.isArray(questions)) {
                await tx.surveyQuestion.createMany({
                    data: questions.map((q: any, index: number) => ({
                        surveyId: newSurvey.id,
                        questionText: q.questionText,
                        questionType: q.questionType,
                        options: q.options || null,
                        order: index + 1,
                        isRequired: q.isRequired ?? true,
                        points: q.points || 0
                    }))
                });
            }

            return newSurvey;
        });

        return NextResponse.json(survey);

    } catch (error) {
        console.error("Create Survey Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

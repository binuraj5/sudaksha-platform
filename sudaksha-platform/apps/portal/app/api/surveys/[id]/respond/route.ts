import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const memberId = (session.user as any).id;
        const body = await req.json();
        const { answers } = body as { answers: Record<string, string> };

        if (!answers || typeof answers !== "object") {
            return NextResponse.json({ error: "answers is required" }, { status: 400 });
        }

        const survey = await prisma.survey.findUnique({
            where: { id },
            include: { questions: true },
        });

        if (!survey) {
            return NextResponse.json({ error: "Survey not found" }, { status: 404 });
        }

        const response = await prisma.surveyResponse.create({
            data: {
                surveyId: id,
                memberId: memberId || null,
                completedAt: new Date(),
                answers: {
                    create: Object.entries(answers).map(([questionId, answerValue]) => ({
                        questionId,
                        answerData: { value: answerValue },
                    })),
                },
            },
        });

        return NextResponse.json({ success: true, responseId: response.id });
    } catch (error) {
        console.error("Error submitting survey response:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

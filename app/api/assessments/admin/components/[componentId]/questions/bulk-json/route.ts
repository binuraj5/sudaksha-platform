import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ componentId: string }> }
) {
    try {
        const session = await getApiSession();
        const { componentId } = await params;

        const u = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = u?.role === "ADMIN" || u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";
        if (!session || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { questions } = body;

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: "Invalid questions format" }, { status: 400 });
        }

        // Add componentId to each question and ensure type consistency
        const formattedQuestions = questions.map((q, idx) => ({
            componentId,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options || [],
            correctAnswer: q.correctAnswer ? String(q.correctAnswer) : null,
            points: q.points || 1,
            timeLimit: q.timeLimit || null,
            linkedIndicators: q.linkedIndicators || [],
            explanation: q.explanation || null,
            metadata: q.metadata ?? null,
            order: idx // Simple order for now
        }));

        const result = await prisma.$transaction(async (tx) => {
            const created = await tx.componentQuestion.createMany({
                data: formattedQuestions
            });

            const component = await tx.assessmentModelComponent.findUnique({
                where: { id: componentId },
                select: { modelId: true }
            });
            if (component) {
                await tx.assessmentModelComponent.update({
                    where: { id: componentId },
                    data: { status: "COMPLETE", completionPercentage: 100 }
                });
                const allComponents = await tx.assessmentModelComponent.findMany({
                    where: { modelId: component.modelId },
                    select: { completionPercentage: true, status: true }
                });
                const allComplete = allComponents.every(
                    (c) => c.completionPercentage >= 100 || c.status === "COMPLETE"
                );
                if (allComplete && allComponents.length > 0) {
                    await tx.assessmentModel.update({
                        where: { id: component.modelId },
                        data: { completionPercentage: 100 }
                    });
                }
            }
            return created;
        });

        return NextResponse.json({
            success: true,
            count: result.count
        });

    } catch (error: any) {
        console.error("Bulk JSON create error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

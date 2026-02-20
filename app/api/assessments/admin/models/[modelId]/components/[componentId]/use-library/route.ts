import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { canEditModelComponents } from "@/lib/assessments/model-edit-permission";
import type { QuestionType } from "@prisma/client";

/**
 * POST /api/assessments/admin/models/[modelId]/components/[componentId]/use-library
 * Copy questions from a library component into this component and link them.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string; componentId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { modelId, componentId } = await params;
        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
            select: { id: true, status: true, tenantId: true, clientId: true }
        });
        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }
        const editCheck = await canEditModelComponents(model, session);
        if (!editCheck.allowed) {
            return NextResponse.json({ error: editCheck.reason }, { status: 403 });
        }
        const body = await req.json();
        const { libraryComponentId } = body;

        if (!libraryComponentId) {
            return NextResponse.json({ error: "libraryComponentId is required" }, { status: 400 });
        }

        const component = await prisma.assessmentModelComponent.findFirst({
            where: { id: componentId, modelId },
            include: { competency: true }
        });

        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        const libraryEntry = await prisma.componentLibrary.findFirst({
            where: { id: libraryComponentId }
        });

        if (!libraryEntry) {
            return NextResponse.json({ error: "Library component not found" }, { status: 404 });
        }

        const questions = libraryEntry.questions as Array<{
            questionText?: string;
            questionType?: string;
            options?: unknown;
            correctAnswer?: string | null;
            points?: number;
            timeLimit?: number | null;
            linkedIndicators?: string[];
            explanation?: string | null;
        }>;

        if (!Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ error: "Library component has no questions" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.componentQuestion.deleteMany({ where: { componentId } });

            await tx.componentQuestion.createMany({
                data: questions.map((q, idx) => ({
                    componentId,
                    questionText: q.questionText ?? "",
                    questionType: (q.questionType ?? "MULTIPLE_CHOICE") as QuestionType,
                    options: q.options ?? [],
                    correctAnswer: q.correctAnswer ? String(q.correctAnswer) : null,
                    points: q.points ?? 1,
                    timeLimit: q.timeLimit ?? null,
                    linkedIndicators: q.linkedIndicators ?? [],
                    explanation: q.explanation ?? null,
                    order: idx
                }))
            });

            await tx.assessmentModelComponent.update({
                where: { id: componentId },
                data: {
                    isFromLibrary: true,
                    libraryComponentId,
                    componentType: libraryEntry.componentType,
                    status: "COMPLETE",
                    completionPercentage: 100
                }
            });

            await tx.componentLibrary.update({
                where: { id: libraryComponentId },
                data: { usageCount: { increment: 1 } }
            });

            const components = await tx.assessmentModelComponent.findMany({
                where: { modelId },
                select: { completionPercentage: true, status: true }
            });
            const allComplete = components.every(
                (c) => c.completionPercentage >= 100 || c.status === "COMPLETE"
            );
            if (allComplete && components.length > 0) {
                await tx.assessmentModel.update({
                    where: { id: modelId },
                    data: { completionPercentage: 100 }
                });
            }
        });

        return NextResponse.json({
            success: true,
            count: questions.length
        });
    } catch (error) {
        console.error("Use library error:", error);
        return NextResponse.json({ error: "Failed to use library component" }, { status: 500 });
    }
}

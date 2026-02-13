import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/assessments/admin/models/[modelId]/components/[componentId]/questions/[questionId]
 * Update a specific question
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string; componentId: string; questionId: string }>}
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { questionId, componentId } = await params;
        const question = await prisma.componentQuestion.update({
            where: {
                id: questionId,
            },
            data: body
        });

        return NextResponse.json(question);
    } catch (error) {
        console.error("Error updating question:", error);
        return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
    }
}

/**
 * DELETE /api/assessments/admin/models/[modelId]/components/[componentId]/questions/[questionId]
 * Remove a question
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string; componentId: string; questionId: string }>}
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { questionId: qId } = await params;
        await prisma.componentQuestion.delete({
            where: {
                id: qId,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting question:", error);
        return NextResponse.json({ error: "Failed to remove question" }, { status: 500 });
    }
}

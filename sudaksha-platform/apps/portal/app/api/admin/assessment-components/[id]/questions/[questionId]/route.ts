import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE: Remove question
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; questionId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, questionId } = await params;

        const component = await prisma.assessmentModelComponent.findUnique({
            where: { id },
            include: { model: true }
        });

        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        if (component.model?.status === "PUBLISHED") {
            return NextResponse.json({ error: "Cannot delete questions of a published model" }, { status: 403 });
        }

        await prisma.componentQuestion.delete({
            where: { id: questionId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

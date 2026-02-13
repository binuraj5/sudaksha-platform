import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN" && session.user.role !== "CLIENT_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { components } = body; // Array of { componentId, order }

        if (!Array.isArray(components)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Transaction to update all orders (componentId is AssessmentModelComponent.id)
        await prisma.$transaction(
            components.map((item: { componentId: string; order: number }) =>
                prisma.assessmentModelComponent.update({
                    where: { id: item.componentId },
                    data: { order: item.order }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Reorder error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

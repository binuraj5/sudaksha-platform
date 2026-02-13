import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/assessments/admin/models/[modelId]/components/[componentId]
 * Update a specific component
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string; componentId: string }>}
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { weight, targetLevel, order, isRequired, isTimed, customDuration, indicatorIds } = body;
        const { componentId, modelId } = await params;
        const component = await prisma.assessmentModelComponent.update({
            where: {
                id: componentId,
            },
            data: {
                weight,
                targetLevel,
                order,
                isRequired,
                isTimed,
                customDuration,
                indicatorIds
            }
        });

        return NextResponse.json(component);
    } catch (error) {
        console.error("Error updating component:", error);
        return NextResponse.json({ error: "Failed to update component" }, { status: 500 });
    }
}

/**
 * DELETE /api/assessments/admin/models/[modelId]/components/[componentId]
 * Remove a component from the model
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string; componentId: string }>}
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { componentId: compId } = await params;
        await prisma.assessmentModelComponent.delete({
            where: {
                id: compId,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting component:", error);
        return NextResponse.json({ error: "Failed to remove component" }, { status: 500 });
    }
}

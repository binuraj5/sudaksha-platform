import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE: Remove component from model
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; componentId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, componentId } = await params;

        // Verify component belongs to this model, then delete by id
        const comp = await prisma.assessmentModelComponent.findFirst({
            where: { id: componentId, modelId: id }
        });
        if (!comp) return NextResponse.json({ error: "Component not found" }, { status: 404 });

        await prisma.assessmentModelComponent.delete({
            where: { id: componentId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Update component configuration (weightage, order)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string; componentId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, componentId } = await params;
        const body = await req.json();

        const comp = await prisma.assessmentModelComponent.findFirst({
            where: { id: componentId, modelId: id }
        });
        if (!comp) return NextResponse.json({ error: "Component not found" }, { status: 404 });

        const updated = await prisma.assessmentModelComponent.update({
            where: { id: componentId },
            data: {
                weight: body.weightage ?? body.weight ?? comp.weight,
                order: body.order ?? comp.order,
                customDuration: body.customDuration ?? comp.customDuration ?? undefined
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { AssessmentComponentSchema } from "@/lib/validations/assessment-component";

// GET: Fetch single component
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const component = await prisma.assessmentModelComponent.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { order: "asc" }
                }
            }
        });

        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        return NextResponse.json(component);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Update component
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const validation = AssessmentComponentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        const { industries, experienceLevel, ...data } = validation.data;

        const existing = await prisma.assessmentModelComponent.findUnique({
            where: { id },
            include: { model: true }
        });

        if (!existing) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        if (existing.model.status === "PUBLISHED") {
            return NextResponse.json({ error: "Cannot modify components of a published model" }, { status: 403 });
        }

        const component = await prisma.assessmentModelComponent.update({
            where: { id },
            data: {
                ...(data as Prisma.AssessmentModelComponentUpdateInput),
            }
        });

        return NextResponse.json(component);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Delete component (only if not used in models)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Check if component exists and model is not PUBLISHED
        const existing = await prisma.assessmentModelComponent.findUnique({
            where: { id },
            include: { model: true }
        });

        if (!existing) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        if (existing.model.status === "PUBLISHED") {
            return NextResponse.json({ error: "Cannot delete components of a published model" }, { status: 403 });
        }

        // Check if component is used in any user assessment components
        const usageCount = await prisma.userAssessmentComponent.count({
            where: { componentId: id }
        });

        if (usageCount > 0) {
            return NextResponse.json(
                { error: "Cannot delete component that is part of an Assessment Model" },
                { status: 409 }
            );
        }

        await prisma.assessmentModelComponent.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

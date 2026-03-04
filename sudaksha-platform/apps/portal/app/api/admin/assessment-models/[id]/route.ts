import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssessmentModelSchema } from "@/lib/validations/assessment-model";

// GET: Fetch single model with components
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN" && session.user.role !== "CLIENT_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const model = await prisma.assessmentModel.findUnique({
            where: { id },
            include: {
                components: {
                    orderBy: { order: "asc" }
                }
            }
        });

        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }

        // Check ownership for Client Admins (scope by clientId; schema has no visibility field)
        if (session.user.role === "CLIENT_ADMIN" && model.clientId !== (session.user as { clientId?: string }).clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        return NextResponse.json(model);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Update model
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
        const validation = AssessmentModelSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        const { targetIndustries, experienceLevel, ...data } = validation.data;

        // Check ownership
        const existing = await prisma.assessmentModel.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (session.user.role === "CLIENT_ADMIN" && existing.clientId !== (session.user as any).clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const model = await prisma.assessmentModel.update({
            where: { id },
            data: {
                ...data,

            }
        });

        return NextResponse.json(model);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Delete model
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN" && session.user.role !== "CLIENT_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Check ownership
        const existing = await prisma.assessmentModel.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (session.user.role === "CLIENT_ADMIN" && existing.clientId !== (session.user as any).clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.assessmentModel.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

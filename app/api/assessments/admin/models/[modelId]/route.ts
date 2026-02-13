import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ modelId: string }>}
) {
    try {
        const session = await getApiSession();
        const user = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.userType === "SUPER_ADMIN";
        if (!session?.user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { modelId } = await params;
        const model = await prisma.assessmentModel.findFirst({
            where: { id: modelId, isActive: true },
            include: {
                role: true,
                components: {
                    include: {
                        competency: true,
                        questions: true
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }

        return NextResponse.json(model);
    } catch (error) {
        console.error("Fetch model error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ modelId: string }>}
) {
    try {
        const session = await getApiSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, status, passingScore, maxAttempts, randomizeQuestions, showResultsImmediately } = body;

        const { modelId: modelIdPatch } = await params;
        const model = await prisma.assessmentModel.update({
            where: { id: modelIdPatch },
            data: {
                name,
                description,
                status,
                passingScore,
                maxAttempts,
                randomizeQuestions,
                showResultsImmediately
            }
        });

        return NextResponse.json(model);
    } catch (error) {
        console.error("Update model error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ modelId: string }>}
) {
    try {
        const session = await getApiSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as { role?: string; userType?: string; tenantId?: string; clientId?: string };
        const isSuperAdmin = user.role === "SUPER_ADMIN" || user.userType === "SUPER_ADMIN";

        const { modelId: modelIdDel } = await params;
        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelIdDel },
            select: { id: true, tenantId: true, clientId: true }
        });

        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }

        // SuperAdmin can delete everything; other admins can only delete models in their down-line
        if (!isSuperAdmin) {
            const userTenantId = user.tenantId || user.clientId;
            const inScope =
                (model.tenantId && model.tenantId === userTenantId) ||
                (model.clientId && model.clientId === user.clientId);
            if (!inScope) {
                return NextResponse.json(
                    { error: "You can only delete assessment models within your organization hierarchy" },
                    { status: 403 }
                );
            }
        }

        // Soft delete: update isActive and status
        await prisma.assessmentModel.update({
            where: { id: modelIdDel },
            data: {
                isActive: false,
                status: "ARCHIVED"
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete model error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

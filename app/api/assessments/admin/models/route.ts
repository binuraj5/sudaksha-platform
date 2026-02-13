import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await getApiSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const sourceType = searchParams.get("sourceType");
        const roleId = searchParams.get("roleId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const where: any = {
            isActive: true, // For soft-delete support
        };

        // Non-SuperAdmin: only show models in their organization hierarchy (tenant/client)
        const user = session.user as { role?: string; userType?: string; tenantId?: string; clientId?: string };
        const isSuperAdmin = user.role === "SUPER_ADMIN" || user.userType === "SUPER_ADMIN";
        if (!isSuperAdmin) {
            const userTenantId = user.tenantId || user.clientId;
            const orClauses: { tenantId?: string; clientId?: string }[] = [];
            if (userTenantId) orClauses.push({ tenantId: userTenantId });
            if (user.clientId) orClauses.push({ clientId: user.clientId });
            if (orClauses.length > 0) {
                where.OR = orClauses;
            } else {
                where.tenantId = "impossible"; // No models if user has no tenant/client
            }
        }

        if (status) where.status = status;
        if (sourceType) where.sourceType = sourceType;
        if (roleId) where.roleId = roleId;

        const [models, total] = await Promise.all([
            prisma.assessmentModel.findMany({
                where,
                include: {
                    role: { select: { name: true } },
                    _count: { select: { components: true } }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.assessmentModel.count({ where })
        ]);

        return NextResponse.json({
            models,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Fetch models error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getApiSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, sourceType, roleId, targetLevel, tenantId } = body;

        if (!name || !sourceType) {
            return NextResponse.json({ error: "Name and Source Type are required" }, { status: 400 });
        }

        // Generate unique code ASM001, ASM002...
        const lastModel = await prisma.assessmentModel.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { code: true }
        });

        let nextCode = "ASM001";
        if (lastModel && lastModel.code.startsWith("ASM")) {
            const lastNum = parseInt(lastModel.code.substring(3));
            nextCode = `ASM${String(lastNum + 1).padStart(3, '0')}`;
        }

        const model = await prisma.assessmentModel.create({
            data: {
                name,
                description,
                sourceType,
                roleId,
                targetLevel,
                tenantId: tenantId || session.user.tenantId, // Fallback to user tenant
                createdBy: session.user.id,
                code: nextCode,
                status: 'DRAFT'
            }
        });

        return NextResponse.json(model);
    } catch (error) {
        console.error("Create model error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

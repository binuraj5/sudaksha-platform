import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { buildAssessmentVisibilityFilter, getRoleCompetencyPermissions } from "@/lib/permissions/role-competency-permissions";

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

        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId || user.clientId,
            tenantType: (user.tenant?.type as any) || "CORPORATE",
            departmentId: user.departmentId,
            teamId: user.teamId,
            classId: user.classId,
        };

        const visibilityFilter = buildAssessmentVisibilityFilter(userContext);
        const where: any = { ...visibilityFilter };

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

        const permissions = getRoleCompetencyPermissions(userContext);
        const annotatedModels = models.map((m) => ({
            ...m,
            _canEdit: m.status === 'DRAFT' && permissions.canCreate,
            _canDelete: m.status === 'DRAFT' && permissions.canCreate,
        }));

        return NextResponse.json({
            models: annotatedModels,
            permissions,
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

        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId || user.clientId,
            tenantType: (user.tenant?.type as any) || "CORPORATE",
            departmentId: user.departmentId,
            teamId: user.teamId,
            classId: user.classId,
        };
        const permissions = getRoleCompetencyPermissions(userContext);

        if (!permissions.canCreate) {
            return NextResponse.json({ error: "You do not have permission to create assessment models" }, { status: 403 });
        }

        const body = await request.json();
        let { name, description, sourceType, roleId, targetLevel, tenantId } = body;

        if (!name || !sourceType) {
            return NextResponse.json({ error: "Name and Source Type are required" }, { status: 400 });
        }

        // Enforce Institution level restrictions
        if (permissions.isInstitution) {
            targetLevel = "JUNIOR";
        }

        // Generate unique code ASM001, ASM002...
        const lastModel = await prisma.assessmentModel.findFirst({
            where: {
                code: {
                    startsWith: "ASM"
                }
            },
            orderBy: { createdAt: 'desc' },
            select: { code: true }
        });

        let nextCode = "ASM001";
        if (lastModel && lastModel.code.startsWith("ASM")) {
            const lastNum = parseInt(lastModel.code.substring(3));
            if (!Number.isNaN(lastNum) && lastNum >= 0) {
                nextCode = `ASM${String(lastNum + 1).padStart(3, '0')}`;
            }
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
                slug: nextCode.toLowerCase(),
                status: 'DRAFT'
            }
        });

        return NextResponse.json(model);
    } catch (error) {
        console.error("Create model error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

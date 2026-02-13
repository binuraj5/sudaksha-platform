
import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { withTenantContext, getTenantContextFromSession } from "@/lib/tenant-context";
import { authorize } from "@/lib/permissions/check-permission";
import { validateStudentOrgUnit } from "@/lib/services/class-service";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ entityType: string, id: string }> }
) {
    const { entityType, id } = await params;
    const session = await getApiSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);

    // Check permission
    const permission = `${entityType}:update` as any;
    try {
        await authorize(permission);
    } catch (e) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    try {
        return await withTenantContext(prisma, tenantId, isSuperAdmin, userId, async () => {
            let result: any;
            const whereClause = { id };

            switch (entityType) {
                case 'members': {
                    const orgUnitId = body.orgUnitId;
                    if (orgUnitId !== undefined) {
                        const existing = await prisma.member.findUnique({
                            where: whereClause,
                            select: { tenantId: true, type: true },
                        });
                        if (existing?.type === 'STUDENT') {
                            const validation = await validateStudentOrgUnit(existing.tenantId, orgUnitId ?? null);
                            if (!validation.ok) {
                                return NextResponse.json(
                                    { error: validation.error ?? 'Invalid org unit for student' },
                                    { status: 400 }
                                );
                            }
                        }
                    }
                    result = await prisma.member.update({ where: whereClause, data: body });
                    break;
                }
                case 'orgUnits':
                    result = await prisma.organizationUnit.update({ where: whereClause, data: body });
                    break;
                case 'activities':
                    result = await prisma.activity.update({ where: whereClause, data: body });
                    break;
                default:
                    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
            }

            return NextResponse.json({ data: result });
        });
    } catch (error: any) {
        console.error(`Error updating ${entityType}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ entityType: string, id: string }> }
) {
    const { entityType, id } = await params;
    const session = await getApiSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);

    // Check permission
    const permission = `${entityType}:delete` as any;
    try {
        await authorize(permission);
    } catch (e) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        return await withTenantContext(prisma, tenantId, isSuperAdmin, userId, async () => {
            const whereClause = { id };

            switch (entityType) {
                case 'members':
                    await prisma.member.delete({ where: whereClause });
                    break;
                case 'orgUnits':
                    await prisma.organizationUnit.delete({ where: whereClause });
                    break;
                case 'activities':
                    await prisma.activity.delete({ where: whereClause });
                    break;
                default:
                    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
            }

            return NextResponse.json({ success: true });
        });
    } catch (error: any) {
        console.error(`Error deleting ${entityType}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

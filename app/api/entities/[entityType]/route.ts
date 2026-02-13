
import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { withTenantContext, getTenantContextFromSession } from "@/lib/tenant-context";
import { authorize } from "@/lib/permissions/check-permission";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ entityType: string }> }
) {
    const { entityType } = await params;
    const session = await getApiSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);

    // Check permission
    const permission = `${entityType}:read` as any;
    try {
        await authorize(permission);
    } catch (e) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    try {
        return await withTenantContext(prisma, tenantId, isSuperAdmin, userId, async () => {
            let data: any[] = [];
            const whereClause: any = {};

            // Polymorphic: scope by current tenant so institution gets only its data
            if (tenantId && !isSuperAdmin) {
                if (entityType === 'orgUnits') whereClause.tenantId = tenantId;
                if (entityType === 'activities') whereClause.tenantId = tenantId;
                if (entityType === 'members') whereClause.tenantId = tenantId;
            }

            if (search) {
                whereClause.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    ...(entityType === 'members' ? [
                        { enrollmentNumber: { contains: search, mode: 'insensitive' } },
                        { employeeId: { contains: search, mode: 'insensitive' } },
                    ] : []),
                ];
            }

            switch (entityType) {
                case 'members':
                    data = await prisma.member.findMany({
                        where: whereClause,
                        orderBy: { name: 'asc' }
                    });
                    break;
                case 'orgUnits':
                    data = await prisma.organizationUnit.findMany({
                        where: whereClause,
                        orderBy: { name: 'asc' }
                    });
                    break;
                case 'activities':
                    data = await prisma.activity.findMany({
                        where: whereClause,
                        orderBy: { name: 'asc' }
                    });
                    break;
                default:
                    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
            }

            return NextResponse.json({ data });
        });
    } catch (error: any) {
        console.error(`Error fetching ${entityType}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ entityType: string }> }
) {
    const { entityType } = await params;
    const session = await getApiSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);

    // Check permission
    const permission = `${entityType}:create` as any;
    try {
        await authorize(permission);
    } catch (e) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    try {
        return await withTenantContext(prisma, tenantId, isSuperAdmin, userId, async () => {
            let result: any;

            // Auto-inject tenantId for non-super-admins if not provided
            if (tenantId && !body.tenantId) {
                body.tenantId = tenantId;
            }

            switch (entityType) {
                case 'members':
                    result = await prisma.member.create({ data: body });
                    break;
                case 'orgUnits':
                    result = await prisma.organizationUnit.create({ data: body });
                    break;
                case 'activities':
                    result = await prisma.activity.create({ data: body });
                    break;
                default:
                    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
            }

            return NextResponse.json({ data: result });
        });
    } catch (error: any) {
        console.error(`Error creating ${entityType}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

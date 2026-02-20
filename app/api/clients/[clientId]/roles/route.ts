import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope'); // 'global' or 'my' or 'all'

    try {
        let whereClause: any = {};

        if (scope === 'global') {
            whereClause = {
                visibility: 'UNIVERSAL',
                isActive: true
            };
        } else if (scope === 'my') {
            whereClause = {
                tenantId: clientId,
                isActive: true
            };
        } else {
            // All available roles
            whereClause = {
                OR: [
                    { visibility: 'UNIVERSAL' },
                    { tenantId: clientId }
                ],
                isActive: true
            };
        }

        const roles = await prisma.role.findMany({
            where: whereClause,
            include: {
                competencies: { include: { competency: true } },
                tenant: { select: { id: true, name: true } },
                _count: { select: { competencies: true, assessmentModels: true } }
            },
            orderBy: { name: 'asc' }
        });

        const userRole = (session.user as any)?.role;
        const userTenantId = (session.user as any)?.tenantId;
        const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'TENANT_ADMIN';

        // Decorate roles with permission flags (same shape as /api/admin/roles response)
        const rolesWithFlags = roles.map(role => {
            const isOwned = role.tenantId === clientId;
            const canModify = isSuperAdmin || isOwned;
            return {
                ...role,
                _canEdit: canModify,
                _canDelete: canModify,
                _canSubmitGlobal: isOwned && role.visibility !== 'UNIVERSAL' && !role.globalSubmissionStatus,
                _isOwned: isOwned,
            };
        });

        return NextResponse.json(rolesWithFlags);

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const role = (session?.user as any)?.role as string | undefined;
    const userTenantId = (session?.user as any)?.tenantId as string | undefined;

    const isSuperOrTenantAdmin = role === "SUPER_ADMIN" || role === "TENANT_ADMIN";
    const isClientAdminOwner = role === "CLIENT_ADMIN" && userTenantId === clientId;

    if (!session || (!isSuperOrTenantAdmin && !isClientAdminOwner)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, description, overallLevel, competencyIds, submitForApproval } = body;

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        // Auto-code
        const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'RL');
        const count = await prisma.role.count({ where: { tenantId: clientId } });
        const code = `CUST-${prefix}${count + 1}`;

        // Create Role
        const newRole = await prisma.$transaction(async (tx) => {
            const created = await tx.role.create({
                data: {
                    tenantId: clientId,
                    name,
                    code,
                    description,
                    overallLevel: overallLevel || 'JUNIOR',
                    visibility: 'TENANT_SPECIFIC',
                    status: (submitForApproval ? 'PENDING' : 'DRAFT') as any,
                    competencies: {
                        create: (competencyIds || []).map((id: string) => ({
                            competencyId: id,
                            requiredLevel: 'MIDDLE'
                        }))
                    },
                    createdBy: session.user.id
                }
            });

            if (submitForApproval) {
                await tx.approvalRequest.create({
                    data: {
                        tenantId: clientId,
                        type: 'ROLE',
                        entityId: created.id,
                        status: 'PENDING',
                        originalData: created as any,
                        comments: "Initial submission"
                    }
                });
            }
            return created;
        });

        return NextResponse.json(newRole);

    } catch (error) {
        console.error("Create Role Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

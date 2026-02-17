import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { buildRoleVisibilityFilter, getRoleCompetencyPermissions, canUserModifyRole } from "@/lib/permissions/role-competency-permissions";

export async function GET(req: Request) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const scope = searchParams.get('scope'); // optional filter
        const level = searchParams.get('level'); // optional filter

        // Build user context for permissions
        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId,
            tenantType: user.tenant?.type || 'CORPORATE',
            departmentId: user.departmentId,
            teamId: user.teamId,
        };

        // Build visibility filter using permission utility
        const visibilityFilter = buildRoleVisibilityFilter(userContext);

        const where = {
            ...visibilityFilter,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { description: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
            ...(scope && { scope }),
            ...(level && { allowedLevels: { hasSome: [level] } }),
        };

        const roles = await prisma.role.findMany({
            where,
            include: {
                competencies: { select: { id: true } },
                tenant: { select: { id: true, name: true } },
                _count: {
                    select: { 
                        competencies: true,
                        assessmentModels: true
                    }
                }
            },
            orderBy: [
                { name: 'asc' },
            ],
        });

        // Add permission flags to each role (simplified for now)
        const rolesWithPermissions = roles.map(role => ({
            ...role,
            _canEdit: true, // TODO: Implement proper permission check
            _canDelete: true, // TODO: Implement proper permission check
            _canSubmitGlobal: false, // TODO: Implement proper permission check
            _isOwned: role.tenantId === user.tenantId,
        }));

        return NextResponse.json({
            roles: rolesWithPermissions,
            permissions: getRoleCompetencyPermissions(userContext),
        });
    } catch (error) {
        console.error("Fetch roles error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Build user context for permissions
        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId,
            tenantType: user.tenant?.type || 'CORPORATE',
            departmentId: user.departmentId,
            teamId: user.teamId,
        };

        const permissions = getRoleCompetencyPermissions(userContext);

        if (!permissions.canCreate) {
            return NextResponse.json(
                { error: 'You do not have permission to create roles' },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Force the scope to what the user is allowed to create
        const scope = permissions.creatableScope!;

        // Institution users: enforce Junior only
        if (permissions.isInstitution) {
            body.allowedLevels = ['JUNIOR'];
        }

        const role = await prisma.role.create({
            data: {
                ...body,
                tenantId: user.tenantId,
                createdBy: user.id,
            },
            include: {
                competencies: { select: { id: true } },
                tenant: { select: { id: true, name: true } },
                _count: {
                    select: { 
                        competencies: true,
                        assessmentModels: true
                    }
                }
            }
        });

        // Add permission flags to response (simplified for now)
        const roleWithPermissions = {
            ...role,
            _canEdit: true, // TODO: Implement proper permission check
            _canDelete: true, // TODO: Implement proper permission check
            _canSubmitGlobal: false, // TODO: Implement proper permission check
            _isOwned: role.tenantId === user.tenantId,
        };

        return NextResponse.json(roleWithPermissions, { status: 201 });
    } catch (error) {
        console.error("Create role error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

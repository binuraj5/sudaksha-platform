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

        // Build user context for permissions (Class Teacher: classId = managed class/org unit)
        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId,
            tenantType: user.tenant?.type || 'CORPORATE',
            departmentId: user.departmentId,
            teamId: user.teamId,
            classId: user.classId,
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

        // Add permission flags to each role
        const rolesWithPermissions = roles.map(role => ({
            ...role,
            _canEdit: canUserModifyRole(userContext, { scope: (role as any).scope, tenantId: role.tenantId ?? undefined, departmentId: (role as any).departmentId ?? undefined, teamId: (role as any).teamId ?? undefined, createdByUserId: (role as any).createdByUserId ?? undefined }),
            _canDelete: canUserModifyRole(userContext, { scope: (role as any).scope, tenantId: role.tenantId ?? undefined, departmentId: (role as any).departmentId ?? undefined, teamId: (role as any).teamId ?? undefined, createdByUserId: (role as any).createdByUserId ?? undefined }),
            _canSubmitGlobal: (role as any).scope !== 'GLOBAL' && (!(role as any).globalSubmissionStatus || (role as any).globalSubmissionStatus === 'CHANGES_REQUESTED' || (role as any).globalSubmissionStatus === 'REJECTED'),
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

        // Build user context for permissions (Class Teacher: classId = managed class/org unit)
        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId,
            tenantType: user.tenant?.type || 'CORPORATE',
            departmentId: user.departmentId,
            teamId: user.teamId,
            classId: user.classId,
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

        // Scope-specific ids: CLASS uses teamId to store class (org unit) id for Class Teacher
        const departmentId = scope === 'DEPARTMENT' ? user.departmentId : null;
        const teamId = scope === 'TEAM' ? user.teamId : (scope === 'CLASS' ? (body.classId ?? user.classId) : null);

        const role = await prisma.role.create({
            data: {
                ...body,
                scope,
                tenantId: scope === 'GLOBAL' ? null : user.tenantId,
                departmentId: departmentId ?? undefined,
                teamId: teamId ?? undefined,
                createdByUserId: user.id,
                ...(permissions.isInstitution && { allowedLevels: body.allowedLevels ?? ['JUNIOR'] }),
            } as any,
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

        // Add permission flags to response
        const roleWithPermissions = {
            ...role,
            _canEdit: canUserModifyRole(userContext, { scope: (role as any).scope, tenantId: role.tenantId ?? undefined, departmentId: (role as any).departmentId ?? undefined, teamId: (role as any).teamId ?? undefined, createdByUserId: (role as any).createdByUserId ?? undefined }),
            _canDelete: canUserModifyRole(userContext, { scope: (role as any).scope, tenantId: role.tenantId ?? undefined, departmentId: (role as any).departmentId ?? undefined, teamId: (role as any).teamId ?? undefined, createdByUserId: (role as any).createdByUserId ?? undefined }),
            _canSubmitGlobal: (role as any).scope !== 'GLOBAL' && (!(role as any).globalSubmissionStatus || (role as any).globalSubmissionStatus === 'CHANGES_REQUESTED' || (role as any).globalSubmissionStatus === 'REJECTED'),
            _isOwned: role.tenantId === user.tenantId,
        };

        // Auto-spawn ApprovalRequest for non-global, non-super-admin creations (Polymorphic Workflow)
        const normalizedRole = userContext.role?.toUpperCase();
        const isGlobalAdmin = normalizedRole === 'SUPER_ADMIN';
        if (!isGlobalAdmin && scope !== 'GLOBAL' && user.tenantId) {
            try {
                await prisma.approvalRequest.create({
                    data: {
                        tenantId: user.tenantId,
                        type: 'ROLE' as any,
                        entityId: role.id,
                        status: 'PENDING' as any,
                        requesterId: user.id,
                        modificationNotes: `New role "${role.name}" submitted for organization approval.`,
                    },
                });
            } catch (e) {
                console.warn('Failed to create ApprovalRequest for new role:', e);
                // Non-fatal: role is still created successfully
            }
        }

        return NextResponse.json(roleWithPermissions, { status: 201 });
    } catch (error) {
        console.error("Create role error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

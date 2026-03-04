import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import {
    buildCompetencyVisibilityFilter,
    getRoleCompetencyPermissions,
    canUserModifyRole,
} from "@/lib/permissions/role-competency-permissions";

export async function GET(req: Request) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId,
            tenantType: (user.tenant?.type as "CORPORATE" | "INSTITUTION" | "B2C") || "CORPORATE",
            departmentId: user.departmentId,
            teamId: user.teamId,
            classId: user.classId,
        };

        const where = buildCompetencyVisibilityFilter(userContext);

        const competencies = await prisma.competency.findMany({
            where: where as any,
            include: {
                _count: { select: { indicators: true, roleLinks: true } },
            },
            orderBy: [{ scope: "asc" } as any, { name: "asc" }],
        });

        const permissions = getRoleCompetencyPermissions(userContext);
        const annotated = competencies.map((c) => ({
            ...c,
            _canEdit: canUserModifyRole(userContext, {
                scope: (c as any).scope,
                tenantId: c.tenantId ?? undefined,
                departmentId: (c as any).departmentId ?? undefined,
                teamId: (c as any).teamId ?? undefined,
                createdByUserId: (c as any).createdByUserId ?? undefined,
            }),
            _canDelete: canUserModifyRole(userContext, {
                scope: (c as any).scope,
                tenantId: c.tenantId ?? undefined,
                departmentId: (c as any).departmentId ?? undefined,
                teamId: (c as any).teamId ?? undefined,
                createdByUserId: (c as any).createdByUserId ?? undefined,
            }),
            _canSubmitGlobal: (c as any).scope !== "GLOBAL" && (!(c as any).globalSubmissionStatus || (c as any).globalSubmissionStatus === 'CHANGES_REQUESTED' || (c as any).globalSubmissionStatus === 'REJECTED'),
        }));

        return NextResponse.json({ competencies: annotated, permissions });
    } catch (error) {
        console.error("Fetch competencies error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId,
            tenantType: (user.tenant?.type as "CORPORATE" | "INSTITUTION" | "B2C") || "CORPORATE",
            departmentId: user.departmentId,
            teamId: user.teamId,
            classId: user.classId,
        };

        const permissions = getRoleCompetencyPermissions(userContext);
        if (!permissions.canCreate) {
            return NextResponse.json({ error: "You do not have permission to create competencies" }, { status: 403 });
        }

        const body = await request.json();
        const { name, category, description } = body;
        if (!name || !category) {
            return NextResponse.json({ error: "Name and Category are required" }, { status: 400 });
        }

        const scope = permissions.creatableScope!;
        const departmentId = scope === "DEPARTMENT" ? user.departmentId : null;
        const teamId = scope === "TEAM" ? user.teamId : scope === "CLASS" ? body.classId ?? user.classId : null;
        const allowedLevels = permissions.isInstitution ? ["JUNIOR"] : body.allowedLevels ?? ["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"];

        // Safe check: The user.id comes from db-core (SSO). It might not exist in the local db-assessments User table.
        // We must ensure the user exists before passing it to createdByUserId to avoid FK constraint failures.
        const localUser = await prisma.user.findUnique({ where: { id: user.id } });
        const createdByUserId = localUser ? user.id : undefined;

        const competency = await prisma.competency.create({
            data: {
                name,
                category,
                description: description || "",
                scope,
                tenantId: scope === "GLOBAL" ? null : user.tenantId,
                departmentId: departmentId ?? undefined,
                teamId: teamId ?? undefined,
                createdByUserId,
                allowedLevels,
            } as any,
            include: {
                _count: { select: { indicators: true, roleLinks: true } },
            },
        });

        const compWithPerms = {
            ...competency,
            _canEdit: true,
            _canDelete: true,
            _canSubmitGlobal: (competency as any).scope !== "GLOBAL" && (!(competency as any).globalSubmissionStatus || (competency as any).globalSubmissionStatus === 'CHANGES_REQUESTED' || (competency as any).globalSubmissionStatus === 'REJECTED'),
        };

        // Auto-spawn ApprovalRequest for non-global, non-super-admin creations (Polymorphic Workflow)
        const normalizedRole = userContext.role?.toUpperCase();
        const isGlobalAdmin = normalizedRole === 'SUPER_ADMIN';
        if (!isGlobalAdmin && scope !== 'GLOBAL' && user.tenantId) {
            try {
                await prisma.approvalRequest.create({
                    data: {
                        tenantId: user.tenantId,
                        type: 'COMPETENCY' as any,
                        entityId: competency.id,
                        status: 'PENDING' as any,
                        requesterId: user.id,
                        modificationNotes: `New competency "${competency.name}" submitted for organization approval.`,
                    },
                });
            } catch (e) {
                console.warn('Failed to create ApprovalRequest for new competency:', e);
            }
        }

        return NextResponse.json(compWithPerms, { status: 201 });
    } catch (error) {
        console.error("Create competency error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canUserModifyRole, normalizeUserRole, getRoleCompetencyPermissions } from "@/lib/permissions/role-competency-permissions";

const ALLOWED_ROLES = [
    "SUPER_ADMIN", "ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN",
    "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"
];

function hasAccess(session: any): boolean {
    const u = session?.user as { role?: string; userType?: string } | undefined;
    if (!u) return false;
    if (u.userType === "SUPER_ADMIN") return true;
    return !!u.role && ALLOWED_ROLES.includes(u.role);
}

interface BulkCompetencyItem {
    name: string;
    category: string;
    description?: string;
    requiredLevel?: string;
    weight?: number;
    indicators?: Array<{
        text: string;
        level: string;
        type: "POSITIVE" | "NEGATIVE";
    }>;
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || !hasAccess(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: roleId } = await params;

        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        const u = session.user as Record<string, any>;
        const userRole = normalizeUserRole(u.role || "MEMBER");
        const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

        // Enforce RLS: check if user can modify this role
        if (!isSuperAdmin) {
            const canModify = canUserModifyRole(
                {
                    id: u.id,
                    role: userRole,
                    tenantId: u.tenantId || "",
                    tenantType: u.tenantType || "CORPORATE",
                    departmentId: u.departmentId,
                    teamId: u.teamId,
                    classId: u.classId,
                },
                {
                    scope: (role as any).scope,
                    tenantId: role.tenantId ?? undefined,
                    departmentId: (role as any).departmentId ?? undefined,
                    teamId: (role as any).teamId ?? undefined,
                    createdByUserId: (role as any).createdByUserId ?? undefined,
                }
            );
            if (!canModify) {
                return NextResponse.json({ error: "You do not have permission to modify this role" }, { status: 403 });
            }
        }

        // Determine scope for competency creation
        const permissions = getRoleCompetencyPermissions({
            id: u.id,
            role: userRole,
            tenantId: u.tenantId || null,
            tenantType: u.tenantType || null,
            departmentId: u.departmentId || null,
            teamId: u.teamId || null,
        });
        const competencyScope = permissions.creatableScope || "ORGANIZATION";
        const tenantId = u.tenantId || null;

        const items: BulkCompetencyItem[] = await request.json();

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Request body must be a non-empty array" }, { status: 400 });
        }

        const results = {
            created: 0,
            skipped: 0,
            errors: 0,
            details: [] as Array<{ name: string; status: "created" | "skipped" | "error"; reason?: string }>,
        };

        for (const item of items) {
            if (!item.name || !item.category) {
                results.errors++;
                results.details.push({ name: item.name || "(unknown)", status: "error", reason: "Missing name or category" });
                continue;
            }

            try {
                // Find or create the competency (tenant-scoped if not super admin)
                let competency = await prisma.competency.findFirst({
                    where: {
                        name: { equals: item.name, mode: "insensitive" },
                        ...(isSuperAdmin ? {} : { OR: [{ tenantId }, { tenantId: null, scope: "GLOBAL" }] }),
                    } as any,
                });

                let competencyCreated = false;
                if (!competency) {
                    competency = await prisma.competency.create({
                        data: {
                            name: item.name,
                            category: item.category as any,
                            description: item.description || "",
                            scope: competencyScope as any,
                            tenantId: isSuperAdmin ? null : tenantId,
                            createdByUserId: u.id,
                        } as any,
                    });
                    competencyCreated = true;

                    // Save indicators if provided
                    if (item.indicators && item.indicators.length > 0) {
                        await prisma.competencyIndicator.createMany({
                            data: item.indicators.map((ind) => ({
                                competencyId: competency!.id,
                                text: ind.text,
                                level: ind.level as any,
                                type: ind.type as any,
                            })),
                            skipDuplicates: true,
                        });
                    }
                }

                // Check if already mapped
                const existingMapping = await prisma.roleCompetency.findFirst({
                    where: { roleId, competencyId: competency.id },
                });

                if (existingMapping) {
                    results.skipped++;
                    results.details.push({
                        name: item.name,
                        status: "skipped",
                        reason: "Already mapped to this role",
                    });
                    continue;
                }

                // Create the role-competency mapping
                await prisma.roleCompetency.create({
                    data: {
                        roleId,
                        competencyId: competency.id,
                        requiredLevel: (item.requiredLevel as any) || "MIDDLE",
                        weight: item.weight || 1.0,
                    },
                });

                results.created++;
                results.details.push({
                    name: item.name,
                    status: "created",
                    reason: competencyCreated ? "New competency created and mapped" : "Existing competency mapped",
                });
            } catch (err) {
                results.errors++;
                results.details.push({
                    name: item.name,
                    status: "error",
                    reason: err instanceof Error ? err.message : "Unknown error",
                });
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("Bulk map competencies error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

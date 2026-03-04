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

// Map AI-returned category strings to valid CompetencyCategory enum values
const VALID_CATEGORIES = ["TECHNICAL", "BEHAVIORAL", "COGNITIVE", "DOMAIN_SPECIFIC"];
const CATEGORY_MAP: Record<string, string> = {
    FUNCTIONAL: "DOMAIN_SPECIFIC",
    LEADERSHIP: "BEHAVIORAL",
    CORE: "BEHAVIORAL",
    SOFT: "BEHAVIORAL",
    SOCIAL: "BEHAVIORAL",
    ANALYTICAL: "COGNITIVE",
    MANAGEMENT: "BEHAVIORAL",
    STRATEGIC: "COGNITIVE",
};

function sanitizeCategory(raw: string): string {
    const upper = raw.toUpperCase();
    if (VALID_CATEGORIES.includes(upper)) return upper;
    return CATEGORY_MAP[upper] ?? "TECHNICAL";
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
                    tenantId: u.tenantId || u.clientId || "",
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
        const resolvedTenantId = u.tenantId || u.clientId || null;
        const permissions = getRoleCompetencyPermissions({
            id: u.id,
            role: userRole,
            tenantId: resolvedTenantId,
            tenantType: u.tenantType || null,
            departmentId: u.departmentId || null,
            teamId: u.teamId || null,
        });
        const competencyScope = permissions.creatableScope || "ORGANIZATION";
        const tenantId = resolvedTenantId;

        const items: BulkCompetencyItem[] = await request.json();

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Request body must be a non-empty array" }, { status: 400 });
        }

        // Resolve the real User.id to satisfy Competency_createdByUserId_fkey
        const dbUser = await prisma.user.findUnique({ where: { id: u.id }, select: { id: true } })
            .catch(() => null);
        const safeCreatorId = dbUser?.id ?? null;

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
                // Find or create the competency.
                // Competency.name has a global @unique constraint so only one record
                // with any given name can exist across ALL tenants. Search by name only.
                let competency = await prisma.competency.findFirst({
                    where: {
                        name: { equals: item.name, mode: "insensitive" },
                    },
                });

                let competencyCreated = false;
                if (!competency) {
                    competency = await prisma.competency.create({
                        data: {
                            name: item.name,
                            category: sanitizeCategory(item.category) as any,
                            description: item.description || "",
                            scope: competencyScope as any,
                            tenantId: isSuperAdmin ? null : tenantId,
                            ...(safeCreatorId ? { createdByUserId: safeCreatorId } : {}),
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

                    // Auto-spawn ApprovalRequest for non-global, non-super-admin creations
                    if (!isSuperAdmin && competencyScope !== 'GLOBAL' && tenantId) {
                        try {
                            await prisma.approvalRequest.create({
                                data: {
                                    tenantId,
                                    type: 'COMPETENCY' as any,
                                    entityId: competency.id,
                                    status: 'PENDING' as any,
                                    requesterId: u.id as string,
                                    modificationNotes: `New competency "${competency.name}" submitted during bulk upload.`,
                                },
                            });
                        } catch (e) {
                            console.warn('Failed to create ApprovalRequest for bulk competency:', e);
                        }
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

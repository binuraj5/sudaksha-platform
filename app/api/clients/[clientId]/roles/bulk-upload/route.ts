import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import {
    getCreatableScope,
    getAllowedExperienceLevels,
    type UserContext,
} from "@/lib/permissions/role-competency-permissions";

const VALID_LEVELS = ["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"];
const VALID_INDUSTRIES = [
    "INFORMATION_TECHNOLOGY", "HEALTHCARE", "FINANCE", "MANUFACTURING",
    "EDUCATION", "RETAIL", "TELECOMMUNICATIONS", "GOVERNMENT",
    "ENERGY", "TRANSPORTATION", "HOSPITALITY", "REAL_ESTATE",
    "AGRICULTURE", "MEDIA", "GENERIC"
];

const TEMPLATE_COLUMNS = [
    "name", "description", "overallLevel", "department",
    "industries", "keyResponsibilities", "requiredExperience",
    "educationRequired"
];

const TEMPLATE_EXAMPLE_ROWS = [
    {
        name: "Senior Java Developer",
        description: "Designs and builds enterprise Java applications with Spring Boot",
        overallLevel: "SENIOR",
        department: "Engineering",
        industries: "INFORMATION_TECHNOLOGY",
        keyResponsibilities: "System design; Code reviews; Mentoring junior developers",
        requiredExperience: "5+ years of Java development",
        educationRequired: "B.Tech/B.E. in Computer Science or related field"
    },
    {
        name: "Marketing Analyst",
        description: "Analyses marketing campaign performance and provides data-driven insights",
        overallLevel: "MIDDLE",
        department: "Marketing",
        industries: "RETAIL;MEDIA",
        keyResponsibilities: "Campaign analysis; Market research; Reporting",
        requiredExperience: "2-4 years in marketing analytics",
        educationRequired: "MBA or equivalent"
    }
];

/**
 * GET — Download CSV template with all columns and example rows.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const escapeCsv = (val: string) => {
        if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes(";")) {
            return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
    };
    const header = TEMPLATE_COLUMNS.join(",");
    const rows = TEMPLATE_EXAMPLE_ROWS.map(row =>
        TEMPLATE_COLUMNS.map(col => escapeCsv((row as Record<string, string>)[col] ?? "")).join(",")
    );
    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=roles_bulk_upload_template.csv"
        }
    });
}

/**
 * POST — Bulk upload roles from CSV.
 * Uses RLS permission utility: only users who can create roles are allowed.
 * Scope/level are enforced per the user's hierarchy.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const u = session.user as Record<string, unknown>;

    const tenant = await prisma.tenant.findUnique({
        where: { id: clientId },
        select: { id: true, type: true, slug: true }
    });
    if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const tenantType = (tenant.type === "INSTITUTION" ? "INSTITUTION" : "CORPORATE") as "CORPORATE" | "INSTITUTION";

    const userCtx: UserContext = {
        id: u.id as string,
        role: (u.role as string) || "MEMBER",
        tenantId: clientId,
        tenantType,
        departmentId: u.departmentId as string | undefined,
        teamId: u.teamId as string | undefined,
        classId: u.classId as string | undefined,
    };

    const creatableScope = getCreatableScope(userCtx);
    if (!creatableScope) {
        return NextResponse.json(
            { error: "You do not have permission to create roles" },
            { status: 403 }
        );
    }

    const allowedLevels = getAllowedExperienceLevels(userCtx);
    const isSuperAdmin = userCtx.role === "SUPER_ADMIN";

    // Non-SuperAdmin uploads are always ORGANIZATION-scoped, tenant-specific, and require approval
    const effectiveScope = isSuperAdmin ? creatableScope : "ORGANIZATION";
    const forcedTenantId = isSuperAdmin && effectiveScope === "GLOBAL" ? null : clientId;
    const forcedDeptId = ["DEPARTMENT", "TEAM", "CLASS"].includes(effectiveScope)
        ? (userCtx.departmentId || null) : null;
    const forcedTeamId = effectiveScope === "TEAM"
        ? (userCtx.teamId || null)
        : effectiveScope === "CLASS"
            ? (userCtx.classId || null)
            : null;

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }
        if (!file.name.endsWith(".csv")) {
            return NextResponse.json({ error: "Only CSV files are supported" }, { status: 400 });
        }

        const content = await file.text();

        let records: Record<string, string>[];
        try {
            records = parse(content, {
                columns: (header: string[]) => header.map(h => h.trim().toLowerCase().replace(/\s+/g, "")),
                skip_empty_lines: true,
                relax_column_count: true
            });
        } catch {
            return NextResponse.json({ error: "CSV parsing failed. Check your file format." }, { status: 400 });
        }

        if (records.length === 0) {
            return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
        }

        const results: { row: number; name: string; status: "created" | "skipped" | "error"; reason?: string }[] = [];
        let createdCount = 0;

        const existingCount = await prisma.role.count({ where: { tenantId: clientId } });
        let codeCounter = existingCount;

        for (let i = 0; i < records.length; i++) {
            const row = records[i];
            const name = row.name?.trim();

            if (!name) {
                results.push({ row: i + 2, name: "(empty)", status: "skipped", reason: "Name is required" });
                continue;
            }

            const description = row.description?.trim() || "";
            const levelRaw = (row.overalllevel || row.level || "JUNIOR").trim().toUpperCase();
            let overallLevel = VALID_LEVELS.includes(levelRaw) ? levelRaw : "JUNIOR";

            if (!allowedLevels.includes(overallLevel as any)) {
                overallLevel = allowedLevels[0];
            }

            const department = row.department?.trim() || null;
            const industriesRaw = (row.industries || "").split(";").map(s => s.trim().toUpperCase()).filter(Boolean);
            const industries = industriesRaw.filter(ind => VALID_INDUSTRIES.includes(ind));
            const keyResponsibilities = row.keyresponsibilities?.trim() || null;
            const requiredExperience = row.requiredexperience?.trim() || null;
            const educationRequired = row.educationrequired?.trim() || null;

            const existing = await prisma.role.findFirst({
                where: { name, tenantId: clientId, isActive: true }
            });
            if (existing) {
                results.push({ row: i + 2, name, status: "skipped", reason: "Role with this name already exists" });
                continue;
            }

            try {
                codeCounter++;
                const slugPrefix = tenant.slug?.split("-")[0]?.toUpperCase() || "ORG";
                const shortName = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "R");
                const code = `${slugPrefix}-${shortName}${codeCounter}`;

                const roleStatus = isSuperAdmin ? "APPROVED" : "PENDING";
                const roleVisibility = isSuperAdmin ? "UNIVERSAL" : "TENANT_SPECIFIC";

                const newRole = await prisma.role.create({
                    data: {
                        name,
                        code,
                        description,
                        overallLevel: overallLevel as any,
                        department,
                        industries: industries as any,
                        keyResponsibilities,
                        requiredExperience,
                        educationRequired,
                        visibility: roleVisibility as any,
                        status: roleStatus as any,
                        scope: effectiveScope,
                        tenantId: forcedTenantId,
                        departmentId: forcedDeptId,
                        teamId: forcedTeamId,
                        createdByUserId: u.id as string,
                        createdBy: u.id as string,
                        allowedLevels,
                    } as any
                });

                if (!isSuperAdmin) {
                    await prisma.approvalRequest.create({
                        data: {
                            tenantId: clientId,
                            type: "ROLE",
                            entityId: newRole.id,
                            status: "PENDING",
                            requesterId: u.id as string,
                            originalData: newRole as any,
                            comments: "Bulk upload submission"
                        }
                    });
                }

                createdCount++;
                results.push({ row: i + 2, name, status: "created" });
            } catch (err: any) {
                const msg = err?.message?.includes("Unique constraint")
                    ? "Duplicate name or code"
                    : "Database error";
                results.push({ row: i + 2, name, status: "error", reason: msg });
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                total: records.length,
                created: createdCount,
                skipped: results.filter(r => r.status === "skipped").length,
                errors: results.filter(r => r.status === "error").length
            },
            details: results
        });
    } catch (error) {
        console.error("Bulk role upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "DEPARTMENT_HEAD"];

/**
 * GET /api/assessments/export/csv?tenantId=...
 * Downloads all completed member assessments for a tenant as CSV.
 * Requires TENANT_ADMIN, DEPARTMENT_HEAD, or SUPER_ADMIN role.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const u = session.user as { role?: string; userType?: string; tenantSlug?: string };
        const isAdmin = ADMIN_ROLES.includes(u.role ?? "") || ADMIN_ROLES.includes(u.userType ?? "");
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const tenantId = req.nextUrl.searchParams.get("tenantId");
        if (!tenantId) {
            return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
        }

        // Verify the tenant exists
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true, name: true } });
        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        const assessments = await (prisma as any).memberAssessment.findMany({
            where: {
                status: "COMPLETED",
                member: { tenantId },
            },
            include: {
                assessmentModel: { select: { name: true } },
                member: {
                    select: {
                        name: true,
                        email: true,
                        employeeId: true,
                        currentRole: { select: { name: true } },
                        orgUnit: { select: { name: true } },
                    }
                },
            },
            orderBy: { completedAt: "desc" },
        });

        const headers = [
            "Employee ID",
            "Name",
            "Email",
            "Role",
            "Department",
            "Assessment",
            "Score (%)",
            "Passed",
            "Completed At",
        ];

        const rows = assessments.map((a: any) => [
            a.member.employeeId ?? "",
            a.member.name ?? "",
            a.member.email ?? "",
            a.member.currentRole?.name ?? "",
            a.member.orgUnit?.name ?? "",
            a.assessmentModel.name ?? "",
            Math.round(a.overallScore ?? 0),
            a.passed ? "YES" : "NO",
            a.completedAt ? new Date(a.completedAt).toISOString().split("T")[0] : "",
        ]);

        const csvLines = [headers, ...rows]
            .map(row => row.map((cell: unknown) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\r\n");

        const filename = `assessment-results-${tenant.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;

        return new NextResponse(csvLines, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error("CSV export error:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}

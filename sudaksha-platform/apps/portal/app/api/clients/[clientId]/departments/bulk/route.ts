import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const allowedRoles = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD"];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const u = session.user as { clientId?: string; tenantId?: string };
    const userTenantId = u?.clientId ?? u?.tenantId;
    if (session.user.role !== "SUPER_ADMIN" && userTenantId !== clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { departments } = body as { departments: { name: string; code?: string; description?: string }[] };

        if (!Array.isArray(departments) || departments.length === 0) {
            return NextResponse.json({ error: "departments array is required and must not be empty" }, { status: 400 });
        }

        const created: { id: string; name: string; code: string }[] = [];
        const errors: { row: number; message: string }[] = [];

        for (let i = 0; i < departments.length; i++) {
            const row = departments[i];
            const name = (row?.name ?? "").toString().trim();
            if (!name) {
                errors.push({ row: i + 1, message: "Name is required" });
                continue;
            }
            let code = (row?.code ?? "").toString().trim();
            if (!code) {
                const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "DP");
                code = `${prefix}${100 + i}`;
            }
            const description = (row?.description ?? "").toString().trim() || null;

            try {
                const dept = await prisma.organizationUnit.create({
                    data: {
                        tenantId: clientId,
                        type: "DEPARTMENT",
                        name,
                        code,
                        description,
                        managerId: null,
                        isActive: true,
                    },
                });
                created.push({ id: dept.id, name: dept.name, code: dept.code ?? "" });
            } catch (e) {
                errors.push({ row: i + 1, message: e instanceof Error ? e.message : "Failed to create" });
            }
        }

        return NextResponse.json({
            count: created.length,
            created,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Departments bulk POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

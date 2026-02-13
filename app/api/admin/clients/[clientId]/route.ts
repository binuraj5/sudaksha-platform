import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/clients/[clientId]
 * Super Admin: fetch a single tenant (Corporate or Institution) by id.
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ clientId: string }> }
) {
    try {
        const session = await getApiSession();
        const role = (session?.user as any)?.role;
        const userType = (session?.user as any)?.userType;
        const isSuperAdmin = role === "SUPER_ADMIN" || userType === "SUPER_ADMIN";

        if (!session || !isSuperAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { clientId } = await params;
        if (!clientId) {
            return NextResponse.json({ error: "clientId required" }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: clientId },
            include: {
                _count: {
                    select: {
                        members: true,
                        activities: true,
                        orgUnits: true,
                        roles: true,
                        approvalRequests: true,
                    },
                },
                settings: true,
            },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        return NextResponse.json(tenant);
    } catch (error) {
        console.error("[admin/clients/[clientId]]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/clients/[clientId]
 * Super Admin: delete a tenant (organization or institution).
 */
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ clientId: string }> }
) {
    try {
        const session = await getApiSession();
        const role = (session?.user as any)?.role;
        const userType = (session?.user as any)?.userType;
        const isSuperAdmin = role === "SUPER_ADMIN" || userType === "SUPER_ADMIN";

        if (!session || !isSuperAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { clientId } = await params;
        if (!clientId) {
            return NextResponse.json({ error: "clientId required" }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: clientId },
            select: { id: true, name: true, type: true }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        // Billing tables may not exist in all deployments - run outside transaction
        const billingDeletes = [
            () => prisma.usageRecord.deleteMany({ where: { tenantId: clientId } }),
            () => prisma.invoice.deleteMany({ where: { tenantId: clientId } }),
            () => prisma.subscription.deleteMany({ where: { tenantId: clientId } }),
            () => prisma.featureActivation.deleteMany({ where: { tenantId: clientId } }),
        ];
        for (const fn of billingDeletes) {
            try {
                await fn();
            } catch {
                /* table may not exist */
            }
        }

        // Unlink optional tenant FKs (tables may vary by deployment)
        const unlinkOps = [
            () => prisma.reportTemplate.updateMany({ where: { tenantId: clientId }, data: { tenantId: null } }),
            () => prisma.assessmentModel.updateMany({ where: { tenantId: clientId }, data: { tenantId: null } }),
            () => prisma.role.updateMany({ where: { tenantId: clientId }, data: { tenantId: null } }),
            () => prisma.competency.updateMany({ where: { tenantId: clientId }, data: { tenantId: null } }),
            () => prisma.componentLibrary.updateMany({ where: { tenantId: clientId }, data: { tenantId: null } }),
        ];
        for (const fn of unlinkOps) {
            try {
                await fn();
            } catch (e) {
                console.warn("[admin/clients DELETE] Unlink skipped:", (e as Error)?.message);
            }
        }

        await prisma.tenant.delete({ where: { id: clientId } });

        return NextResponse.json({ success: true, message: "Organization deleted successfully" });
    } catch (error: any) {
        console.error("[admin/clients/[clientId] DELETE]", error);
        if (error.code === "P2003") {
            return NextResponse.json(
                { error: "Cannot delete: organization has linked data that could not be removed." },
                { status: 400 }
            );
        }
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

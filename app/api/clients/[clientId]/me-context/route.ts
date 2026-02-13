import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/clients/[clientId]/me-context
 * Returns tenant name, logo, and hierarchy label for the current user (header display).
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { clientId?: string; tenantId?: string; role?: string; managedOrgUnitId?: string };
    const userClientId = user.clientId || user.tenantId;
    if (user.role !== "SUPER_ADMIN" && userClientId !== clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: clientId },
            select: {
                name: true,
                logo: true,
                type: true,
                settings: { select: { logoUrl: true } },
            },
        });

        const tenantName = tenant?.name ?? "Organization";
        const logoUrl = tenant?.settings?.logoUrl ?? tenant?.logo ?? undefined;

        let hierarchyLabel: string | null = null;
        const managedOrgUnitId = user.managedOrgUnitId;
        if (managedOrgUnitId) {
            const unit = await prisma.organizationUnit.findUnique({
                where: { id: managedOrgUnitId },
                select: { name: true, type: true },
            });
            if (unit) {
                hierarchyLabel = `${tenantName} → ${unit.name}`;
            } else {
                hierarchyLabel = tenantName;
            }
        } else {
            hierarchyLabel = tenantName;
        }

        return NextResponse.json({
            tenantName,
            logoUrl: logoUrl ?? null,
            hierarchyLabel,
            isCorporateOrInstitution: tenant?.type === "CORPORATE" || tenant?.type === "INSTITUTION",
        });
    } catch (e) {
        console.error("[me-context] Error:", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

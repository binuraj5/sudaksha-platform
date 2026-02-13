import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { resolveTenantType, resolveTenantLabels } from "@/lib/tenant-resolver";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/clients/[clientId]/tenant
 * Returns tenant type, labels, name and logoUrl for header/branding.
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

    const userClientId = (session.user as any).clientId || (session.user as any).tenantId;
    if ((session.user as any).role !== "SUPER_ADMIN" && userClientId !== clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: clientId },
            select: {
                type: true,
                name: true,
                logo: true,
                settings: { select: { logoUrl: true } },
            },
        });

        const [labels] = await Promise.all([
            resolveTenantLabels(clientId),
        ]);
        const type = tenant?.type ?? "CORPORATE";
        const name = tenant?.name ?? "Organization";
        const logoUrl = tenant?.settings?.logoUrl ?? tenant?.logo ?? undefined;

        return NextResponse.json({ type, labels, name, logoUrl });
    } catch (e) {
        console.error("[tenant] Error:", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

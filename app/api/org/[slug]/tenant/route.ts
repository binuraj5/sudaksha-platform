import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { resolveTenantLabels } from "@/lib/tenant-resolver";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/org/[slug]/tenant
 * Returns tenant by slug for org routes.
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSlug = (session.user as any).tenantSlug;
    const isSuperAdmin = (session.user as any).role === "SUPER_ADMIN";
    if (!isSuperAdmin && userSlug !== slug) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: {
                id: true,
                slug: true,
                type: true,
                name: true,
                logo: true,
                settings: { select: { logoUrl: true } },
            },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        const [labels] = await Promise.all([resolveTenantLabels(tenant.id)]);
        const logoUrl = tenant.settings?.logoUrl ?? tenant.logo ?? undefined;

        return NextResponse.json({
            id: tenant.id,
            slug: tenant.slug,
            type: tenant.type,
            name: tenant.name,
            logoUrl,
            labels,
        });
    } catch (e) {
        console.error("[org tenant] Error:", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

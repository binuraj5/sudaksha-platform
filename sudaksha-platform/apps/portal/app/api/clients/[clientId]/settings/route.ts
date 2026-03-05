import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Security Check: SUPER_ADMIN or tenant/client admin for this client
    const u = session.user as { role?: string; clientId?: string; tenantId?: string };
    const userTenantId = u?.clientId ?? u?.tenantId;
    const canAccess = u?.role === 'SUPER_ADMIN' || userTenantId === clientId;
    if (!canAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: clientId },
            include: { settings: true }
        });

        if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

        // Ensure settings exist
        let settings = tenant.settings;
        if (!settings) {
            settings = await prisma.tenantSettings.create({
                data: { tenantId: clientId }
            });
        }

        return NextResponse.json({
            organization: {
                name: tenant.name,
                email: tenant.email,
                phone: settings.phone || tenant.phone,
                city: settings.city,
                district: settings.district,
                state: settings.state,
                country: settings.country,
                timezone: settings.timezone,
                description: settings.description,
                lineOfBusiness: settings.lineOfBusiness,
                website: settings.website,
                type: tenant.type
            },
            branding: {
                logoUrl: settings.logoUrl || tenant.logo,
                primaryColor: settings.primaryColor || '#4f46e5', // Default Indigo
                secondaryColor: settings.secondaryColor || '#ec4899', // Default Pink
            }
        });

    } catch (error) {
        console.error("Settings GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const u = session?.user as { role?: string; clientId?: string; tenantId?: string; email?: string } | undefined;
    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN'];
    const userTenantId = u?.clientId ?? u?.tenantId;
    let canPatch = !!(session && allowedRoles.includes(u?.role ?? '') && (u?.role === 'SUPER_ADMIN' || userTenantId === clientId));

    // DB fallback: session role may be stale for tenant admins
    if (!canPatch && session?.user?.email) {
        const member = await prisma.member.findUnique({
            where: { email: session.user.email },
            select: { role: true, tenantId: true }
        });
        if (member && allowedRoles.includes(member.role) && member.tenantId === clientId) {
            canPatch = true;
        }
    }

    if (!canPatch) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { organization, branding } = body;

        // Update Tenant Settings
        await prisma.tenantSettings.upsert({
            where: { tenantId: clientId },
            create: {
                tenantId: clientId,
                // Org
                city: organization?.city,
                district: organization?.district,
                state: organization?.state,
                country: organization?.country,
                timezone: organization?.timezone,
                description: organization?.description,
                lineOfBusiness: organization?.lineOfBusiness,
                website: organization?.website,
                phone: organization?.phone,
                // Branding
                logoUrl: branding?.logoUrl,
                primaryColor: branding?.primaryColor,
                secondaryColor: branding?.secondaryColor,
            },
            update: {
                // Org
                city: organization?.city,
                district: organization?.district,
                state: organization?.state,
                country: organization?.country,
                timezone: organization?.timezone,
                description: organization?.description,
                lineOfBusiness: organization?.lineOfBusiness,
                website: organization?.website,
                phone: organization?.phone,
                // Branding
                logoUrl: branding?.logoUrl,
                primaryColor: branding?.primaryColor,
                secondaryColor: branding?.secondaryColor,
            }
        });

        // Also update main Tenant Model if necessary (e.g. logo, brandColor redundancy)
        if (branding?.primaryColor || branding?.logoUrl) {
            await prisma.tenant.update({
                where: { id: clientId },
                data: {
                    brandColor: branding.primaryColor,
                    logo: branding.logoUrl
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Settings PATCH Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

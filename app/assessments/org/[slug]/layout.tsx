import React from 'react';
import PortalHeader from '@/components/layout/PortalHeader';
import { Sidebar } from '@/components/Navigation/Sidebar';
import { MobileNav } from '@/components/Navigation/MobileNav';
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';
import { prisma } from '@/lib/prisma';
import { getApiSession } from "@/lib/get-session";
import { redirect, notFound } from "next/navigation";

export default async function TenantLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const session = await getApiSession();

    if (!session) {
        redirect(`/assessments/login?callbackUrl=/assessments/org/${slug}/dashboard`);
    }

    // Verify User has access to this tenant slug (SUPER_ADMIN or tenantSlug matches)
    const tenantSlug = (session.user as any).tenantSlug;
    const userType = (session.user as any).userType;
    const isSuperAdmin = userType === 'SUPER_ADMIN';
    const hasOrgAccess = tenantSlug === slug; // TENANT, STUDENT, CLASS_TEACHER with matching tenant

    if (!isSuperAdmin && !hasOrgAccess) {
        if (tenantSlug) {
            redirect(`/assessments/org/${tenantSlug}/dashboard`);
        }
        redirect('/unauthorized');
    }

    // Fetch Tenant Branding
    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        include: { settings: true }
    });

    if (!tenant) {
        notFound();
    }

    const branding = {
        logoUrl: (tenant as any).settings?.logoUrl || '/logo.png',
        primaryColor: (tenant as any).settings?.primaryColor || '#4f46e5',
        tenantName: tenant.name
    };

    return (
        <SessionProviderWrapper session={session}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <PortalHeader branding={branding} session={session} />
                <MobileNav />
                <div className="flex-1 flex overflow-hidden">
                    <Sidebar />
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <main className="flex-1 overflow-y-auto relative p-6">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </SessionProviderWrapper>
    );
}

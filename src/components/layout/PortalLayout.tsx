import React from 'react';
import PortalHeader from './PortalHeader';
import { Sidebar } from '@/components/Navigation/Sidebar';
import { MobileNav } from '@/components/Navigation/MobileNav';
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
    const session = (await getServerSession(authOptions)) as Session | null;

    let branding: { logoUrl?: string | null; primaryColor?: string | null; tenantName?: string; hierarchyLabel?: string | null } = {
        logoUrl: '/logo.png',
        primaryColor: '#b91c1c',
        tenantName: 'Sudaksha'
    };

    const clientId = (session?.user as { tenantId?: string; clientId?: string })?.clientId ?? (session?.user as { tenantId?: string })?.tenantId;
    if (clientId) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: clientId },
            select: { name: true, logo: true, settings: { select: { logoUrl: true } } },
        });
        if (tenant) {
            branding = {
                logoUrl: tenant.settings?.logoUrl ?? tenant.logo ?? branding.logoUrl,
                primaryColor: branding.primaryColor,
                tenantName: tenant.name,
            };
        }
    } else if (session?.user?.tenantId) {
        const settings = await prisma.tenantSettings.findUnique({
            where: { tenantId: (session.user as any).tenantId },
            include: { tenant: true }
        });
        if (settings) {
            branding = {
                logoUrl: settings.logoUrl || branding.logoUrl,
                primaryColor: settings.primaryColor || branding.primaryColor,
                tenantName: (settings as any).tenant?.name ?? branding.tenantName,
            };
        }
    }

    return (
        <SessionProviderWrapper session={session}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <PortalHeader branding={branding} session={session} />
                <MobileNav />
                <div className="flex-1 flex overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto relative p-6">
                        {children}
                    </main>
                </div>
            </div>
        </SessionProviderWrapper>
    );
}

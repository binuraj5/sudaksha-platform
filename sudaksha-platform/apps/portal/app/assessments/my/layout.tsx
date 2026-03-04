import React from 'react';
import PortalHeader from '@/components/layout/PortalHeader';
import { SidebarContainer } from '@/components/layout/SidebarContainer';
import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function PersonalLayout({ children }: { children: React.ReactNode }) {
    const session = await getApiSession();

    if (!session) {
        redirect("/assessments/login");
    }

    const u = session.user as any;
    const role = u?.role ?? u?.userType;
    const clientId = u?.clientId;
    // Corporate Admin / Leads / Employees with client → redirect to client dashboard
    if (['TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'DEPT_HEAD', 'EMPLOYEE'].includes(String(role)) && clientId) {
        redirect(`/assessments/clients/${clientId}/dashboard`);
    }

    // branding for individual (SudAssess default)
    const branding = {
        logoUrl: '/logo.png',
        primaryColor: '#4f46e5',
        tenantName: 'My SudAssess'
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PortalHeader branding={branding} session={session} />
            <div className="flex-1 flex overflow-hidden">
                <SidebarContainer />
                <main className="flex-1 overflow-y-auto relative p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

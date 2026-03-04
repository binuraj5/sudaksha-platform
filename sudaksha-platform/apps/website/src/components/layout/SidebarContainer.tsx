"use client";

import React from 'react';
import { useSession } from "next-auth/react";
import { AssessmentSideNav } from "@/components/admin/AssessmentSideNav"; // Admin Nav
import { B2CSidebar } from "./Sidebars/B2CSidebar";

export function SidebarContainer() {
    const { data: session } = useSession();
    const userRole = (session?.user as { role?: string } | undefined)?.role;

    if (!userRole) return null;

    if (['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'TEAM_LEAD', 'EMPLOYEE', 'STUDENT', 'CLASS_TEACHER', 'ASSESSOR'].includes(userRole)) {
        return (
            <aside className="w-64 border-r bg-white hidden md:block overflow-y-auto h-full">
                <div className="p-4">
                    <AssessmentSideNav />
                </div>
            </aside>
        );
    }

    // For Students / Individuals
    return (
        <aside className="w-64 border-r bg-white hidden md:block overflow-y-auto h-full">
            <div className="p-4">
                <B2CSidebar />
            </div>
        </aside>
    );
}

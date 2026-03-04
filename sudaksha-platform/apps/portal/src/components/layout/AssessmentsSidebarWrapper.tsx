"use client";

import { usePathname } from "next/navigation";
import { AssessmentSideNav } from "@/components/admin/AssessmentSideNav";

export function AssessmentsSidebarWrapper() {
    const pathname = usePathname();
    const isAdminPath = pathname?.startsWith("/assessments/admin");
    const isLoginPage = pathname === "/assessments/login";

    if (isAdminPath || isLoginPage) {
        return null;
    }

    return (
        <aside className="w-64 border-r bg-white hidden md:block overflow-y-auto">
            <div className="p-4">
                <AssessmentSideNav />
            </div>
        </aside>
    );
}

import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { MobileNav } from "@/components/Navigation/MobileNav";

export default async function ClientLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ clientId: string }>;
}) {
    const session = await getApiSession();
    const { clientId } = await params;

    const u = session?.user as { role?: string; userType?: string; clientId?: string; tenantId?: string; tenantSlug?: string } | undefined;
    const tenantSlug = u?.tenantSlug as string | undefined;
    const effectiveClientId = u?.clientId ?? u?.tenantId;

    // Canonical URL is org slug: if user has tenantSlug, redirect to org dashboard and avoid legacy clients loop
    if (session && tenantSlug) {
        redirect(`/assessments/org/${tenantSlug}/dashboard`);
    }

    // B2C INDIVIDUAL (no org) must use /assessments/individuals/*. STUDENT with no tenantId = B2C.
    if (u && (u.role === "INDIVIDUAL" || u.userType === "INDIVIDUAL" || (u.role === "STUDENT" && !effectiveClientId))) {
        redirect("/assessments/individuals/dashboard");
    }

    const orgRoles = ["TENANT_ADMIN", "DEPARTMENT_HEAD", "TEAM_LEAD", "EMPLOYEE", "DEPT_HEAD", "MANAGER", "ASSESSOR", "STUDENT", "CLASS_TEACHER"];
    const canAccess = session && (
        u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN" ||
        (orgRoles.includes(String(u?.role)) && (u?.clientId === clientId || u?.tenantId === clientId))
    );

    if (!canAccess) {
        redirect(`/assessments/login?callbackUrl=${encodeURIComponent("/assessments")}`);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <MobileNav />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar />
                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <main className="flex-1 overflow-y-auto focus:outline-none">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

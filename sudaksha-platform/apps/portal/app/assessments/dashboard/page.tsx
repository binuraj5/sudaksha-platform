import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { Session } from "next-auth";
import { getDashboardPath, getOrgDashboardPath } from "@/lib/dashboardRouting";

/**
 * /assessments/dashboard — universal authenticated entry point.
 * SEPL/INT/2026/IMPL-STEPS-01 Step 11
 *
 * Resolution order:
 *  1. Unauthenticated     → login
 *  2. SUPER_ADMIN         → admin dashboard (fast path, no role-routing needed)
 *  3. Org/tenant users    → getOrgDashboardPath (role-scoped under /org/[slug])
 *  4. Client-based users  → legacy /clients/[clientId]/dashboard
 *  5. All others (B2C)    → getDashboardPath(role) — role-specific or fallback
 */
export default async function DashboardRedirectPage() {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
        redirect("/assessments/login");
    }

    const user = session.user as any;
    const role: string | undefined = user.role;
    const clientId: string | undefined = user.clientId;
    const tenantSlug: string | undefined = user.tenantSlug;

    // 1. Super Admin — straight to platform admin panel
    if (role === "SUPER_ADMIN") {
        redirect("/assessments/admin/dashboard");
    }

    // 2. Corporate / Institution users (Org-assigned, tenant-scoped)
    //    getOrgDashboardPath resolves the role-specific sub-path within the org.
    //    All roles currently share the same org dashboard; update ORG_ROLE_SUB_PATH
    //    in lib/dashboardRouting.ts as role-specific org views are built (Steps 12–17).
    if (tenantSlug) {
        redirect(getOrgDashboardPath(tenantSlug, role));
    }

    // 3. Legacy client-based users (clientId without tenantSlug)
    if (clientId) {
        redirect(`/assessments/clients/${clientId}/dashboard`);
    }

    // 4. B2C (Individual, Student, Employee without org context) and all others
    redirect(getDashboardPath(role));
}

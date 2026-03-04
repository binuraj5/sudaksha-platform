import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { Session } from "next-auth";

export default async function DashboardRedirectPage() {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
        redirect("/assessments/login");
    }

    const user = session.user as any;
    const role = user.role;
    const clientId = user.clientId;
    const tenantSlug = user.tenantSlug;

    // 1. Super Admin
    if (role === 'SUPER_ADMIN') {
        redirect('/assessments/admin/dashboard');
    }

    // 2. Individual / Student (B2C)
    if (['INDIVIDUAL', 'STUDENT'].includes(String(role)) && !clientId) {
        redirect('/assessments/individuals/dashboard');
    }

    // 3. Corporate / Institution Admin & Leads (Tenant users)
    if (tenantSlug) {
        redirect(`/assessments/org/${tenantSlug}/dashboard`);
    }

    // 4. Client-based (Legacy or simplified)
    if (clientId) {
        redirect(`/assessments/clients/${clientId}/dashboard`);
    }

    // 5. Fallback for anyone else logged in
    redirect('/assessments/my/dashboard');
}

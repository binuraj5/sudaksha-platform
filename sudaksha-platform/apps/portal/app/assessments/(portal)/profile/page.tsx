import { ProfileWizard } from "@/components/Career/ProfileWizard";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const CLIENT_ROLES = ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'TEAM_LEAD', 'EMPLOYEE', 'STUDENT', 'ASSESSOR'];

export default async function ProfilePage() {
    const session = await getApiSession();
    if (!session) redirect("/assessments/login");

    const u = session.user as { clientId?: string; tenantId?: string; role?: string };
    const clientId = u.clientId || u.tenantId;
    // Client users should use client layout so they get the correct nav; redirect to client-scoped profile.
    if (clientId && CLIENT_ROLES.includes(u.role || '')) {
        redirect(`/assessments/clients/${clientId}/profile`);
    }
    let clientName: string | null = null;
    if (clientId) {
        const tenant = await prisma.tenant.findUnique({ where: { id: clientId }, select: { name: true } });
        if (tenant) clientName = tenant.name;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                    {clientName ? `${clientName} – My Career Profile` : "My Career Profile"}
                </h1>
                <p className="text-gray-500">Complete your profile to unlock personalized career recommendations.</p>
            </header>

            <ProfileWizard />
        </div>
    );
}

import { ProfileWizard } from "@/components/Career/ProfileWizard";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ClientProfilePage({
    params,
}: {
    params: Promise<{ clientId: string }>;
}) {
    const session = await getApiSession();
    const { clientId } = await params;
    if (!session) redirect("/assessments/login");

    const u = session.user as { clientId?: string; tenantId?: string; role?: string };
    const userClientId = u.clientId || u.tenantId;
    if (u.role !== "SUPER_ADMIN" && userClientId !== clientId) {
        redirect(`/assessments/clients/${userClientId || ""}/dashboard`);
    }

    let clientName: string | null = null;
    const tenant = await prisma.tenant.findUnique({
        where: { id: clientId },
        select: { name: true },
    });
    if (tenant) clientName = tenant.name;

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

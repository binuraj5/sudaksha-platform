import { ProfileWizard } from "@/components/Career/ProfileWizard";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

export default async function OrgProfilePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { id: true, name: true },
    });
    if (!tenant) notFound();

    const u = session.user as { tenantSlug?: string; role?: string; userType?: string };
    const isSuperAdmin = u.userType === "SUPER_ADMIN" || u.role === "SUPER_ADMIN";
    const hasAccess = isSuperAdmin || u.tenantSlug === slug;
    if (!hasAccess) {
        redirect(u.tenantSlug ? `/assessments/org/${u.tenantSlug}/dashboard` : "/assessments");
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                    {tenant.name} – My Career Profile
                </h1>
                <p className="text-gray-500">Complete your profile to unlock personalized career recommendations.</p>
            </header>

            <ProfileWizard tenantSlug={slug} />
        </div>
    );
}

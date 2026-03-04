import { ProfileWizard } from "@/components/Career/ProfileWizard";
// @ts-ignore — TS1261 false positive due to overlapping path alias roots
import { RestrictedProfileForm } from "@/components/profile/RestrictedProfileForm";
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

    const u = session.user as { tenantSlug?: string; role?: string; userType?: string; email?: string };
    const isSuperAdmin = u.userType === "SUPER_ADMIN" || u.role === "SUPER_ADMIN";
    const hasAccess = isSuperAdmin || u.tenantSlug === slug;
    if (!hasAccess) {
        redirect(u.tenantSlug ? `/assessments/org/${u.tenantSlug}/dashboard` : "/assessments");
    }

    const member = await prisma.member.findFirst({
        where: { email: u.email, tenantId: tenant.id }
    });

    const isRestrictedProfile = (member as any)?.profileType === "RESTRICTED";

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                    {tenant.name} – My Profile
                </h1>
                <p className="text-gray-500">
                    {isRestrictedProfile
                        ? "Manage your basic information and biography."
                        : "Complete your profile to unlock personalized career recommendations."}
                </p>
            </header>

            {isRestrictedProfile ? (
                <RestrictedProfileForm member={member} tenantSlug={slug} />
            ) : (
                <ProfileWizard tenantSlug={slug} />
            )}
        </div>
    );
}

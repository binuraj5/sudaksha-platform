import { ProfileWizard } from "@/components/Career/ProfileWizard";
// @ts-ignore — TS1261 false positive due to overlapping path alias roots
import { RestrictedProfileForm } from "@/components/profile/RestrictedProfileForm";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function IndividualProfilePage() {
    const session = await getApiSession();
    if (!session) redirect("/assessments/login");

    const u = session.user as { email?: string; tenantSlug?: string };

    // Fetch only this user's own Member record — RLS-safe, no cross-tenant leakage
    const member = await prisma.member.findFirst({
        where: { email: u.email ?? "" },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bio: true,
            profileType: true,
        },
    });

    // Institution staff (Dept Heads, Class Teachers) have profileType = "RESTRICTED"
    // Everyone else (employees, students, B2C) gets the full profile wizard
    const isRestrictedProfile = (member as any)?.profileType === "RESTRICTED";

    // tenantSlug used by RestrictedProfileForm's save action (falls back to empty for B2C)
    const tenantSlug = u.tenantSlug ?? "";

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                    {isRestrictedProfile ? "My Profile" : "My Career Profile"}
                </h1>
                <p className="text-gray-500">
                    {isRestrictedProfile
                        ? "Manage your basic information and biography."
                        : "Complete your profile to unlock personalized career recommendations."}
                </p>
            </header>

            {isRestrictedProfile ? (
                <RestrictedProfileForm member={member} tenantSlug={tenantSlug} />
            ) : (
                <ProfileWizard isB2C />
            )}
        </div>
    );
}

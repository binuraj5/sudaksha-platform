import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Portal /assessments/hierarchy
 * Redirects to the appropriate client-specific or org-specific hierarchy page.
 */
export default async function HierarchyPage() {
    const session = await getApiSession();
    if (!session) redirect("/assessments/login");

    const u = session.user as { clientId?: string; tenantId?: string; role?: string };
    const sessionClientId = u.clientId || u.tenantId;

    // definitive lookup
    const member = await prisma.member.findUnique({
        where: { email: session.user.email! },
        select: {
            tenantId: true,
            tenant: { select: { slug: true } }
        }
    });

    const finalClientId = member?.tenantId || sessionClientId;

    if (finalClientId) {
        redirect(`/assessments/clients/${finalClientId}/hierarchy`);
    }

    if (member?.tenant?.slug) {
        redirect(`/assessments/org/${member.tenant.slug}/hierarchy`);
    }

    return (
        <div className="p-8 max-w-7xl mx-auto text-center space-y-4">
            <h1 className="text-2xl font-bold">My Hierarchy</h1>
            <p className="text-gray-500 italic">Member profile not found or organizational link missing.</p>
        </div>
    );
}

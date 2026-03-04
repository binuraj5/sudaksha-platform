import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Redirect /assessments/clients/[clientId] to /assessments/org/[slug]/dashboard
 * Legacy clients route - org slug is the canonical URL.
 */
export default async function ClientsRedirectPage({
    params,
}: {
    params: Promise<{ clientId: string }>;
}) {
    const { clientId } = await params;
    const session = await getApiSession();

    if (!session) {
        redirect(`/assessments/login?callbackUrl=${encodeURIComponent(`/assessments/clients/${clientId}/dashboard`)}`);
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id: clientId },
        select: { slug: true },
    });

    if (!tenant?.slug) {
        redirect("/assessments");
    }

    redirect(`/assessments/org/${tenant.slug}/dashboard`);
}

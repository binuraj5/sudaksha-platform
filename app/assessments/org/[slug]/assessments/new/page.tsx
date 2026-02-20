import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

/**
 * Org-scoped assessment creation redirect.
 * Redirects admins to the admin assessment builder scoped to their tenant.
 */
export default async function OrgAssessmentNewPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    // Redirect to admin model creation page, pre-scoped to this org's tenant
    redirect(`/assessments/admin/models/create`);
}

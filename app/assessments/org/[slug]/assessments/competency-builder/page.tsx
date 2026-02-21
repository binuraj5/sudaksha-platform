import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { CompetencyBasedAssessmentForm } from "@/components/assessments/CompetencyBasedAssessmentForm";

const ALLOWED_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN"];

export default async function OrgCompetencyBuilderPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const role = (session.user as any)?.role;
    if (!role || !ALLOWED_ROLES.includes(role)) {
        redirect("/assessments/login");
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!tenant) notFound();

    return <CompetencyBasedAssessmentForm basePath={`/assessments/org/${slug}/assessments/create`} clientId={tenant.id} />;
}

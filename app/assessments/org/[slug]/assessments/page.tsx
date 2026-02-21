import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ModelsPageContent } from "@/components/assessments/ModelsPageContent";
import { redirect, notFound } from "next/navigation";

export default async function OrgAssessmentsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    return (
        <ModelsPageContent
            isAdmin={false}
            clientId={tenant.id}
            baseUrl={`/assessments/org/${slug}/assessments`}
        />
    );
}

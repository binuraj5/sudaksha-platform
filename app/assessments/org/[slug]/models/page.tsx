import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ModelsPageContent } from "@/components/assessments/ModelsPageContent";

const ROLES_ALLOWED = [
    "SUPER_ADMIN", "ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN",
    "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"
];

export default async function OrgModelsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    const userRole = (session?.user as { role?: string })?.role;
    if (!session || !userRole || !ROLES_ALLOWED.includes(userRole)) {
        redirect("/assessments/login");
    }

    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { id: true },
    });
    if (!tenant) notFound();

    return (
        <ModelsPageContent
            baseUrl={`/assessments/org/${slug}/models`}
        />
    );
}

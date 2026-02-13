import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { DepartmentsPageContent } from "./DepartmentsPageContent";

export default async function OrgDepartmentsPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ search?: string; status?: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    const role = (session.user as { role?: string }).role;
    const managedOrgUnitId = (session.user as { managedOrgUnitId?: string | null }).managedOrgUnitId ?? null;

    return (
        <DepartmentsPageContent
            clientId={tenant.id}
            slug={slug}
            searchParams={await searchParams}
            scope={{ role: role ?? undefined, managedOrgUnitId }}
        />
    );
}

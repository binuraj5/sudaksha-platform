import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { OrgCompetenciesContent } from "./OrgCompetenciesContent";

export default async function OrgCompetenciesPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { id: true, name: true, type: true },
    });

    if (!tenant) notFound();

    return (
        <OrgCompetenciesContent
            clientId={tenant.id}
            slug={slug}
            tenantType={tenant.type}
        />
    );
}

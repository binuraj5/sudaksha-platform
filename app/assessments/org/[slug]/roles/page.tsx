import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { OrgRolesClient } from "./OrgRolesClient";

const ROLES_ALLOWED = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"];

export default async function OrgRolesPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const role = (session.user as { role?: string })?.role;
    if (!role || !ROLES_ALLOWED.includes(role)) {
        redirect("/assessments/login");
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { id: true, type: true } });
    if (!tenant) notFound();

    const isInstitution = tenant.type === "INSTITUTION";

    return <OrgRolesClient clientId={tenant.id} isInstitution={isInstitution} slug={slug} />;
}

import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { CoursesPageContent } from "./CoursesPageContent";

export default async function OrgCoursesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getApiSession();
  const { slug } = await params;

  if (!session) redirect("/assessments/login");

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) notFound();

  const role = (session.user as { role?: string }).role;
  const managedOrgUnitId = (session.user as { managedOrgUnitId?: string | null }).managedOrgUnitId ?? null;
  const isDeptHead = role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD";
  const defaultDepartmentId = isDeptHead && managedOrgUnitId ? managedOrgUnitId : undefined;

  return (
    <CoursesPageContent
      slug={slug}
      clientId={tenant.id}
      defaultDepartmentId={defaultDepartmentId}
    />
  );
}

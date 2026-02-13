import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { DepartmentDetailContent } from "./DepartmentDetailContent";

export default async function OrgDepartmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string; deptId: string }>;
}) {
  const session = await getApiSession();
  const { slug, deptId } = await params;

  if (!session) redirect("/assessments/login");

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) notFound();

  const tenantType = (tenant.type as "CORPORATE" | "INSTITUTION" | "SYSTEM") || "CORPORATE";

  const department = await prisma.organizationUnit.findFirst({
    where: { id: deptId, tenantId: tenant.id, type: "DEPARTMENT" },
    include: {
      manager: { select: { id: true, name: true, email: true, avatar: true } },
      _count: { select: { children: true, members: true } },
    },
  });
  if (!department) notFound();

  return (
    <DepartmentDetailContent
      slug={slug}
      clientId={tenant.id}
      deptId={deptId}
      tenantType={tenantType}
      department={{
        id: department.id,
        name: department.name,
        code: department.code,
        description: department.description ?? undefined,
        manager: department.manager ?? undefined,
        classCount: department._count.children,
        memberCount: department._count.members,
      }}
    />
  );
}

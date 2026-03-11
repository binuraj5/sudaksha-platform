import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import EmployeeDetailContent from "./EmployeeDetailContent";

export default async function OrgEmployeeDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const session = await getApiSession();
  const { slug, id } = await params;

  if (!session) redirect("/assessments/login");

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) notFound();

  const member = await prisma.member.findFirst({
    where: {
      id,
      tenantId: tenant.id,
    },
    include: {
      orgUnit: true,
    },
  });

  if (!member) notFound();

  const userRole = (session.user as { role?: string })?.role ?? "";
  const userId = (session.user as { id?: string })?.id ?? "";

  return (
    <EmployeeDetailContent
      slug={slug}
      tenantId={tenant.id}
      memberId={id}
      memberData={member}
      userRole={userRole}
      userId={userId}
    />
  );
}

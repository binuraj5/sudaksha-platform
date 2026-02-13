import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getClassById } from "@/lib/services/class-service";
import { ClassDetailContent } from "./ClassDetailContent";

export default async function OrgClassDetailPage({
  params,
}: {
  params: Promise<{ slug: string; classId: string }>;
}) {
  const session = await getApiSession();
  const { slug, classId } = await params;

  if (!session) redirect("/assessments/login");

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) notFound();

  if (tenant.type === "CORPORATE") redirect(`/assessments/org/${slug}/teams`);

  const cls = await getClassById(tenant.id, classId);
  if (!cls) notFound();

  const userRole = (session.user as { role?: string })?.role ?? "";
  const userId = (session.user as { id?: string })?.id ?? "";

  return (
    <ClassDetailContent
      slug={slug}
      clientId={tenant.id}
      classId={classId}
      classData={cls}
      userRole={userRole}
      userId={userId}
    />
  );
}

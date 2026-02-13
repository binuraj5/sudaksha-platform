import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getCourseById } from "@/lib/services/course-service";
import { CourseDetailContent } from "./CourseDetailContent";

export default async function OrgCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string; courseId: string }>;
}) {
  const session = await getApiSession();
  const { slug, courseId } = await params;

  if (!session) redirect("/assessments/login");

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) notFound();

  const course = await getCourseById(tenant.id, courseId);
  if (!course) notFound();

  const userRole = (session.user as { role?: string })?.role ?? "";
  const userId = (session.user as { id?: string })?.id ?? "";

  return (
    <CourseDetailContent
      slug={slug}
      clientId={tenant.id}
      courseId={courseId}
      course={course}
      userRole={userRole}
      userId={userId}
    />
  );
}

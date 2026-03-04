"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Users, GraduationCap, Pencil, Trash2, Link2, Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EditCourseDialog } from "@/components/courses/EditCourseDialog";
import { DeleteCourseDialog } from "@/components/courses/DeleteCourseDialog";
import { LinkCurriculumDialog } from "@/components/courses/LinkCurriculumDialog";
import { CreateClassDialog } from "@/components/classes/CreateClassDialog";

const basePath = (slug: string) => `/assessments/org/${slug}`;

interface CourseDetailContentProps {
  slug: string;
  clientId: string;
  courseId: string;
  userRole?: string;
  userId?: string;
  course: {
    id: string;
    name: string;
    code: string;
    slug: string;
    yearBegin?: number;
    yearEnd?: number;
    division?: string;
    semesterCount?: number;
    yearCount?: number;
    description?: string;
    department?: { id: string; name: string; code: string };
    classes?: Array<{
      id: string;
      name: string;
      code: string;
      studentCount?: number;
      classTeacher?: { id: string; name: string; email?: string };
    }>;
    curriculum?: Array<{ id: string; name: string; code: string; type: string }>;
  };
}

const CAN_MANAGE_COURSE = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD"];

export function CourseDetailContent({ slug, clientId, courseId, course, userRole = "", userId = "" }: CourseDetailContentProps) {
  const canManageCourse = CAN_MANAGE_COURSE.includes(userRole);
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [linkCurriculumOpen, setLinkCurriculumOpen] = useState(false);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const classCount = course.classes?.length ?? 0;
  const studentCount = course.classes?.reduce((s, c) => s + (c.studentCount ?? 0), 0) ?? 0;
  const departmentId = course.department?.id;
  const yearBegin = course.yearBegin ?? 0;
  const yearEnd = course.yearEnd ?? 0;
  const completionRate =
    yearEnd > yearBegin
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(((new Date().getFullYear() - yearBegin) / (yearEnd - yearBegin)) * 100)
          )
        )
      : 0;
  const curriculumNodeIds = (course.curriculum ?? []).map((c) => c.id);

  const handleDeleteSuccess = () => {
    if (departmentId) {
      router.push(basePath(slug) + "/departments/" + departmentId);
    } else {
      router.push(basePath(slug) + "/departments");
    }
  };

  const breadcrumbItems = [
    { label: "Departments", href: basePath(slug) + "/departments" },
    ...(departmentId && course.department
      ? [{ label: course.department.name, href: basePath(slug) + "/departments/" + departmentId }]
      : []),
    { label: "Courses", href: basePath(slug) + "/courses" },
    { label: course.name },
  ].filter(Boolean) as { label: string; href?: string }[];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} className="mb-2" />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={departmentId ? basePath(slug) + "/departments/" + departmentId : basePath(slug) + "/departments"}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.name}</h1>
            <p className="text-muted-foreground text-sm font-mono">{course.code}</p>
            {course.department && (
              <Link
                href={basePath(slug) + "/departments/" + course.department.id}
                className="text-sm text-primary hover:underline"
              >
                {course.department.name}
              </Link>
            )}
          </div>
        </div>
        {canManageCourse && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Course
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Course
            </Button>
          </div>
        )}
      </div>

      <EditCourseDialog
        slug={slug}
        course={course}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => router.refresh()}
      />
      <DeleteCourseDialog
        slug={slug}
        course={{ id: course.id, name: course.name }}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleDeleteSuccess}
        redirectAfter={departmentId ? basePath(slug) + "/departments/" + departmentId : undefined}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year range</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {course.yearBegin ?? "—"} – {course.yearEnd ?? "—"}
            </div>
            {course.division && (
              <p className="text-xs text-muted-foreground capitalize">{course.division}</p>
            )}
            {(course.semesterCount != null || course.yearCount != null) && (
              <p className="text-xs text-muted-foreground">
                {course.semesterCount != null && `${course.semesterCount} semesters`}
                {course.semesterCount != null && course.yearCount != null && " / "}
                {course.yearCount != null && `${course.yearCount} years`}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Based on year progress</p>
          </CardContent>
        </Card>
      </div>

      {course.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Classes in this course</CardTitle>
          {canManageCourse && departmentId && (
            <Button size="sm" onClick={() => setAddClassOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class to Course
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!course.classes?.length ? (
            <p className="text-sm text-muted-foreground">
              No classes linked yet.{" "}
              {departmentId && (
                <button type="button" className="text-primary hover:underline" onClick={() => setAddClassOpen(true)}>
                  Add a class
                </button>
              )}
            </p>
          ) : (
            <ul className="space-y-2">
              {course.classes.map((cls) => (
                <li key={cls.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <Link
                      href={basePath(slug) + "/classes/" + cls.id}
                      className="font-medium hover:underline"
                    >
                      {cls.name}
                    </Link>
                    <span className="text-xs text-muted-foreground font-mono ml-2">{cls.code}</span>
                    {cls.classTeacher && (
                      <span className="text-xs text-muted-foreground ml-2">
                        · Teacher: {cls.classTeacher.name}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline">{cls.studentCount ?? 0} students</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Linked curriculum</CardTitle>
          {canManageCourse && (
            <Button size="sm" variant="outline" onClick={() => setLinkCurriculumOpen(true)}>
              <Link2 className="h-4 w-4 mr-2" />
              {course.curriculum?.length ? "Edit" : "Link"} curriculum
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {course.curriculum?.length ? (
            <ul className="space-y-1 text-sm">
              {course.curriculum.map((n) => (
                <li key={n.id} className="font-mono text-muted-foreground">
                  {n.code} – {n.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No curriculum linked. Click &quot;Link curriculum&quot; to add.</p>
          )}
        </CardContent>
      </Card>

      <LinkCurriculumDialog
        slug={slug}
        clientId={clientId}
        courseId={courseId}
        currentNodeIds={curriculumNodeIds}
        open={linkCurriculumOpen}
        onOpenChange={setLinkCurriculumOpen}
        onSuccess={() => router.refresh()}
      />

      {departmentId && (
        <CreateClassDialog
          slug={slug}
          clientId={clientId}
          departmentId={departmentId}
          courseId={courseId}
          open={addClassOpen}
          onOpenChange={setAddClassOpen}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}

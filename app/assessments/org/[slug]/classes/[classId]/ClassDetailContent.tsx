"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Users, AlertCircle, Pencil, Trash2, Link2, UserPlus, Upload } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EditClassDialog } from "@/components/classes/EditClassDialog";
import { DeleteClassDialog } from "@/components/classes/DeleteClassDialog";
import { LinkClassToCourseDialog } from "@/components/classes/LinkClassToCourseDialog";
import { AssignClassTeacherDialog } from "@/components/classes/AssignClassTeacherDialog";
import { BulkUploadStudentsDialog } from "@/components/members/BulkUploadStudentsDialog";

const basePath = (slug: string) => `/assessments/org/${slug}`;

const CAN_MANAGE_CLASS_FULL = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD"];

interface ClassDetailContentProps {
  slug: string;
  clientId: string;
  classId: string;
  userRole?: string;
  userId?: string;
  classData: {
    id: string;
    name: string;
    code: string;
    description?: string;
    department?: { id: string; name: string; code: string };
    course?: { id: string; name: string; code: string; slug: string } | null;
    courseId?: string | null;
    classTeacher?: { id: string; name: string; email?: string } | null;
    studentCount?: number;
  };
}

interface StudentRow {
  id: string;
  name: string;
  email: string;
  enrollmentNumber: string | null;
  createdAt: string;
}

export function ClassDetailContent({ slug, clientId, classId, classData, userRole = "", userId = "" }: ClassDetailContentProps) {
  const router = useRouter();
  const canManageClassFull = CAN_MANAGE_CLASS_FULL.includes(userRole);
  const isClassTeacherOfThis = userRole === "CLASS_TEACHER" && classData.classTeacher?.id === userId;
  const canEditDeleteClass = canManageClassFull || isClassTeacherOfThis;
  const canAssignTeacher = canManageClassFull;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [assignTeacherOpen, setAssignTeacherOpen] = useState(false);
  const [uploadStudentsOpen, setUploadStudentsOpen] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const departmentId = classData.department?.id;

  useEffect(() => {
    if (editOpen && departmentId) {
      fetch(`/api/org/${slug}/courses?departmentId=${departmentId}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((list: { id: string; name: string; code: string }[]) => setCourses(list))
        .catch(() => setCourses([]));
    }
  }, [editOpen, slug, departmentId]);

  useEffect(() => {
    setLoadingStudents(true);
    fetch(`/api/org/${slug}/classes/${classId}/members`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [slug, classId]);

  const breadcrumbItems = [
    { label: "Departments", href: basePath(slug) + "/departments" },
    ...(departmentId && classData.department
      ? [{ label: classData.department.name, href: basePath(slug) + "/departments/" + departmentId }]
      : []),
    { label: "Classes", href: basePath(slug) + "/classes" },
    { label: classData.name },
  ].filter(Boolean) as { label: string; href?: string }[];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} className="mb-2" />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={
                departmentId
                  ? basePath(slug) + "/departments/" + departmentId
                  : basePath(slug) + "/departments"
              }
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{classData.name}</h1>
            <p className="text-muted-foreground text-sm font-mono">{classData.code}</p>
            {classData.department && (
              <Link
                href={basePath(slug) + "/departments/" + classData.department.id}
                className="text-sm text-primary hover:underline"
              >
                {classData.department.name}
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canEditDeleteClass && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Class
            </Button>
          )}
          {canAssignTeacher && (
            <Button variant="outline" size="sm" onClick={() => setAssignTeacherOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Assign Class Teacher
            </Button>
          )}
          {canManageClassFull && !classData.course && departmentId && (
            <Button variant="outline" size="sm" onClick={() => setLinkOpen(true)}>
              <Link2 className="h-4 w-4 mr-2" />
              Link to Course
            </Button>
          )}
          {canManageClassFull && (
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Class
            </Button>
          )}
        </div>
      </div>

      <EditClassDialog
        slug={slug}
        classData={{
          id: classData.id,
          name: classData.name,
          code: classData.code,
          description: classData.description,
          courseId: classData.courseId,
          department: classData.department,
        }}
        courses={courses}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => router.refresh()}
      />
      <DeleteClassDialog
        slug={slug}
        classData={{ id: classData.id, name: classData.name }}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => router.push(departmentId ? basePath(slug) + "/departments/" + departmentId : basePath(slug) + "/departments")}
      />
      {departmentId && (
        <LinkClassToCourseDialog
          slug={slug}
          classId={classData.id}
          className={classData.name}
          departmentId={departmentId}
          open={linkOpen}
          onOpenChange={setLinkOpen}
          onSuccess={() => router.refresh()}
        />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course</CardTitle>
          </CardHeader>
          <CardContent>
            {classData.course ? (
              <Link
                href={basePath(slug) + "/courses/" + classData.course.id}
                className="font-medium text-primary hover:underline"
              >
                {classData.course.name}
              </Link>
            ) : (
              <span className="text-amber-600 flex items-center gap-1 text-sm">
                <AlertCircle className="h-4 w-4" />
                Not linked to course
              </span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Teacher</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {classData.classTeacher ? (
              <span className="font-medium">{classData.classTeacher.name}</span>
            ) : (
              <span className="text-muted-foreground text-sm">Not assigned</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.studentCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {classData.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{classData.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Students</CardTitle>
          {canEditDeleteClass && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={basePath(slug) + "/employees/new?departmentId=" + (departmentId ?? "") + "&orgUnitId=" + classId}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => setUploadStudentsOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Students
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loadingStudents ? (
            <p className="text-sm text-muted-foreground">Loading students…</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students in this class.{" "}
              <Link href={basePath(slug) + "/employees/new?departmentId=" + (departmentId ?? "") + "&orgUnitId=" + classId} className="text-primary hover:underline">
                Add a student
              </Link>{" "}
              or{" "}
              <button type="button" className="text-primary hover:underline" onClick={() => setUploadStudentsOpen(true)}>
                upload students
              </button>{" "}
              (use class_code: <strong>{classData.code}</strong> in CSV).
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Enrollment #</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="font-mono text-sm">{s.enrollmentNumber ?? "—"}</TableCell>
                      <TableCell className="text-sm">{s.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="h-8 px-2" asChild>
                          <Link href={basePath(slug) + "/employees?dept=" + (departmentId ?? "")}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AssignClassTeacherDialog
        slug={slug}
        clientId={clientId}
        classId={classId}
        className={classData.name}
        currentManagerId={classData.classTeacher?.id ?? null}
        open={assignTeacherOpen}
        onOpenChange={setAssignTeacherOpen}
        onSuccess={() => router.refresh()}
      />

      <BulkUploadStudentsDialog
        slug={slug}
        clientId={clientId}
        open={uploadStudentsOpen}
        onOpenChange={setUploadStudentsOpen}
        onSuccess={() => {
          setUploadStudentsOpen(false);
          setLoadingStudents(true);
          fetch(`/api/org/${slug}/classes/${classId}/members`)
            .then((r) => (r.ok ? r.json() : []))
            .then(setStudents)
            .catch(() => setStudents([]))
            .finally(() => setLoadingStudents(false));
          router.refresh();
        }}
      />
    </div>
  );
}

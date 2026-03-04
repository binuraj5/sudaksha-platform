"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Users, GraduationCap, AlertCircle, Pencil, Trash2, Link2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { BulkUploadCoursesDialog } from "@/components/courses/BulkUploadCoursesDialog";
import { BulkUploadClassesDialog } from "@/components/classes/BulkUploadClassesDialog";
import { CreateCourseDialog } from "@/components/courses/CreateCourseDialog";
import { CreateClassDialog } from "@/components/classes/CreateClassDialog";
import { EditCourseDialog } from "@/components/courses/EditCourseDialog";
import { DeleteCourseDialog } from "@/components/courses/DeleteCourseDialog";
import { EditClassDialog } from "@/components/classes/EditClassDialog";
import { DeleteClassDialog } from "@/components/classes/DeleteClassDialog";
import { LinkClassToCourseDialog } from "@/components/classes/LinkClassToCourseDialog";
import { BulkUploadStudentsDialog } from "@/components/members/BulkUploadStudentsDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const basePath = (slug: string) => `/assessments/org/${slug}`;

interface InstitutionDepartmentDetailContentProps {
  slug: string;
  clientId: string;
  deptId: string;
  department: {
    id: string;
    name: string;
    code: string;
    description?: string;
    manager?: { id: string; name: string; email?: string; avatar?: string };
    classCount: number;
    memberCount: number;
  };
}

export function InstitutionDepartmentDetailContent({
  slug,
  clientId,
  deptId,
  department,
}: InstitutionDepartmentDetailContentProps) {
  const [courses, setCourses] = useState<Array<{
    id: string;
    name: string;
    code: string;
    slug: string;
    yearBegin?: number;
    yearEnd?: number;
    division?: string;
    classCount: number;
    studentCount: number;
    department?: { id: string; name: string; code: string };
  }>>([]);
  const [classes, setClasses] = useState<Array<{
    id: string;
    name: string;
    code: string;
    description?: string;
    course: { id: string; name: string; code: string; slug: string } | null;
    classTeacher?: { id: string; name: string; email?: string };
    studentCount: number;
  }>>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [coursesRefresh, setCoursesRefresh] = useState(0);
  const [classesRefresh, setClassesRefresh] = useState(0);
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<typeof courses[0] | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<{ id: string; name: string } | null>(null);
  const [editClass, setEditClass] = useState<typeof classes[0] | null>(null);
  const [deleteClass, setDeleteClass] = useState<{ id: string; name: string } | null>(null);
  const [linkClass, setLinkClass] = useState<typeof classes[0] | null>(null);
  const [departmentCourses, setDepartmentCourses] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [members, setMembers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    enrollmentNumber: string | null;
    type: string;
    role: string;
    orgUnit: { id: string; name: string; code: string; type: string } | null;
    course: { id: string; name: string; code: string } | null;
  }>>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersRefresh, setMembersRefresh] = useState(0);
  const [membersFilterRole, setMembersFilterRole] = useState<string>("all");
  const [membersFilterClassId, setMembersFilterClassId] = useState<string>("all");
  const [membersFilterCourseId, setMembersFilterCourseId] = useState<string>("all");
  const [uploadStudentsOpen, setUploadStudentsOpen] = useState(false);

  useEffect(() => {
    setLoadingCourses(true);
    fetch(`/api/org/${slug}/courses?departmentId=${deptId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, [slug, deptId, coursesRefresh]);

  useEffect(() => {
    setLoadingClasses(true);
    fetch(`/api/org/${slug}/departments/${deptId}/classes`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setLoadingClasses(false));
  }, [slug, deptId, classesRefresh]);

  useEffect(() => {
    if (editClass) {
      fetch(`/api/org/${slug}/courses?departmentId=${deptId}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((list: { id: string; name: string; code: string }[]) => setDepartmentCourses(list))
        .catch(() => setDepartmentCourses([]));
    }
  }, [editClass, slug, deptId]);

  useEffect(() => {
    setLoadingMembers(true);
    const params = new URLSearchParams();
    if (membersFilterRole !== "all") params.set("role", membersFilterRole);
    if (membersFilterClassId !== "all") params.set("classId", membersFilterClassId);
    if (membersFilterCourseId !== "all") params.set("courseId", membersFilterCourseId);
    const qs = params.toString();
    fetch(`/api/org/${slug}/departments/${deptId}/members${qs ? `?${qs}` : ""}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false));
  }, [slug, deptId, membersRefresh, membersFilterRole, membersFilterClassId, membersFilterCourseId]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Departments", href: basePath(slug) + "/departments" },
          { label: department.name },
        ]}
        className="mb-2"
      />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={basePath(slug) + "/departments"}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{department.name}</h1>
          <p className="text-muted-foreground text-sm font-mono">{department.code}</p>
          {department.manager && (
            <p className="text-sm text-muted-foreground mt-1">
              Head: {department.manager.name}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classes</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{department.classCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{department.memberCount}</div>
              </CardContent>
            </Card>
          </div>
          {department.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{department.description}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold">Courses in this department</h3>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setCreateCourseOpen(true)}>
                Add Course
              </Button>
              <BulkUploadCoursesDialog slug={slug} departmentId={deptId} onSuccess={() => setCoursesRefresh((k) => k + 1)} />
            </div>
          </div>
          <CreateCourseDialog
            slug={slug}
            clientId={clientId}
            departmentId={deptId}
            open={createCourseOpen}
            onOpenChange={setCreateCourseOpen}
            onSuccess={() => setCoursesRefresh((k) => k + 1)}
          />
          {loadingCourses ? (
            <p className="text-sm text-muted-foreground">Loading courses…</p>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No courses yet. Add a course to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {courses.map((c) => (
                <Card key={c.id}>
                  <CardContent className="py-4 flex flex-row items-center justify-between gap-2">
                    <div>
                      <Link
                        href={basePath(slug) + "/courses/" + c.id}
                        className="font-medium hover:underline"
                      >
                        {c.name}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">
                        {c.code}
                        {c.yearBegin != null && c.yearEnd != null && ` · ${c.yearBegin}–${c.yearEnd}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{c.classCount} classes</Badge>
                      <Badge variant="outline">{c.studentCount} students</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={basePath(slug) + "/courses/" + c.id}>View</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditCourse(c)}
                        aria-label="Edit course"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteCourse({ id: c.id, name: c.name })}
                        aria-label="Delete course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {editCourse && (
            <EditCourseDialog
              slug={slug}
              course={{
                id: editCourse.id,
                name: editCourse.name,
                code: editCourse.code,
                slug: editCourse.slug,
                yearBegin: editCourse.yearBegin,
                yearEnd: editCourse.yearEnd,
                division: editCourse.division,
                description: undefined,
              }}
              open={!!editCourse}
              onOpenChange={(open) => !open && setEditCourse(null)}
              onSuccess={() => {
                setEditCourse(null);
                setCoursesRefresh((k) => k + 1);
              }}
            />
          )}
          {deleteCourse && (
            <DeleteCourseDialog
              slug={slug}
              course={deleteCourse}
              open={!!deleteCourse}
              onOpenChange={(open) => !open && setDeleteCourse(null)}
              onSuccess={() => {
                setDeleteCourse(null);
                setCoursesRefresh((k) => k + 1);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold">Classes in this department</h3>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setCreateClassOpen(true)}>
                Add Class
              </Button>
              <BulkUploadClassesDialog slug={slug} departmentId={deptId} onSuccess={() => setClassesRefresh((k) => k + 1)} />
            </div>
          </div>
          <CreateClassDialog
            slug={slug}
            clientId={clientId}
            departmentId={deptId}
            open={createClassOpen}
            onOpenChange={setCreateClassOpen}
            onSuccess={() => setClassesRefresh((k) => k + 1)}
          />
          {loadingClasses ? (
            <p className="text-sm text-muted-foreground">Loading classes…</p>
          ) : classes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No classes yet. Add a class to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {classes.map((cls) => (
                <Card key={cls.id}>
                  <CardContent className="py-4 flex flex-row items-center justify-between gap-2">
                    <div>
                      <Link
                        href={basePath(slug) + "/classes/" + cls.id}
                        className="font-medium hover:underline"
                      >
                        {cls.name}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">{cls.code}</p>
                      {cls.course ? (
                        <Link
                          href={basePath(slug) + "/courses/" + cls.course.id}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {cls.course.name}
                        </Link>
                      ) : (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Not linked to course
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {cls.classTeacher && (
                        <span className="text-xs text-muted-foreground">
                          Teacher: {cls.classTeacher.name}
                        </span>
                      )}
                      <Badge variant="outline">{cls.studentCount} students</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={basePath(slug) + "/classes/" + cls.id}>View</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditClass(cls)}
                        aria-label="Edit class"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!cls.course && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setLinkClass(cls)}
                          aria-label="Link to course"
                          title="Link to course"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteClass({ id: cls.id, name: cls.name })}
                        aria-label="Delete class"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {editClass && (
            <EditClassDialog
              slug={slug}
              classData={{
                id: editClass.id,
                name: editClass.name,
                code: editClass.code,
                description: editClass.description,
                courseId: editClass.course?.id ?? null,
                department: { id: deptId },
              }}
              courses={departmentCourses}
              open={!!editClass}
              onOpenChange={(open) => !open && setEditClass(null)}
              onSuccess={() => {
                setEditClass(null);
                setClassesRefresh((k) => k + 1);
              }}
            />
          )}
          {deleteClass && (
            <DeleteClassDialog
              slug={slug}
              classData={deleteClass}
              open={!!deleteClass}
              onOpenChange={(open) => !open && setDeleteClass(null)}
              onSuccess={() => {
                setDeleteClass(null);
                setClassesRefresh((k) => k + 1);
              }}
            />
          )}
          {linkClass && (
            <LinkClassToCourseDialog
              slug={slug}
              classId={linkClass.id}
              className={linkClass.name}
              departmentId={deptId}
              open={!!linkClass}
              onOpenChange={(open) => !open && setLinkClass(null)}
              onSuccess={() => {
                setLinkClass(null);
                setClassesRefresh((k) => k + 1);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-lg font-semibold">Members</h3>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href={basePath(slug) + "/employees/new?departmentId=" + deptId}>
                  Add Student
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={basePath(slug) + "/faculty/new?departmentId=" + deptId}>
                  Add Faculty
                </Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => setUploadStudentsOpen(true)}>
                Upload Students
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-end rounded-lg border p-4 bg-muted/30">
            <div className="space-y-2">
              <Label className="text-xs">Role</Label>
              <Select value={membersFilterRole} onValueChange={setMembersFilterRole}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="EMPLOYEE">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Class</Label>
              <Select value={membersFilterClassId} onValueChange={setMembersFilterClassId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Course</Label>
              <Select value={membersFilterCourseId} onValueChange={setMembersFilterCourseId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All courses</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {loadingMembers ? (
            <p className="text-sm text-muted-foreground">Loading members…</p>
          ) : members.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No members in this department.{" "}
                <Link href={basePath(slug) + "/employees/new?departmentId=" + deptId} className="text-primary hover:underline">
                  Add a student
                </Link>
                ,{" "}
                <Link href={basePath(slug) + "/faculty/new?departmentId=" + deptId} className="text-primary hover:underline">
                  add faculty
                </Link>
                , or{" "}
                <button type="button" className="text-primary hover:underline" onClick={() => setUploadStudentsOpen(true)}>
                  upload students
                </button>.
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Enrollment #</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="font-mono text-sm">{m.enrollmentNumber ?? "—"}</TableCell>
                      <TableCell className="text-sm">{m.email}</TableCell>
                      <TableCell className="text-sm">{m.orgUnit?.type === "CLASS" ? m.orgUnit?.name : "—"}</TableCell>
                      <TableCell className="text-sm">{m.course?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm capitalize">{m.type === "STUDENT" ? "Student" : "Faculty"}</TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="h-8 px-2" asChild>
                          <Link href={basePath(slug) + "/employees?dept=" + deptId}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <BulkUploadStudentsDialog
            slug={slug}
            clientId={clientId}
            departmentId={deptId}
            open={uploadStudentsOpen}
            onOpenChange={setUploadStudentsOpen}
            onSuccess={() => setMembersRefresh((k) => k + 1)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

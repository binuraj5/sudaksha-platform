"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Plus, Pencil, Trash2, Link2, Users } from "lucide-react";
import { CreateClassDialog } from "@/components/classes/CreateClassDialog";
import { EditClassDialog } from "@/components/classes/EditClassDialog";
import { DeleteClassDialog } from "@/components/classes/DeleteClassDialog";
import { LinkClassToCourseDialog } from "@/components/classes/LinkClassToCourseDialog";

const basePath = (slug: string) => `/assessments/org/${slug}`;

interface ClassRow {
  id: string;
  name: string;
  code: string;
  description?: string;
  course: { id: string; name: string; code: string; slug: string } | null;
  courseId: string | null;
  classTeacher?: { id: string; name: string; email?: string } | null;
  studentCount: number;
  department?: { id: string; name: string; code: string } | null;
}

interface CourseOption {
  id: string;
  name: string;
  code: string;
  slug: string;
  department?: { id: string; name: string; code: string } | null;
}

interface ClassesPageContentProps {
  slug: string;
  clientId: string;
  defaultDepartmentId?: string;
}

export function ClassesPageContent({ slug, clientId, defaultDepartmentId }: ClassesPageContentProps) {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editClass, setEditClass] = useState<ClassRow | null>(null);
  const [deleteClass, setDeleteClass] = useState<{ id: string; name: string } | null>(null);
  const [linkClass, setLinkClass] = useState<ClassRow | null>(null);
  const [editClassCourses, setEditClassCourses] = useState<Array<{ id: string; name: string; code: string }>>([]);

  const [filterDeptId, setFilterDeptId] = useState<string>(defaultDepartmentId ?? "all");
  const [filterCourseId, setFilterCourseId] = useState<string>("all");

  useEffect(() => {
    if (editClass?.department?.id) {
      fetch(`/api/org/${slug}/courses?departmentId=${editClass.department.id}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: { id: string; name: string; code: string }[]) => setEditClassCourses(data))
        .catch(() => setEditClassCourses([]));
    } else {
      setEditClassCourses([]);
    }
  }, [slug, editClass?.department?.id]);

  useEffect(() => {
    fetch(`/api/clients/${clientId}/departments`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { id: string; name: string; code: string }[]) => setDepartments(data))
      .catch(() => setDepartments([]));
  }, [clientId]);

  useEffect(() => {
    const url =
      filterDeptId && filterDeptId !== "all"
        ? `/api/org/${slug}/courses?departmentId=${filterDeptId}`
        : `/api/org/${slug}/courses`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: CourseOption[]) => setCourses(data))
      .catch(() => setCourses([]));
  }, [slug, filterDeptId]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterDeptId && filterDeptId !== "all") params.set("departmentId", filterDeptId);
    if (filterCourseId && filterCourseId !== "all") params.set("courseId", filterCourseId);
    const qs = params.toString();
    const url = `/api/org/${slug}/classes${qs ? `?${qs}` : ""}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, [slug, filterDeptId, filterCourseId]);

  const refresh = () => {
    const params = new URLSearchParams();
    if (filterDeptId && filterDeptId !== "all") params.set("departmentId", filterDeptId);
    if (filterCourseId && filterCourseId !== "all") params.set("courseId", filterCourseId);
    const qs = params.toString();
    fetch(`/api/org/${slug}/classes${qs ? `?${qs}` : ""}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setClasses)
      .catch(() => setClasses([]));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={basePath(slug) + "/departments"}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Classes</h1>
          <p className="text-muted-foreground text-sm">
            All classes across departments. Filter by department or course.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-end rounded-lg border p-4 bg-muted/30">
        <div className="space-y-2">
          <Label className="text-xs">Department</Label>
          <Select value={filterDeptId} onValueChange={(v) => { setFilterDeptId(v); setFilterCourseId("all"); }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Course</Label>
          <Select value={filterCourseId} onValueChange={setFilterCourseId}>
            <SelectTrigger className="w-[220px]">
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

      <div className="rounded-md border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading classes…</div>
        ) : classes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No classes found. Add a class from a department or change filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Class Teacher</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={basePath(slug) + "/classes/" + c.id}
                      className="font-medium hover:underline flex items-center gap-1"
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{c.code}</TableCell>
                  <TableCell>
                    {c.department ? (
                      <Link
                        href={basePath(slug) + "/departments/" + c.department.id}
                        className="text-primary hover:underline text-sm"
                      >
                        {c.department.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.course ? (
                      <Link
                        href={basePath(slug) + "/courses/" + c.course.id}
                        className="text-primary hover:underline text-sm"
                      >
                        {c.course.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not linked</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.classTeacher?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">{c.studentCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="link" size="sm" className="h-8 px-2" asChild>
                        <Link href={basePath(slug) + "/classes/" + c.id}>View</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditClass(c)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!c.courseId && c.department && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setLinkClass(c)}
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
                        onClick={() => setDeleteClass({ id: c.id, name: c.name })}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateClassDialog
        slug={slug}
        clientId={clientId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={refresh}
      />

      {editClass && (
        <EditClassDialog
          slug={slug}
          classData={{
            id: editClass.id,
            name: editClass.name,
            code: editClass.code,
            description: editClass.description,
            courseId: editClass.courseId ?? null,
            department: editClass.department ? { id: editClass.department.id } : undefined,
          }}
          courses={editClassCourses}
          open={!!editClass}
          onOpenChange={(open) => !open && setEditClass(null)}
          onSuccess={() => {
            setEditClass(null);
            refresh();
          }}
        />
      )}

      {deleteClass && (
        <DeleteClassDialog
          slug={slug}
          classData={{ id: deleteClass.id, name: deleteClass.name }}
          open={!!deleteClass}
          onOpenChange={(open) => !open && setDeleteClass(null)}
          onSuccess={() => {
            setDeleteClass(null);
            refresh();
          }}
        />
      )}

      {linkClass && linkClass.department && (
        <LinkClassToCourseDialog
          slug={slug}
          classId={linkClass.id}
          className={linkClass.name}
          departmentId={linkClass.department.id}
          open={!!linkClass}
          onOpenChange={(open) => !open && setLinkClass(null)}
          onSuccess={() => {
            setLinkClass(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

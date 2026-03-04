"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { CreateCourseDialog } from "@/components/courses/CreateCourseDialog";
import { EditCourseDialog } from "@/components/courses/EditCourseDialog";
import { DeleteCourseDialog } from "@/components/courses/DeleteCourseDialog";

const basePath = (slug: string) => `/assessments/org/${slug}`;

interface CourseRow {
  id: string;
  name: string;
  code: string;
  slug: string;
  yearBegin?: number;
  yearEnd?: number;
  division?: string;
  semesterCount?: number;
  yearCount?: number;
  classCount: number;
  studentCount: number;
  department?: { id: string; name: string; code: string } | null;
}

interface CoursesPageContentProps {
  slug: string;
  clientId: string;
  defaultDepartmentId?: string;
}

export function CoursesPageContent({ slug, clientId, defaultDepartmentId }: CoursesPageContentProps) {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseRow | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<{ id: string; name: string } | null>(null);

  const [filterDeptId, setFilterDeptId] = useState<string>(defaultDepartmentId ?? "all");
  const [filterYearFrom, setFilterYearFrom] = useState<string>("");
  const [filterYearTo, setFilterYearTo] = useState<string>("");
  const [filterDivision, setFilterDivision] = useState<string>("");

  useEffect(() => {
    fetch(`/api/clients/${clientId}/departments`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { id: string; name: string; code: string }[]) => setDepartments(data))
      .catch(() => setDepartments([]));
  }, [clientId]);

  useEffect(() => {
    setLoading(true);
    const url =
      filterDeptId && filterDeptId !== "all"
        ? `/api/org/${slug}/courses?departmentId=${filterDeptId}`
        : `/api/org/${slug}/courses`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [slug, filterDeptId]);

  const filtered = useMemo(() => {
    let list = courses;
    if (filterYearFrom) {
      const from = parseInt(filterYearFrom, 10);
      if (!isNaN(from)) list = list.filter((c) => (c.yearBegin ?? 0) >= from);
    }
    if (filterYearTo) {
      const to = parseInt(filterYearTo, 10);
      if (!isNaN(to)) list = list.filter((c) => (c.yearEnd ?? 0) <= to);
    }
    if (filterDivision) {
      list = list.filter((c) => (c.division ?? "") === filterDivision);
    }
    return list;
  }, [courses, filterYearFrom, filterYearTo, filterDivision]);

  const refresh = () => {
    const url =
      filterDeptId && filterDeptId !== "all"
        ? `/api/org/${slug}/courses?departmentId=${filterDeptId}`
        : `/api/org/${slug}/courses`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCourses)
      .catch(() => setCourses([]));
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
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground text-sm">
            All courses across departments. Use filters to narrow down.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-end rounded-lg border p-4 bg-muted/30">
        <div className="space-y-2">
          <Label className="text-xs">Department</Label>
          <Select value={filterDeptId} onValueChange={setFilterDeptId}>
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
          <Label className="text-xs">Year from</Label>
          <Input
            type="number"
            placeholder="e.g. 2020"
            className="w-[120px]"
            value={filterYearFrom}
            onChange={(e) => setFilterYearFrom(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Year to</Label>
          <Input
            type="number"
            placeholder="e.g. 2027"
            className="w-[120px]"
            value={filterYearTo}
            onChange={(e) => setFilterYearTo(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Division</Label>
          <Select value={filterDivision || "all"} onValueChange={(v) => setFilterDivision(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="SEMESTER">Semester</SelectItem>
              <SelectItem value="YEAR">Year</SelectItem>
              <SelectItem value="BOTH">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading courses…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No courses found. Add a course to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Year range</TableHead>
                <TableHead>Division</TableHead>
                <TableHead className="text-right">Classes</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={basePath(slug) + "/courses/" + c.id}
                      className="font-medium hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
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
                  <TableCell className="text-sm">
                    {c.yearBegin != null && c.yearEnd != null
                      ? `${c.yearBegin} – ${c.yearEnd}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {c.division ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">{c.classCount}</TableCell>
                  <TableCell className="text-right">{c.studentCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="link" size="sm" className="h-8 px-2" asChild>
                        <Link href={basePath(slug) + "/courses/" + c.id}>View</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditCourse(c)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteCourse({ id: c.id, name: c.name })}
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

      <CreateCourseDialog
        slug={slug}
        clientId={clientId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={refresh}
      />

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
            semesterCount: editCourse.semesterCount,
            yearCount: editCourse.yearCount,
            description: undefined,
          }}
          open={!!editCourse}
          onOpenChange={(open) => !open && setEditCourse(null)}
          onSuccess={() => {
            setEditCourse(null);
            refresh();
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
            refresh();
          }}
        />
      )}
    </div>
  );
}

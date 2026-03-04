"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateClassDialogProps {
  slug: string;
  clientId: string;
  departmentId?: string;
  courseId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Course {
  id: string;
  name: string;
  code: string;
  slug: string;
}

export function CreateClassDialog({
  slug,
  clientId,
  departmentId: initialDepartmentId,
  courseId: initialCourseId,
  open,
  onOpenChange,
  onSuccess,
}: CreateClassDialogProps) {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string; code: string }[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    departmentId: initialDepartmentId ?? "",
    courseId: initialCourseId ?? "",
    description: "",
  });

  useEffect(() => {
    if (open && clientId) {
      fetch(`/api/clients/${clientId}/departments`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: { id: string; name: string; code: string }[]) => {
          setDepartments(data);
          if (initialDepartmentId) setForm((f) => ({ ...f, departmentId: initialDepartmentId }));
        })
        .catch(() => setDepartments([]));
    }
  }, [open, clientId, initialDepartmentId]);

  useEffect(() => {
    if (open && (form.departmentId || initialDepartmentId)) {
      const deptId = form.departmentId || initialDepartmentId;
      fetch(`/api/org/${slug}/courses?departmentId=${deptId}`)
        .then((r) => (r.ok ? r.json() : []))
        .then(setCourses)
        .catch(() => setCourses([]));
    } else {
      setCourses([]);
    }
  }, [open, slug, form.departmentId, initialDepartmentId]);

  useEffect(() => {
    if (open && initialDepartmentId) setForm((f) => ({ ...f, departmentId: initialDepartmentId }));
  }, [open, initialDepartmentId]);

  useEffect(() => {
    if (open && initialCourseId) setForm((f) => ({ ...f, courseId: initialCourseId }));
  }, [open, initialCourseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departmentId) {
      toast.error("Select a department");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${slug}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          departmentId: form.departmentId,
          courseId: form.courseId || undefined,
          description: form.description || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Class created");
        onOpenChange(false);
        setForm({
          name: "",
          code: "",
          departmentId: initialDepartmentId ?? "",
          courseId: "",
          description: "",
        });
        onSuccess?.();
      } else {
        toast.error(data.error || "Failed to create class");
      }
    } catch {
      toast.error("Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Section A"
              required
            />
          </div>
          <div>
            <Label>Code</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="e.g. CSE-A-2023"
              required
            />
          </div>
          <div>
            <Label>Department</Label>
            <Select
              value={form.departmentId}
              onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v, courseId: "" }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Course (optional)</Label>
            <Select
              value={form.courseId || "__none__"}
              onValueChange={(v) => setForm((f) => ({ ...f, courseId: v === "__none__" ? "" : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

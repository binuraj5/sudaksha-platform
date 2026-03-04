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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditCourseDialogProps {
  slug: string;
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
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditCourseDialog({
  slug,
  course,
  open,
  onOpenChange,
  onSuccess,
}: EditCourseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: course.name,
    description: course.description ?? "",
    yearEnd: course.yearEnd ?? new Date().getFullYear(),
    slug: course.slug,
  });

  useEffect(() => {
    if (open && course) {
      setForm({
        name: course.name,
        description: course.description ?? "",
        yearEnd: course.yearEnd ?? new Date().getFullYear(),
        slug: course.slug,
      });
    }
  }, [open, course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${slug}/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          yearEnd: form.yearEnd,
          slug: form.slug,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Course updated");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(data.error || "Failed to update course");
      }
    } catch {
      toast.error("Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="URL-friendly identifier"
            />
          </div>
          <div>
            <Label>Year End (can extend duration)</Label>
            <Input
              type="number"
              value={form.yearEnd}
              onChange={(e) => setForm((f) => ({ ...f, yearEnd: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>
          <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Read-only</p>
            <p>Code: {course.code}</p>
            <p>Year Begin: {course.yearBegin ?? "—"}</p>
            <p>Division: {course.division ?? "—"}</p>
            {(course.division === "SEMESTER" || course.division === "BOTH") && course.semesterCount != null && (
              <p>Semester count: {course.semesterCount}</p>
            )}
            {(course.division === "YEAR" || course.division === "BOTH") && course.yearCount != null && (
              <p>Year count: {course.yearCount}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

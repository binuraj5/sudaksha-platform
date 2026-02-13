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

interface CreateCourseDialogProps {
  slug: string;
  clientId: string;
  departmentId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export function CreateCourseDialog({
  slug,
  clientId,
  departmentId: initialDepartmentId,
  open,
  onOpenChange,
  onSuccess,
}: CreateCourseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    departmentId: initialDepartmentId ?? "",
    yearBegin: new Date().getFullYear(),
    yearEnd: new Date().getFullYear() + 4,
    division: "BOTH" as "SEMESTER" | "YEAR" | "BOTH",
    semesterCount: 8,
    yearCount: 4,
    description: "",
  });

  useEffect(() => {
    if (open && clientId) {
      fetch(`/api/clients/${clientId}/departments`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: { id: string; name: string; code: string }[]) => setDepartments(data))
        .catch(() => setDepartments([]));
    }
  }, [open, clientId]);

  useEffect(() => {
    if (open && initialDepartmentId) setForm((f) => ({ ...f, departmentId: initialDepartmentId }));
  }, [open, initialDepartmentId]);

  useEffect(() => {
    if (open && departments.length && !form.departmentId && initialDepartmentId) {
      setForm((f) => ({ ...f, departmentId: initialDepartmentId }));
    }
  }, [open, departments, initialDepartmentId, form.departmentId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departmentId) {
      toast.error("Select a department");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${slug}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          departmentId: form.departmentId,
          yearBegin: form.yearBegin,
          yearEnd: form.yearEnd,
          division: form.division,
          semesterCount: form.division === "YEAR" ? undefined : form.semesterCount,
          yearCount: form.division === "SEMESTER" ? undefined : form.yearCount,
          description: form.description || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Course created");
        onOpenChange(false);
        setForm({
          name: "",
          code: "",
          departmentId: initialDepartmentId ?? "",
          yearBegin: new Date().getFullYear(),
          yearEnd: new Date().getFullYear() + 4,
          division: "BOTH",
          semesterCount: 8,
          yearCount: 4,
          description: "",
        });
        onSuccess?.();
      } else {
        toast.error(data.error || "Failed to create course");
      }
    } catch {
      toast.error("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>Add Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 flex">
          <div className="overflow-y-auto px-6 space-y-4 flex-1 min-h-0 max-h-[60vh]">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. B.Tech Computer Science"
              required
            />
          </div>
          <div>
            <Label>Code</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="e.g. BTECH-CSE"
              required
            />
          </div>
          <div>
            <Label>Department</Label>
            <Select
              value={form.departmentId}
              onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Year begin</Label>
              <Input
                type="number"
                value={form.yearBegin}
                onChange={(e) => setForm((f) => ({ ...f, yearBegin: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>
            <div>
              <Label>Year end</Label>
              <Input
                type="number"
                value={form.yearEnd}
                onChange={(e) => setForm((f) => ({ ...f, yearEnd: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>
          </div>
          <div>
            <Label>Division</Label>
            <Select
              value={form.division}
              onValueChange={(v) => setForm((f) => ({ ...f, division: v as "SEMESTER" | "YEAR" | "BOTH" }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEMESTER">Semester</SelectItem>
                <SelectItem value="YEAR">Year</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(form.division === "SEMESTER" || form.division === "BOTH") && (
            <div>
              <Label>Semester count</Label>
              <Input
                type="number"
                value={form.semesterCount}
                onChange={(e) => setForm((f) => ({ ...f, semesterCount: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>
          )}
          {(form.division === "YEAR" || form.division === "BOTH") && (
            <div>
              <Label>Year count</Label>
              <Input
                type="number"
                value={form.yearCount}
                onChange={(e) => setForm((f) => ({ ...f, yearCount: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>
          )}
          <div>
            <Label>Description (optional)</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description"
            />
          </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t shrink-0">
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

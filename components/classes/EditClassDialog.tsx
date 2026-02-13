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

interface EditClassDialogProps {
  slug: string;
  classData: {
    id: string;
    name: string;
    code: string;
    description?: string;
    courseId?: string | null;
    department?: { id: string };
  };
  courses: Array<{ id: string; name: string; code: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditClassDialog({
  slug,
  classData,
  courses,
  open,
  onOpenChange,
  onSuccess,
}: EditClassDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: classData.name,
    description: classData.description ?? "",
    courseId: classData.courseId ?? "",
  });

  useEffect(() => {
    if (open && classData) {
      setForm({
        name: classData.name,
        description: classData.description ?? "",
        courseId: classData.courseId ?? "",
      });
    }
  }, [open, classData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${slug}/classes/${classData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          courseId: form.courseId || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Class updated");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(data.error || "Failed to update class");
      }
    } catch {
      toast.error("Failed to update class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
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
            <Label>Course (optional)</Label>
            <Select
              value={form.courseId}
              onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Read-only</p>
            <p>Code: {classData.code}</p>
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

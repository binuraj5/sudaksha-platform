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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LinkClassToCourseDialogProps {
  slug: string;
  classId: string;
  className: string;
  departmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Course {
  id: string;
  name: string;
  code: string;
  yearBegin?: number;
  yearEnd?: number;
}

export function LinkClassToCourseDialog({
  slug,
  classId,
  className,
  departmentId,
  open,
  onOpenChange,
  onSuccess,
}: LinkClassToCourseDialogProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && departmentId) {
      fetch(`/api/org/${slug}/courses?departmentId=${departmentId}`)
        .then((r) => (r.ok ? r.json() : []))
        .then(setCourses)
        .catch(() => setCourses([]));
      setSelectedCourseId("");
    }
  }, [open, slug, departmentId]);

  const handleLink = async () => {
    if (!selectedCourseId) {
      toast.error("Select a course");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${slug}/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Class linked to course successfully");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(data.error || "Failed to link class");
      }
    } catch {
      toast.error("Failed to link class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link {className} to Course</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Select a course from the same department to link this class. Students can only be assigned
          after the class is linked.
        </p>
        <div>
          <Label>Course</Label>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.code})
                  {c.yearBegin != null && c.yearEnd != null
                    ? ` - ${c.yearBegin}-${c.yearEnd}`
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleLink} disabled={!selectedCourseId || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Link to Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

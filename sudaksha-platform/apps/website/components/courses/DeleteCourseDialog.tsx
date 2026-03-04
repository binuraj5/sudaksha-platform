"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteCourseDialogProps {
  slug: string;
  course: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  redirectAfter?: string;
}

export function DeleteCourseDialog({
  slug,
  course,
  open,
  onOpenChange,
  onSuccess,
  redirectAfter,
}: DeleteCourseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/${slug}/courses/${course.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Course deleted successfully");
        onOpenChange(false);
        onSuccess?.();
        if (redirectAfter) {
          window.location.href = redirectAfter;
        }
      } else {
        setError(data.error?.message || data.error || "Failed to delete course");
      }
    } catch {
      setError("Failed to delete course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Course</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{course.name}</strong>? This action cannot be
            undone. All linked classes will be unlinked.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
            {error.includes("students") && (
              <p className="mt-2 text-muted-foreground">
                <strong>Tip:</strong> Move students to other classes first, or archive the course
                instead of deleting.
              </p>
            )}
          </div>
        )}
        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Delete Course
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

type AssessmentModel = { id: string; name: string; description?: string | null };

export function AssignAssessmentToClassDialog({
  open,
  onOpenChange,
  slug,
  classId,
  className,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  classId: string;
  className: string;
  onSuccess?: () => void;
}) {
  const [models, setModels] = useState<AssessmentModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/assessments/admin/models?limit=50")
      .then((r) => r.json())
      .then((data) => setModels(Array.isArray(data?.models) ? data.models : data?.models ?? []))
      .catch(() => setModels([]));
    setSelectedModelId("");
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedModelId) {
      toast.error("Select an assessment");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/org/${slug}/assessments/assign-unit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgUnitId: classId, modelId: selectedModelId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to assign");
      }
      toast.success(data.message ?? `Assessment assigned to class ${className}`);
      onOpenChange(false);
      onSuccess?.();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to assign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign assessment to class</DialogTitle>
          <DialogDescription>
            Assign an assessment to all members in &quot;{className}&quot;. Each student in this class will receive the assessment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Assessment</Label>
            <Select value={selectedModelId} onValueChange={setSelectedModelId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select assessment" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {m.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {models.length === 0 && open && (
              <p className="text-sm text-muted-foreground mt-1">Loading assessments…</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !selectedModelId}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning…
              </>
            ) : (
              "Assign to class"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

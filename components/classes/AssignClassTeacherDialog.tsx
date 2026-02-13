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

interface AssignClassTeacherDialogProps {
  slug: string;
  clientId: string;
  classId: string;
  className: string;
  currentManagerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FacultyMember {
  id: string;
  name: string;
  email: string;
}

export function AssignClassTeacherDialog({
  slug,
  clientId,
  classId,
  className,
  currentManagerId,
  open,
  onOpenChange,
  onSuccess,
}: AssignClassTeacherDialogProps) {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [selectedId, setSelectedId] = useState<string>(currentManagerId ?? "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && clientId) {
      setLoading(true);
      fetch(`/api/clients/${clientId}/employees?simple=true&type=EMPLOYEE`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: { id: string; name: string; email: string }[]) => {
          setFaculty(data);
          setSelectedId(currentManagerId ?? "");
        })
        .catch(() => setFaculty([]))
        .finally(() => setLoading(false));
    }
  }, [open, clientId, currentManagerId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/org/${slug}/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: selectedId || null }),
      });
      if (res.ok) {
        toast.success("Class teacher updated");
        onOpenChange(false);
        onSuccess?.();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to update");
      }
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Class Teacher</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Select a faculty member to assign as class teacher for <strong>{className}</strong>.
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Class Teacher</Label>
            <Select value={selectedId || "none"} onValueChange={(v) => setSelectedId(v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (unassign)</SelectItem>
                {faculty.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} ({f.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

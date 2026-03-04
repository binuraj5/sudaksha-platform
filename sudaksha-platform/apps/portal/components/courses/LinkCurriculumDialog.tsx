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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LinkCurriculumDialogProps {
  slug: string;
  clientId: string;
  courseId: string;
  currentNodeIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface CurriculumNode {
  id: string;
  name: string;
  code: string;
  type?: string;
  parentId?: string | null;
  children?: CurriculumNode[];
}

export function LinkCurriculumDialog({
  slug,
  clientId,
  courseId,
  currentNodeIds,
  open,
  onOpenChange,
  onSuccess,
}: LinkCurriculumDialogProps) {
  const [nodes, setNodes] = useState<CurriculumNode[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(currentNodeIds));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && clientId) {
      setLoading(true);
      fetch(`/api/clients/${clientId}/curriculum`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: CurriculumNode[]) => {
          setNodes(data);
          setSelectedIds(new Set(currentNodeIds));
        })
        .catch(() => setNodes([]))
        .finally(() => setLoading(false));
    }
  }, [open, clientId, currentNodeIds.join(",")]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/org/${slug}/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculumNodeIds: Array.from(selectedIds) }),
      });
      if (res.ok) {
        toast.success("Curriculum linked");
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
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Link curriculum</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Select curriculum nodes to link to this course.
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto flex-1 min-h-0 border rounded-md p-3">
            {nodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No curriculum nodes. Add nodes in Curriculum first.</p>
            ) : (
              nodes.map((node) => (
                <div key={node.id} className="flex items-center gap-2">
                  <Checkbox
                    id={node.id}
                    checked={selectedIds.has(node.id)}
                    onCheckedChange={() => toggle(node.id)}
                  />
                  <Label htmlFor={node.id} className="text-sm font-normal cursor-pointer flex-1">
                    {node.name} <span className="text-muted-foreground font-mono text-xs">({node.code})</span>
                  </Label>
                </div>
              ))
            )}
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

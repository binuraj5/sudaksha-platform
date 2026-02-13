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
import { Input } from "@/components/ui/input";
import { Loader2, Briefcase, User } from "lucide-react";
import { toast } from "sonner";

type AssessmentModel = { id: string; name: string; description: string | null; sourceType: string };

export function AssignAssessmentDialog({
    open,
    onOpenChange,
    clientId,
    assessmentModel,
    onAssigned,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string;
    assessmentModel: AssessmentModel;
    onAssigned?: () => void;
}) {
    const [targetType, setTargetType] = useState<"PROJECT" | "INDIVIDUAL">("PROJECT");
    const [projectId, setProjectId] = useState("");
    const [memberId, setMemberId] = useState("");
    const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
    const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open || !clientId) return;
        fetch(`/api/clients/${clientId}/projects`)
            .then(r => r.json())
            .then(data => setProjects(Array.isArray(data) ? data : data?.projects || []))
            .catch(() => setProjects([]));
        fetch(`/api/clients/${clientId}/employees?simple=true`)
            .then(r => r.json())
            .then(data => setMembers(Array.isArray(data) ? data : []))
            .catch(() => setMembers([]));
    }, [open, clientId]);

    const handleSubmit = async () => {
        if (targetType === "PROJECT" && !projectId) {
            toast.error("Select a project");
            return;
        }
        if (targetType === "INDIVIDUAL" && !memberId) {
            toast.error("Select an individual");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/assessments/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelId: assessmentModel.id,
                    targetType,
                    projectId: targetType === "PROJECT" ? projectId : null,
                    memberId: targetType === "INDIVIDUAL" ? memberId : null,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to assign");
            }
            toast.success("Assessment assigned successfully");
            onOpenChange(false);
            setProjectId("");
            setMemberId("");
            onAssigned?.();
        } catch (e: any) {
            toast.error(e.message || "Failed to assign assessment");
        } finally {
            setSubmitting(false);
        }
    };

    if (!assessmentModel) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Assign Assessment</DialogTitle>
                    <DialogDescription>
                        Assign &quot;{assessmentModel.name}&quot; to a project or an individual.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={targetType === "PROJECT" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTargetType("PROJECT")}
                        >
                            <Briefcase className="mr-2 h-3 w-3" /> Assign to Project
                        </Button>
                        <Button
                            type="button"
                            variant={targetType === "INDIVIDUAL" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTargetType("INDIVIDUAL")}
                        >
                            <User className="mr-2 h-3 w-3" /> Assign to Individual
                        </Button>
                    </div>
                    {targetType === "PROJECT" && (
                        <div className="space-y-2">
                            <Label>Project</Label>
                            <Select value={projectId} onValueChange={setProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                    {projects.length === 0 && (
                                        <SelectItem value="_" disabled>No projects</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {targetType === "INDIVIDUAL" && (
                        <div className="space-y-2">
                            <Label>Individual (Employee / Student)</Label>
                            <Select value={memberId} onValueChange={setMemberId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select individual" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                    {members.length === 0 && (
                                        <SelectItem value="_" disabled>No members</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Assign
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

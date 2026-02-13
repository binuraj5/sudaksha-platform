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
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const TARGET_TYPES = [
    { value: "ALL", label: "All members" },
    { value: "DEPARTMENT", label: "Department" },
    { value: "TEAM", label: "Team" },
    { value: "ROLE", label: "Role" },
    { value: "CUSTOM", label: "Custom (by ID)" },
] as const;

export function AssignSurveyDialog({
    open,
    onOpenChange,
    clientId,
    surveyId,
    surveyName,
    onAssigned,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string;
    surveyId: string;
    surveyName: string;
    onAssigned?: () => void;
}) {
    const [targetType, setTargetType] = useState<string>("ALL");
    const [targetId, setTargetId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open || !clientId) return;
        if (targetType === "ALL" || targetType === "CUSTOM") {
            setOptions([]);
            return;
        }
        setLoadingOptions(true);
        const path =
            targetType === "DEPARTMENT"
                ? `/api/clients/${clientId}/departments`
                : targetType === "TEAM"
                    ? `/api/clients/${clientId}/teams`
                    : `/api/clients/${clientId}/roles`;
        fetch(path)
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                const list = Array.isArray(data) ? data : data?.data ?? data?.items ?? [];
                setOptions(list.map((x: any) => ({ id: x.id, name: x.name || x.title || x.id })));
            })
            .catch(() => setOptions([]))
            .finally(() => setLoadingOptions(false));
    }, [open, clientId, targetType]);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/surveys/${surveyId}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetType,
                    targetId: targetType === "ALL" || !targetId ? null : targetId,
                    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to assign");
            }
            toast.success("Survey assigned successfully");
            onOpenChange(false);
            setTargetType("ALL");
            setTargetId("");
            setDueDate("");
            onAssigned?.();
        } catch (e: any) {
            toast.error(e.message || "Failed to assign survey");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign survey</DialogTitle>
                    <DialogDescription>
                        Assign &quot;{surveyName}&quot; to a target audience. They will see it in their survey list.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Target</Label>
                        <Select value={targetType} onValueChange={setTargetType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TARGET_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {(targetType === "DEPARTMENT" || targetType === "TEAM" || targetType === "ROLE") && (
                        <div className="grid gap-2">
                            <Label>{targetType === "DEPARTMENT" ? "Department" : targetType === "TEAM" ? "Team" : "Role"}</Label>
                            {loadingOptions ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                                </div>
                            ) : (
                                <Select value={targetId} onValueChange={setTargetId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.map((o) => (
                                            <SelectItem key={o.id} value={o.id}>
                                                {o.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}
                    {targetType === "CUSTOM" && (
                        <div className="grid gap-2">
                            <Label>Target ID (e.g. department or role ID)</Label>
                            <Input
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                placeholder="Optional"
                            />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label>Due date (optional)</Label>
                        <Input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Assign
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

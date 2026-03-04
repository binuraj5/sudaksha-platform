"use client";

import { useState, useEffect, ReactNode } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RequestableItem {
    id: string;
    name: string;
    category?: string;
    source: "current-role" | "aspirational-role" | "skills-to-develop";
    type: "ROLE" | "COMPETENCY";
}

interface Props {
    children: ReactNode;
    onSubmitted?: () => void;
}

export function RequestAssessmentDialog({ children, onSubmitted }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [items, setItems] = useState<RequestableItem[]>([]);
    const [currentRoleCompleted, setCurrentRoleCompleted] = useState(true);
    const [selected, setSelected] = useState<string | null>(null);
    const [note, setNote] = useState("");

    useEffect(() => {
        if (open) fetchItems();
    }, [open]);

    async function fetchItems() {
        setLoading(true);
        try {
            const res = await fetch("/api/members/me/requestable-competencies");
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setCurrentRoleCompleted(!!data.currentRoleCompleted);
            }
        } catch {
            toast.error("Failed to load requestable assessment items");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (!selected) return;
        setSubmitting(true);
        try {
            const item = items.find(c => c.id === selected);
            const res = await fetch("/api/members/me/assessment-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selected,
                    name: item?.name,
                    source: item?.source,
                    type: item?.type,
                    note: note.trim() || undefined,
                }),
            });
            if (res.ok) {
                toast.success("Assessment request submitted! Your manager will review it.");
                setOpen(false);
                setSelected(null);
                setNote("");
                onSubmitted?.();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to submit request");
            }
        } finally {
            setSubmitting(false);
        }
    }

    const sourceLabel: Record<string, { label: string; className: string }> = {
        "current-role": { label: "Current Role", className: "bg-blue-100 text-blue-700" },
        "aspirational-role": { label: "Aspirational Role", className: "bg-purple-100 text-purple-700" },
        "skills-to-develop": { label: "Skills I Want to Develop", className: "bg-amber-100 text-amber-700" },
    };

    const grouped = items.reduce((acc, c) => {
        if (!acc[c.source]) acc[c.source] = [];
        acc[c.source].push(c);
        return acc;
    }, {} as Record<string, RequestableItem[]>);

    const sourceOrder: string[] = ["current-role", "aspirational-role", "skills-to-develop"];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Request an Assessment</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Select a role or skill from your career plan. Your manager will review and assign an assessment.
                    </p>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                        No assessments available to request. You may have already requested or completed them all, or you need to set your Career Profile.
                    </div>
                ) : (
                    <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2">
                        {sourceOrder.filter(s => grouped[s]?.length > 0).map((source) => {
                            const meta = sourceLabel[source];
                            const isLocked = source === "aspirational-role" && !currentRoleCompleted;

                            return (
                                <div key={source} className={cn("space-y-3", isLocked && "opacity-60")}>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className={cn("text-xs", meta.className)}>{meta.label}</Badge>
                                        </div>
                                        {isLocked && (
                                            <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                                <Lock className="h-3 w-3" /> You must complete your Current Role assessments before unlocking Aspirational Role assessments.
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {grouped[source].map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                disabled={isLocked}
                                                onClick={() => setSelected(selected === c.id ? null : c.id)}
                                                className={cn(
                                                    "w-full text-left flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors",
                                                    isLocked ? "cursor-not-allowed bg-gray-50" : "hover:border-indigo-300 hover:bg-gray-50",
                                                    selected === c.id
                                                        ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                                                        : "border-gray-200"
                                                )}
                                            >
                                                <div>
                                                    <span className="font-medium block">{c.name}</span>
                                                    <span className="text-xs text-gray-500 capitalize">{c.type.toLowerCase()}</span>
                                                </div>
                                                {selected === c.id && <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && items.length > 0 && (
                    <div className="space-y-2 pt-4 border-t mt-2">
                        <Label htmlFor="req-note">Note to Manager (optional)</Label>
                        <Textarea
                            id="req-note"
                            placeholder="e.g. I need this assessment to prepare for my role transition..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-20"
                        />
                    </div>
                )}

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selected || submitting}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

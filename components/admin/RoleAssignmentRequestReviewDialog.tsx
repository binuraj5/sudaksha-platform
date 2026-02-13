"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, XCircle, User, Briefcase, AlertCircle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";

interface RoleAssignmentRequest {
    id: string;
    requestedRoleName: string;
    description: string | null;
    totalExperienceYears: number;
    context: string;
    status: string;
    createdAt: string;
    member: {
        id: string;
        name: string;
        email: string;
        designation: string | null;
        type: string;
    };
    tenant: {
        id: string;
        name: string;
        slug: string | null;
    };
}

interface RoleAssignmentRequestReviewDialogProps {
    request: RoleAssignmentRequest | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApproved: () => void;
    onRejected: () => void;
}

export function RoleAssignmentRequestReviewDialog({
    request,
    open,
    onOpenChange,
    onApproved,
    onRejected,
}: RoleAssignmentRequestReviewDialogProps) {
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
    const [competencies, setCompetencies] = useState<{ id: string; name: string; category: string }[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [selectedCompetencyIds, setSelectedCompetencyIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (open) {
            fetch("/api/admin/roles")
                .then((r) => r.json())
                .then((data) => setRoles(Array.isArray(data) ? data : []))
                .catch(() => setRoles([]));
            fetch("/api/competencies")
                .then((r) => r.json())
                .then((data) => setCompetencies(Array.isArray(data) ? data : []))
                .catch(() => setCompetencies([]));
        }
    }, [open]);

    useEffect(() => {
        if (request && open) {
            setSelectedRoleId("");
            setSelectedCompetencyIds(new Set());
            setRejectionReason("");
            setShowRejectionInput(false);
        }
    }, [request?.id, open]);

    if (!request) return null;

    const toggleCompetency = (id: string) => {
        setSelectedCompetencyIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/role-assignment-requests/${request.id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roleId: selectedRoleId || undefined,
                    competencyIds: Array.from(selectedCompetencyIds),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                toast.error(data.error || "Failed to approve");
                return;
            }

            toast.success("Role assigned successfully");
            onOpenChange(false);
            onApproved();
        } catch (err) {
            toast.error("Failed to approve request");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/role-assignment-requests/${request.id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rejectionReason: rejectionReason.trim() }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || "Failed to reject");
                return;
            }

            toast.success("Request rejected");
            onOpenChange(false);
            onRejected();
        } catch (err) {
            toast.error("Failed to reject request");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Role Assignment Request
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-6 pb-4">
                        {/* Requester info */}
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                                <User className="w-4 h-4" /> Requester
                            </div>
                            <p className="font-semibold text-slate-900">{request.member.name}</p>
                            <p className="text-sm text-slate-600">{request.member.email}</p>
                            {request.member.designation && (
                                <p className="text-xs text-slate-500">{request.member.designation}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                                {request.tenant.name} • {format(new Date(request.createdAt), "MMM d, yyyy")}
                            </p>
                        </div>

                        {/* Request details */}
                        <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-100">
                            <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 mb-2">
                                <Briefcase className="w-4 h-4" /> Requested Role
                            </div>
                            <p className="font-semibold text-slate-900">{request.requestedRoleName}</p>
                            <p className="text-sm text-slate-600 mt-1">
                                Total experience: <strong>{request.totalExperienceYears}</strong> years
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Context: {request.context === "current" ? "Current role" : "Aspirational role"}
                            </p>
                            {request.description && (
                                <p className="text-sm text-slate-600 mt-2 italic">&quot;{request.description}&quot;</p>
                            )}
                        </div>

                        {/* Approve: select role or create new */}
                        <div className="space-y-2">
                            <Label>Assign role</Label>
                            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Create new role from request (or select existing)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Create new: {request.requestedRoleName}</SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">
                                Leave empty to create a new role &quot;{request.requestedRoleName}&quot;. Or select an existing role.
                            </p>
                        </div>

                        {/* Competencies */}
                        <div className="space-y-2">
                            <Label>Assign competencies to role (optional)</Label>
                            <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                                {competencies.length === 0 ? (
                                    <p className="text-sm text-slate-500">Loading competencies...</p>
                                ) : (
                                    competencies.map((c) => (
                                        <div
                                            key={c.id}
                                            className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer"
                                            onClick={() => toggleCompetency(c.id)}
                                        >
                                            <Checkbox
                                                checked={selectedCompetencyIds.has(c.id)}
                                            />
                                            <span className="text-sm font-medium">{c.name}</span>
                                            <span className="text-xs text-slate-400">({c.category})</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {showRejectionInput && (
                            <div className="space-y-2 p-4 rounded-lg bg-red-50 border border-red-100">
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertCircle className="w-4 h-4" />
                                    <Label>Reason for rejection *</Label>
                                </div>
                                <Textarea
                                    placeholder="Explain why this request is being rejected..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="border-t pt-4">
                    {showRejectionInput ? (
                        <div className="flex justify-end gap-2 w-full">
                            <Button variant="ghost" onClick={() => setShowRejectionInput(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={isProcessing || !rejectionReason.trim()}
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                                Confirm Rejection
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-end gap-2 w-full">
                            <Button variant="outline" onClick={() => setShowRejectionInput(true)}>
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                            </Button>
                            <Button onClick={handleApprove} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                Approve & Assign
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
import { CheckCircle2, XCircle, User, Briefcase, AlertCircle, Loader2, Plus, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { RoleBasicInfo } from "@/components/assessments/admin/roles/RoleBasicInfo";
import { RoleCompetencies } from "@/components/assessments/admin/roles/RoleCompetencies";
import type { GeneratedCompetency } from "@/lib/actions/ai-competency";

interface RoleAssignmentRequest {
    id: string;
    requestedRoleName: string;
    description: string | null;
    totalExperienceYears: number;
    context: string;
    status: string;
    assignedRoleId?: string | null;
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
    onRoleCreated?: () => void;
}

const INDUSTRIES = [
    "Information Technology",
    "Healthcare",
    "Finance",
    "Manufacturing",
    "Education",
    "Retail",
];

export function RoleAssignmentRequestReviewDialog({
    request,
    open,
    onOpenChange,
    onApproved,
    onRejected,
    onRoleCreated,
}: RoleAssignmentRequestReviewDialogProps) {
    const CREATE_NEW_ROLE_VALUE = "__create_new__";
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [roles, setRoles] = useState<{ id: string; name: string; _count?: { competencies: number } }[]>([]);
    const [similarRoles, setSimilarRoles] = useState<{ id: string; name: string; _count?: { competencies: number } }[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>(CREATE_NEW_ROLE_VALUE);
    const [createdRoleId, setCreatedRoleId] = useState<string | null>(null);
    const [view, setView] = useState<"choose" | "create">("choose");
    const [isCreatingRole, setIsCreatingRole] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        overallLevel: "JUNIOR",
        department: "",
        description: "",
    });
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [competencies, setCompetencies] = useState<GeneratedCompetency[]>([]);

    useEffect(() => {
        if (open) {
            fetch("/api/admin/roles")
                .then((r) => r.json())
                .then((data) => setRoles(Array.isArray(data) ? data : []))
                .catch(() => setRoles([]));
        }
    }, [open]);

    useEffect(() => {
        if (request && open && request.requestedRoleName) {
            fetch(`/api/admin/roles/search?q=${encodeURIComponent(request.requestedRoleName)}`)
                .then((r) => r.json())
                .then((data) => setSimilarRoles(Array.isArray(data) ? data : []))
                .catch(() => setSimilarRoles([]));
        }
    }, [request?.id, request?.requestedRoleName, open]);

    useEffect(() => {
        if (request && open) {
            setSelectedRoleId(CREATE_NEW_ROLE_VALUE);
            setRejectionReason("");
            setShowRejectionInput(false);
            setView(request.assignedRoleId ? "choose" : "choose");
            setCreatedRoleId(request.assignedRoleId || null);
            setFormData({
                name: request.requestedRoleName,
                code: request.requestedRoleName.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 20),
                overallLevel: "JUNIOR",
                department: "",
                description: request.description || "",
            });
            setSelectedIndustries([]);
            setCompetencies([]);
        }
    }, [request?.id, open]);

    const effectiveRoleId = createdRoleId || request?.assignedRoleId || (selectedRoleId !== CREATE_NEW_ROLE_VALUE ? selectedRoleId : null);
    const canApprove = effectiveRoleId != null;

    const handleCreateRole = async () => {
        if (!request) return;
        if (!formData.name.trim()) {
            toast.error("Role name is required");
            return;
        }

        setIsCreatingRole(true);
        try {
            const res = await fetch(`/api/admin/role-assignment-requests/${request.id}/create-role`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    code: formData.code.trim() || formData.name.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 20),
                    description: formData.description.trim(),
                    overallLevel: formData.overallLevel,
                    department: formData.department.trim() || undefined,
                    industries: selectedIndustries,
                    competencies,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                toast.error(data.error || "Failed to create role");
                return;
            }

            toast.success("Role and competencies created successfully");
            setCreatedRoleId(data.roleId);
            setView("choose");
            onRoleCreated?.();
        } catch (err) {
            toast.error("Failed to create role");
        } finally {
            setIsCreatingRole(false);
        }
    };

    const handleApprove = async () => {
        if (!request) return;
        const roleIdToUse = effectiveRoleId;
        if (!roleIdToUse) {
            toast.error("Please select or create a role first");
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/role-assignment-requests/${request.id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleId: roleIdToUse }),
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
        if (!request) return;
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

    if (!request) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border-none shadow-2xl p-0 flex flex-col">
                <DialogTitle className="sr-only">Role Assignment Request</DialogTitle>
                <div className="p-8 border-b border-sudaksha-blue-50 flex justify-between items-center bg-white shrink-0">
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-sudaksha-blue-600 flex items-center justify-center text-white shadow-lg shadow-sudaksha-blue-100">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black italic tracking-tighter text-sudaksha-navy-900 lowercase">
                                    Role <span className="text-sudaksha-blue-600 font-serif not-italic">Assignment</span>
                                </h2>
                                <Badge className="bg-sudaksha-orange-50 text-sudaksha-orange-600 border-sudaksha-orange-200 font-bold italic h-6">
                                    {request.status}
                                </Badge>
                                {(createdRoleId || request.assignedRoleId) && (
                                    <Badge className="bg-sudaksha-success-50 text-sudaksha-success-600 border-sudaksha-success-200 font-bold italic h-6">
                                        Role created
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sudaksha-navy-500 font-medium italic text-sm">
                                {request.member.name} • {request.tenant.name}
                            </p>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-8 bg-sudaksha-blue-50/30">
                    <div className="space-y-6 pb-4">
                        {/* Requester info */}
                        <div className="p-4 rounded-2xl bg-white border border-sudaksha-blue-100 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-medium text-sudaksha-navy-500 mb-2">
                                <User className="w-4 h-4" /> Requester
                            </div>
                            <p className="font-semibold text-sudaksha-navy-900">{request.member.name}</p>
                            <p className="text-sm text-sudaksha-navy-600">{request.member.email}</p>
                            {request.member.designation && (
                                <p className="text-xs text-sudaksha-navy-500">{request.member.designation}</p>
                            )}
                            <p className="text-xs text-sudaksha-navy-400 mt-1">
                                {request.tenant.name} • {format(new Date(request.createdAt), "MMM d, yyyy")}
                            </p>
                        </div>

                        {/* Request details */}
                        <div className="p-4 rounded-2xl bg-sudaksha-blue-50/80 border border-sudaksha-blue-200 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-medium text-sudaksha-blue-600 mb-2">
                                <Briefcase className="w-4 h-4" /> Requested Role
                            </div>
                            <p className="font-semibold text-sudaksha-navy-900">{request.requestedRoleName}</p>
                            <p className="text-sm text-sudaksha-navy-600 mt-1">
                                Total experience: <strong>{request.totalExperienceYears}</strong> years
                            </p>
                            <p className="text-xs text-sudaksha-navy-500 mt-1">
                                Context: {request.context === "current" ? "Current role" : "Aspirational role"}
                            </p>
                            {request.description && (
                                <p className="text-sm text-sudaksha-navy-600 mt-2 italic">&quot;{request.description}&quot;</p>
                            )}
                        </div>

                        {view === "create" ? (
                            /* Create new role form */
                            <div className="space-y-6 p-4 rounded-2xl bg-white border border-sudaksha-blue-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-sudaksha-navy-800">Create new role</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setView("choose")}
                                        className="text-sudaksha-navy-500"
                                    >
                                        Back to selection
                                    </Button>
                                </div>
                                <RoleBasicInfo
                                    data={formData}
                                    setData={setFormData}
                                    selectedIndustries={selectedIndustries}
                                    setSelectedIndustries={setSelectedIndustries}
                                />
                                <RoleCompetencies
                                    roleData={formData}
                                    competencies={competencies}
                                    setCompetencies={setCompetencies}
                                />
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setView("choose")}
                                        className="rounded-xl"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateRole}
                                        disabled={isCreatingRole || !formData.name.trim()}
                                        className="rounded-xl bg-sudaksha-orange-500 hover:bg-sudaksha-orange-600 text-white font-bold"
                                    >
                                        {isCreatingRole ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Plus className="w-4 h-4 mr-2" />
                                        )}
                                        Create role & competencies
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* Assign role: similar roles + dropdown */
                            <div className="space-y-4">
                                <Label className="text-sudaksha-navy-700 font-semibold">Assign role</Label>

                                {similarRoles.length > 0 && (
                                    <div className="p-4 rounded-xl bg-sudaksha-orange-50/60 border border-sudaksha-orange-200">
                                        <p className="text-sm font-medium text-sudaksha-orange-800 mb-3">
                                            Similar roles found – consider reusing for standardization
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {similarRoles.map((r) => (
                                                <Button
                                                    key={r.id}
                                                    variant={selectedRoleId === r.id ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setSelectedRoleId(r.id)}
                                                    className={
                                                        selectedRoleId === r.id
                                                            ? "bg-sudaksha-blue-600 hover:bg-sudaksha-blue-700"
                                                            : "border-sudaksha-orange-200 hover:bg-sudaksha-orange-50"
                                                    }
                                                >
                                                    {r.name}
                                                    {r._count?.competencies != null && (
                                                        <span className="ml-1 text-xs opacity-80">
                                                            ({r._count.competencies} competencies)
                                                        </span>
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    <Select
                                        value={selectedRoleId}
                                        onValueChange={(v) => {
                                            setSelectedRoleId(v);
                                            if (v === CREATE_NEW_ROLE_VALUE) setCreatedRoleId(null);
                                        }}
                                    >
                                        <SelectTrigger className="w-full max-w-md">
                                            <SelectValue placeholder="Select or create role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={CREATE_NEW_ROLE_VALUE}>
                                                Create new: {request.requestedRoleName}
                                            </SelectItem>
                                            {roles.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    {r.name}
                                                    {r._count?.competencies != null && ` (${r._count.competencies} competencies)`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedRoleId === CREATE_NEW_ROLE_VALUE && !createdRoleId && !request.assignedRoleId && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setView("create")}
                                            className="border-sudaksha-orange-300 text-sudaksha-orange-600 hover:bg-sudaksha-orange-50"
                                        >
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Create role with competencies
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-sudaksha-navy-500">
                                    Reuse an existing role for standardization, or create a new one with full competency profile.
                                </p>
                            </div>
                        )}

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

                <DialogFooter className="p-8 bg-white border-t border-sudaksha-blue-50 shrink-0">
                    {showRejectionInput ? (
                        <div className="flex justify-end gap-3 w-full">
                            <Button
                                variant="ghost"
                                onClick={() => setShowRejectionInput(false)}
                                className="rounded-xl font-bold italic"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={isProcessing || !rejectionReason.trim()}
                                className="rounded-xl font-black italic shadow-lg shadow-red-100"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                                Confirm Rejection
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center w-full">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl font-black italic text-sudaksha-navy-500"
                            >
                                Skip for now
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRejectionInput(true)}
                                    className="rounded-xl font-bold italic h-12 border-red-200 text-red-600 hover:bg-red-50 px-6"
                                >
                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    disabled={isProcessing || !canApprove}
                                    className="rounded-xl bg-sudaksha-blue-600 hover:bg-sudaksha-blue-700 font-black italic h-12 px-8 shadow-lg shadow-sudaksha-blue-100"
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    Approve & Assign
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

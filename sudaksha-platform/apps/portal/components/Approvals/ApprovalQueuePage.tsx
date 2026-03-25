"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Briefcase, BrainCircuit, Loader2, Filter, Eye, Sparkles, ClipboardList, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { CompetencyRequestReviewDialog } from "@/components/admin/CompetencyRequestReviewDialog";

interface ApprovalRequest {
    id: string;
    type: "ROLE" | "COMPETENCY" | "ASSESSMENT_REQUEST";
    entityId: string;
    entityName: string;
    entityDescription: string;
    status: string;
    comments: string | null;
    rejectionReason: string | null;
    createdAt: string;
    requesterId: string | null;
    requesterName?: string;
    requesterEmail?: string;
    tenantName?: string;
    originalData?: any;
    // ASSESSMENT_REQUEST specific
    modifiedData?: any;
}

interface AssessmentRequestItem {
    id: string;
    itemName: string;
    itemType: "Role" | "Competency";
    competencyId?: string;
    roleId?: string;
    memberName: string;
    requesterId: string | null;
    tenantName?: string;
    note?: string;
    status: string;
    rejectionReason?: string;
    createdAt: string;
}

export function ApprovalQueuePage() {
    const params = useParams();
    const slug = params?.slug as string | undefined;
    const basePath = slug ? `/assessments/org/${slug}` : `/assessments/admin`;

    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState<"ALL" | "ROLE" | "COMPETENCY" | "ASSESSMENT_REQUEST">("ALL");
    const [reviewDialog, setReviewDialog] = useState<{ request: ApprovalRequest; decision: "APPROVED" | "REJECTED" } | null>(null);
    const [reviewNotes, setReviewNotes] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);

    const filtered = typeFilter === "ALL"
        ? requests.filter(r => r.type !== "ASSESSMENT_REQUEST")
        : requests.filter(r => r.type === typeFilter);

    const assessmentRequests: AssessmentRequestItem[] = requests
        .filter(r => r.type === "ASSESSMENT_REQUEST")
        .map(r => ({
            id: r.id,
            itemName: r.modifiedData?.roleName || r.modifiedData?.competencyName || r.entityId,
            itemType: r.modifiedData?.roleId ? "Role" : "Competency",
            competencyId: r.modifiedData?.competencyId,
            roleId: r.modifiedData?.roleId,
            memberName: r.modifiedData?.memberName || r.requesterName || "Unknown",
            requesterId: r.requesterId,
            tenantName: r.tenantName,
            note: r.modifiedData?.note,
            status: r.status,
            rejectionReason: r.rejectionReason || undefined,
            createdAt: r.createdAt,
        }));

    // Competency request review dialog state
    const [selectedCompRequest, setSelectedCompRequest] = useState<any>(null);
    const [isCompDialogOpen, setIsCompDialogOpen] = useState(false);
    const [loadingCompRequest, setLoadingCompRequest] = useState(false);
    // Assessment request action state
    const [assessReviewDialog, setAssessReviewDialog] = useState<{ item: AssessmentRequestItem; decision: "APPROVED" | "REJECTED" | "FORWARD" } | null>(null);
    const [assessNotes, setAssessNotes] = useState("");
    const [assessLoading, setAssessLoading] = useState(false);

    const openCompReview = async (entityId: string) => {
        setLoadingCompRequest(true);
        try {
            const res = await fetch(`/api/admin/competency-requests/${entityId}`);
            if (!res.ok) throw new Error("Failed to load request details");
            const data = await res.json();
            setSelectedCompRequest(data);
            setIsCompDialogOpen(true);
        } catch {
            toast.error("Could not load competency request details");
        } finally {
            setLoadingCompRequest(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/approvals");
            if (!res.ok) throw new Error("Failed to fetch approvals");
            const data = await res.json();
            setRequests(data.requests || []);
        } catch (error) {
            toast.error("Failed to load approval requests");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const confirmAssessmentRequestAction = async () => {
        if (!assessReviewDialog) return;
        setAssessLoading(true);
        try {
            const { item, decision } = assessReviewDialog;

            if (decision === "APPROVED") {
                const compId = item.competencyId;
                const rId = item.roleId;

                try {
                    // Start the Resolution Engine to Auto-Assign
                    const approveRes = await fetch(`/api/admin/assessment-requests/${item.id}/approve`, {
                        method: "POST",
                    });

                    if (approveRes.ok) {
                        toast.success("Request approved and best-fit model auto-assigned!");
                        setAssessReviewDialog(null);
                        setAssessNotes("");
                        fetchRequests();
                        return;
                    }

                    const errData = await approveRes.json();

                    // Branch A: No model exists, redirect to builder
                    if (errData.error === "NO_MODEL_EXISTS" || errData.error === "NO_ACTIVE_MODEL") {
                        toast.info(errData.message || "Redirecting to builder...");
                        const isOrgScope = basePath.includes('/org/');
                        const builderPath = isOrgScope ? `${basePath}/assessments` : `${basePath}/models`;

                        if (compId) {
                            window.location.href = `${builderPath}/competency-builder?competencyId=${compId}&requesterId=${item.requesterId || ""}&requestId=${item.id}`;
                        } else if (rId) {
                            window.location.href = `${builderPath}/create?roleId=${rId}&requesterId=${item.requesterId || ""}&requestId=${item.id}`;
                        } else {
                            toast.error("Request missing role or competency ID");
                        }
                        return;
                    } else {
                        throw new Error(errData.error || "Failed to approve request");
                    }
                } catch (e: any) {
                    toast.error(e.message || "Failed to process approval");
                    setAssessLoading(false);
                    return;
                }
            }

            // Forward / Reject Logic
            if (decision === "FORWARD") {
                const res = await fetch(`/api/admin/approvals/${item.id}/review`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ decision: "FORWARDED", notes: assessNotes }),
                });
                if (!res.ok) throw new Error();
                toast.success("Request forwarded to Super Admin");
            } else {
                const res = await fetch(`/api/admin/approvals/${item.id}/review`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ decision: "REJECTED", notes: assessNotes }),
                });
                if (!res.ok) throw new Error();
                toast.success("Request rejected. Employee will be notified.");
            }

            setAssessReviewDialog(null);
            setAssessNotes("");
            fetchRequests();
        } catch {
            toast.error("Failed to process action");
        } finally {
            setAssessLoading(false);
        }
    };

    const openReview = (request: ApprovalRequest, decision: "APPROVED" | "REJECTED") => {
        setReviewNotes("");
        setReviewDialog({ request, decision });
    };

    const confirmReview = async () => {
        if (!reviewDialog) return;
        setReviewLoading(true);
        try {
            const res = await fetch(`/api/admin/approvals/${reviewDialog.request.id}/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision: reviewDialog.decision, notes: reviewNotes }),
            });
            if (!res.ok) throw new Error("Failed to process review");
            toast.success(reviewDialog.decision === "APPROVED" ? "Request approved successfully" : "Request rejected");
            setReviewDialog(null);
            fetchRequests();
        } catch (error) {
            toast.error("Failed to process approval decision");
            console.error(error);
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400 mr-2" />
                <span className="text-slate-500">Loading approval queue...</span>
            </div>
        );
    }

    const isApproval = reviewDialog?.decision === "APPROVED";

    return (
        <>
            {/* Review Dialog */}
            <Dialog open={!!reviewDialog} onOpenChange={(open) => !open && setReviewDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isApproval ? "Approve" : "Reject"}: {reviewDialog?.request.entityName}
                        </DialogTitle>
                        <DialogDescription>
                            {isApproval
                                ? "Approving this request will mark the role/competency as active and available."
                                : "Please provide a clear rejection reason. The requester will see this message."}
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder={isApproval ? "Optional notes for the requester..." : "Enter rejection reason (required for clarity)..."}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={4}
                        className="mt-2"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewDialog(null)}>Cancel</Button>
                        <Button
                            variant={isApproval ? "default" : "destructive"}
                            onClick={confirmReview}
                            disabled={reviewLoading}
                            className={isApproval ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                            {reviewLoading ? "Processing..." : (isApproval ? "Confirm Approve" : "Confirm Reject")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Approval Queue</h1>
                    <p className="text-slate-500">Review pending role, competency, and assessment requests from your organization.</p>
                </div>

                {/* Type filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500 mr-1">Filter:</span>
                    {(["ALL", "ROLE", "COMPETENCY", "ASSESSMENT_REQUEST"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${typeFilter === t
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                        >
                            {t === "ALL" ? "All Requests" : t === "ROLE" ? "Role Requests" : t === "COMPETENCY" ? "Competency Requests" : (
                                <span className="flex items-center gap-1">
                                    <ClipboardList className="w-3 h-3" /> Assessment Requests
                                    {assessmentRequests.filter(r => r.status === "PENDING").length > 0 && (
                                        <span className="ml-1 bg-amber-500 text-white rounded-full px-1.5 py-0 text-[10px]">
                                            {assessmentRequests.filter(r => r.status === "PENDING").length}
                                        </span>
                                    )}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {typeFilter !== "ASSESSMENT_REQUEST" && (filtered.length === 0 ? (
                    <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">No pending requests</p>
                        <p className="text-slate-400 text-sm mt-1">All requests have been reviewed. Check back later.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Requested By</TableHead>
                                    <TableHead>Reason & Context</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">
                                            <div className="font-semibold">{req.entityName}</div>
                                            {req.type === "COMPETENCY" && req.originalData?.category && (
                                                <Badge variant="outline" className="text-[10px] uppercase mt-1">
                                                    {req.originalData.category}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="gap-1">
                                                {req.type === "ROLE" ? (
                                                    <><Briefcase className="w-3 h-3" /> Role</>
                                                ) : (
                                                    <><BrainCircuit className="w-3 h-3" /> Competency</>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{req.requesterName || "Unknown"}</div>
                                            <div className="text-xs text-slate-500">{req.tenantName || "Unknown Org"}</div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <span className="text-sm text-slate-500 line-clamp-2">
                                                {req.type === "COMPETENCY" && req.originalData?.roleBenefit
                                                    ? req.originalData.roleBenefit
                                                    : (req.entityDescription || "—")}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {req.status === "APPROVED" ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Approved</Badge>
                                            ) : req.status === "REJECTED" ? (
                                                <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Rejected</Badge>
                                            ) : (req as any).needsAssessmentModel ? (
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Needs Assessment Model</Badge>
                                            ) : (
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Pending Approval</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {req.status === "PENDING" ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    {req.type === "COMPETENCY" && (req as any).isEmployeeRequest ? (
                                                        <Button
                                                            size="sm"
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white h-8"
                                                            disabled={loadingCompRequest}
                                                            onClick={() => openCompReview(req.entityId)}
                                                        >
                                                            {loadingCompRequest
                                                                ? <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                : <Sparkles className="w-3 h-3 mr-1" />}
                                                            Create & Assign
                                                        </Button>
                                                    ) : (req as any).needsAssessmentModel ? (
                                                        <Button
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                                                            onClick={() => {
                                                                window.location.href = `${basePath}/models/competency-builder?competencyId=${req.entityId}&requesterId=${req.requesterId || ""}`;
                                                            }}
                                                        >
                                                            <BrainCircuit className="w-3 h-3 mr-1" /> Build Model
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 h-8 text-white"
                                                                onClick={() => openReview(req, "APPROVED")}
                                                            >
                                                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className="h-8"
                                                                onClick={() => openReview(req, "REJECTED")}
                                                            >
                                                                <XCircle className="w-3 h-3 mr-1" /> Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">No actions needed</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ))}

                {/* ── Assessment Requests Section ──────────────────────── */}
                {typeFilter === "ASSESSMENT_REQUEST" && (
                    <div className="space-y-3">
                        {assessmentRequests.length === 0 ? (
                            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                                <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-600 font-medium">No assessment requests</p>
                                <p className="text-slate-400 text-sm mt-1">Employees can request assessments from their Career Hub.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Review Target</TableHead>
                                            <TableHead>Requested By</TableHead>
                                            <TableHead>Note</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assessmentRequests.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-semibold text-gray-900">{item.itemName}</div>
                                                    <div className="text-xs text-gray-500">
                                                        <Badge variant="outline" className="text-xs font-normal mt-1">
                                                            {item.itemType} Assessment
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{item.memberName}</TableCell>
                                                <TableCell className="text-sm text-slate-500 max-w-xs truncate">{item.note || "—"}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-slate-500">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.status === "PENDING" ? (
                                                        <Badge className="bg-amber-100 text-amber-700 border-none">Pending</Badge>
                                                    ) : item.status === "APPROVED" ? (
                                                        <Badge className="bg-green-100 text-green-700 border-none">Approved</Badge>
                                                    ) : item.status === "FORWARDED" ? (
                                                        <Badge className="bg-blue-100 text-blue-700 border-none">Forwarded to SA</Badge>
                                                    ) : (
                                                        <div>
                                                            <Badge className="bg-red-100 text-red-700 border-none">Rejected</Badge>
                                                            {item.rejectionReason && <p className="text-xs text-red-500 mt-1">{item.rejectionReason}</p>}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.status === "PENDING" && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-8"
                                                                onClick={() => setAssessReviewDialog({ item, decision: "APPROVED" })}
                                                            >
                                                                <Sparkles className="w-3 h-3 mr-1" /> Accept & Build Model
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8"
                                                                onClick={() => setAssessReviewDialog({ item, decision: "FORWARD" })}
                                                            >
                                                                <SendHorizontal className="w-3 h-3 mr-1" /> Forward to SA
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className="h-8"
                                                                onClick={() => setAssessReviewDialog({ item, decision: "REJECTED" })}
                                                            >
                                                                <XCircle className="w-3 h-3 mr-1" /> Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Assessment Request Action Dialog */}
            <Dialog open={!!assessReviewDialog} onOpenChange={(open) => !open && setAssessReviewDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {assessReviewDialog?.decision === "APPROVED" && "Accept & Build Assessment Model"}
                            {assessReviewDialog?.decision === "FORWARD" && "Forward to Super Admin"}
                            {assessReviewDialog?.decision === "REJECTED" && "Reject Request"}
                        </DialogTitle>
                        <DialogDescription>
                            {assessReviewDialog?.decision === "APPROVED" &&
                                `You will be taken to the Assessment Builder prefilled for "${assessReviewDialog?.item.itemName}". The model will be TENANT_SPECIFIC and assigned to the requester once published.`}
                            {assessReviewDialog?.decision === "FORWARD" &&
                                "Forward this request to the Super Admin for assistance in building the assessment model. The model will remain org-scoped."}
                            {assessReviewDialog?.decision === "REJECTED" &&
                                "Provide a reason so the employee understands why their request was declined."}
                        </DialogDescription>
                    </DialogHeader>
                    {assessReviewDialog?.decision !== "APPROVED" && (
                        <Textarea
                            placeholder={assessReviewDialog?.decision === "FORWARD" ? "Optional note to Super Admin..." : "Rejection reason (required for clarity)..."}
                            value={assessNotes}
                            onChange={(e) => setAssessNotes(e.target.value)}
                            rows={3}
                            className="mt-2"
                        />
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssessReviewDialog(null)}>Cancel</Button>
                        <Button
                            onClick={confirmAssessmentRequestAction}
                            disabled={assessLoading}
                            className={assessReviewDialog?.decision === "REJECTED" ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}
                        >
                            {assessLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {assessReviewDialog?.decision === "APPROVED" ? "Proceed to Builder" :
                                assessReviewDialog?.decision === "FORWARD" ? "Forward" : "Reject Request"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Competency Request Review Dialog */}
            <CompetencyRequestReviewDialog
                request={selectedCompRequest}
                open={isCompDialogOpen}
                onOpenChange={setIsCompDialogOpen}
                onProcessed={() => {
                    setIsCompDialogOpen(false);
                    setSelectedCompRequest(null);
                    fetchRequests();
                }}
            />
        </>
    );
}

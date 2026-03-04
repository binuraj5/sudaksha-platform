"use client";

import { useEffect, useState } from "react";
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
import { CheckCircle, XCircle, Clock, Loader2, ListChecks, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ApprovalRequest {
    id: string;
    type: "ROLE" | "COMPETENCY";
    entityId: string;
    entityName: string;
    entityDescription: string;
    status: string;
    createdAt: string;
    requesterName?: string;
    requesterEmail?: string;
    tenantName?: string;
    originalData?: any;
}

export function PendingRoleRequestsTab({ clientId }: { clientId?: string }) {
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewDialog, setReviewDialog] = useState<{ request: ApprovalRequest; decision: "APPROVED" | "REJECTED" } | null>(null);
    const [reviewNotes, setReviewNotes] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/approvals");
            if (!res.ok) throw new Error("Failed to fetch approvals");
            const data = await res.json();
            // Filter strictly for ROLE requests that are still PENDING
            const roleReqs = (data.requests || []).filter((r: ApprovalRequest) => r.type === "ROLE" && r.status === "PENDING");
            setRequests(roleReqs);
        } catch (error) {
            toast.error("Failed to load generic approval requests");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [clientId]);

    const openReview = (request: ApprovalRequest, decision: "APPROVED" | "REJECTED") => {
        setReviewNotes("");
        setReviewDialog({ request, decision });
    };

    const confirmReview = async () => {
        if (!reviewDialog) return;
        setReviewLoading(true);
        try {
            const res = await fetch(`/api/approvals/${reviewDialog.request.id}/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision: reviewDialog.decision, notes: reviewNotes }),
            });
            if (!res.ok) throw new Error("Failed to process review");
            toast.success(reviewDialog.decision === "APPROVED" ? "Role approved and activated successfully" : "Role request rejected");
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
            <div className="flex items-center justify-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400 mr-2" />
                Loading pending role requests...
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-slate-200 text-center py-12 text-slate-500">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No pending role requests</p>
                <p className="text-slate-400 text-sm mt-1">All role requests have been reviewed.</p>
            </div>
        );
    }

    const isApproval = reviewDialog?.decision === "APPROVED";

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* Review Dialog */}
            <Dialog open={!!reviewDialog} onOpenChange={(open) => !open && setReviewDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isApproval ? "Approve Role" : "Reject Role Request"}: {reviewDialog?.request.entityName}
                        </DialogTitle>
                        <DialogDescription>
                            {isApproval
                                ? "Approving this request will mark the role as active and assign it back to the requesting organization."
                                : "Please provide a clear rejection reason. The requester will see this message."}
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder={isApproval ? "Optional notes for the requester..." : "Enter rejection reason or requested changes (required)..."}
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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Role Requested</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell>
                                <div className="font-semibold text-slate-900">{req.entityName}</div>
                                {req.originalData?.level && (
                                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider mt-1">
                                        {req.originalData.level} Level
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="font-medium text-slate-700">{req.requesterName || "Unknown"}</div>
                                <div className="text-xs text-slate-500">{req.tenantName || "Unknown Org"}</div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="opacity-80">
                                    {req.originalData?.departmentId || "General"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8"
                                        onClick={() => {
                                            if (req.requesterEmail) {
                                                window.location.href = `mailto:${req.requesterEmail}?subject=More Info Needed: Role Request "${req.entityName}"`;
                                            } else {
                                                toast("Cannot request more info, no email found", { icon: <HelpCircle className="w-4 h-4 text-amber-500" /> });
                                            }
                                        }}
                                    >
                                        <HelpCircle className="w-3 h-3 mr-1" /> Request More Info
                                    </Button>
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
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div >
    );
}

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
import { CheckCircle, XCircle, Clock, Briefcase, BrainCircuit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ApprovalRequest {
    id: string;
    type: "ROLE" | "COMPETENCY";
    entityId: string;
    entityName: string;
    entityDescription: string;
    status: string;
    comments: string | null;
    rejectionReason: string | null;
    createdAt: string;
    requesterId: string | null;
}

export function ApprovalQueuePage() {
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewDialog, setReviewDialog] = useState<{ request: ApprovalRequest; decision: "APPROVED" | "REJECTED" } | null>(null);
    const [reviewNotes, setReviewNotes] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/approvals");
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
                    <p className="text-slate-500">Review pending role and competency creation requests from your organization.</p>
                </div>

                {requests.length === 0 ? (
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
                                    <TableHead>Description</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.entityName}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="gap-1">
                                                {req.type === "ROLE" ? (
                                                    <><Briefcase className="w-3 h-3" /> Role</>
                                                ) : (
                                                    <><BrainCircuit className="w-3 h-3" /> Competency</>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <span className="text-sm text-slate-500 line-clamp-2">{req.entityDescription || "—"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {(req as any).needsAssessmentModel ? (
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Needs Assessment Model</Badge>
                                            ) : (
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Pending Approval</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {(req as any).needsAssessmentModel ? (
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                                                        onClick={() => {
                                                            window.location.href = `/assessments/admin/models/competency-builder?competencyId=${req.entityId}&requesterId=${req.requesterId || ""}`;
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
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </>
    );
}

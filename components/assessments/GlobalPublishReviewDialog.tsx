"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Globe } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface GlobalPublishRequest {
    id: string;
    entityType: string;
    entityId: string;
    entityName?: string;
    status: string;
    requestedAt: string;
    requester?: { name?: string | null; email?: string | null };
}

interface GlobalPublishReviewDialogProps {
    request: GlobalPublishRequest | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDecision: (requestId: string, decision: "APPROVED" | "REJECTED", reviewComments?: string) => Promise<void>;
}

export function GlobalPublishReviewDialog({
    request,
    open,
    onOpenChange,
    onDecision,
}: GlobalPublishReviewDialogProps) {
    const [reviewComments, setReviewComments] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    if (!request) return null;

    const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
        setIsProcessing(true);
        try {
            await onDecision(request.id, decision, reviewComments || undefined);
            onOpenChange(false);
            setReviewComments("");
        } catch (error) {
            toast.error("Failed to process decision. Try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600" />
                        Global Publish Request
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500">Entity</span>
                            <Badge variant="outline">{request.entityType}</Badge>
                        </div>
                        <p className="font-semibold">{request.entityName || request.entityId}</p>
                        <p className="text-xs text-slate-400">ID: {request.entityId}</p>
                    </div>

                    <div className="text-sm text-slate-600">
                        <p>
                            <span className="font-medium">Requested by:</span>{" "}
                            {request.requester?.name || request.requester?.email || "—"}
                        </p>
                        <p>
                            <span className="font-medium">Date:</span>{" "}
                            {format(new Date(request.requestedAt), "MMM d, yyyy 'at' HH:mm")}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Review comments (optional)</label>
                        <Textarea
                            placeholder="Add notes for your decision..."
                            value={reviewComments}
                            onChange={(e) => setReviewComments(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => handleDecision("REJECTED")}
                        disabled={isProcessing}
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                    </Button>
                    <Button
                        onClick={() => handleDecision("APPROVED")}
                        disabled={isProcessing}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve & Publish Globally
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

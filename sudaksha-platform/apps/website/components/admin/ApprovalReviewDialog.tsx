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
import {
    CheckCircle2,
    XCircle,
    MessageSquare,
    ArrowRight,
    Search,
    AlertCircle,
    Copy
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApprovalRequest {
    id: string;
    type: string;
    status: string;
    entityId: string;
    comments?: string;
    originalData: any;
    modifiedData: any;
    modificationNotes?: string;
    tenant: {
        name: string;
    };
}

interface ApprovalReviewDialogProps {
    request: ApprovalRequest | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDecision: (requestId: string, decision: "APPROVED" | "REJECTED", reason?: string) => Promise<void>;
}

export function ApprovalReviewDialog({ request, open, onOpenChange, onDecision }: ApprovalReviewDialogProps) {
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRejectionInput, setShowRejectionInput] = useState(false);

    if (!request) return null;

    const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
        if (decision === "REJECTED" && !rejectionReason) {
            toast.error("Please provide a reason for rejection.");
            return;
        }

        setIsProcessing(true);
        try {
            await onDecision(request.id, decision, rejectionReason);
            onOpenChange(false);
            setRejectionReason("");
            setShowRejectionInput(false);
        } catch (error) {
            toast.error("Failed to process decision. Try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const renderDiff = () => {
        const original = request.originalData || {};
        const modified = request.modifiedData || {};
        const allKeys = Array.from(new Set([...Object.keys(original), ...Object.keys(modified)]));

        return (
            <div className="space-y-4">
                {allKeys.map(key => {
                    const oVal = original[key];
                    const mVal = modified[key];
                    const isChanged = JSON.stringify(oVal) !== JSON.stringify(mVal);

                    if (!isChanged) return null;

                    return (
                        <div key={key} className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-top-1">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{key.replace(/([A-Z])/g, ' $1')} (Current)</span>
                                <div className="text-sm font-medium text-slate-500 line-through decoration-red-200">
                                    {typeof oVal === 'object' ? JSON.stringify(oVal, null, 2) : String(oVal || 'None')}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">{key.replace(/([A-Z])/g, ' $1')} (Requested)</span>
                                <div className="text-sm font-black text-indigo-600 italic">
                                    {typeof mVal === 'object' ? JSON.stringify(mVal, null, 2) : String(mVal || 'None')}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border-none shadow-2xl p-0 flex flex-col">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Search className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 lowercase">Review <span className="text-indigo-600 font-serif not-italic">{request.type}</span></h2>
                                <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold italic h-6">{request.status}</Badge>
                            </div>
                            <p className="text-slate-400 font-medium italic text-sm">Requested by {request.tenant.name}</p>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-8 bg-slate-50/30">
                    <div className="space-y-10">
                        {/* Context Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 border-l-4 border-slate-200 pl-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Tenant Context</h3>
                                <p className="text-slate-600 font-black italic text-lg">{request.tenant.name}</p>
                                <p className="text-slate-400 font-medium italic text-xs">Entity ID: {request.entityId}</p>
                            </div>
                            <div className="space-y-2 border-l-4 border-indigo-200 pl-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 italic">Modification Notes</h3>
                                <p className="text-slate-600 font-medium italic leading-relaxed">
                                    {request.modificationNotes || "No notes provided by requester."}
                                </p>
                            </div>
                        </div>

                        {/* Diff Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black italic tracking-tight lowercase">Data <span className="text-indigo-600 font-serif not-italic">Comparison</span></h3>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="rounded-full bg-red-50 text-red-600 border-red-100">Existing</Badge>
                                    <ArrowRight className="w-4 h-4 text-slate-300" />
                                    <Badge variant="outline" className="rounded-full bg-green-50 text-green-600 border-green-100">Requested</Badge>
                                </div>
                            </div>
                            {renderDiff()}
                        </div>

                        {/* Comments Section */}
                        {request.comments && (
                            <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100/50 space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 italic flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> Requester Comments
                                </h4>
                                <p className="text-indigo-900 font-medium italic text-sm">
                                    "{request.comments}"
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-8 bg-white border-t border-slate-50 shrink-0">
                    {showRejectionInput ? (
                        <div className="space-y-4 animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 text-red-600 mb-2">
                                <AlertCircle className="w-4 h-4" />
                                <span className="font-bold italic text-sm">Reason for rejection is required</span>
                            </div>
                            <Textarea
                                placeholder="Explain why this request is being rejected..."
                                className="rounded-2xl border-red-100 focus:ring-red-100 focus:border-red-200 bg-red-50/20 italic"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowRejectionInput(false)}
                                    className="rounded-xl font-bold italic"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDecision("REJECTED")}
                                    disabled={isProcessing}
                                    className="rounded-xl font-black italic shadow-lg shadow-red-100"
                                >
                                    Confirm Rejection
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl font-black italic text-slate-400"
                            >
                                Skip for now
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRejectionInput(true)}
                                    className="rounded-xl font-bold italic h-12 border-red-100 text-red-600 hover:bg-red-50 px-6"
                                >
                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                                <Button
                                    onClick={() => handleDecision("APPROVED")}
                                    disabled={isProcessing}
                                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black italic h-12 px-8 shadow-lg shadow-indigo-100"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

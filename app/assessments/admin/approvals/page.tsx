"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    RefreshCcw,
    Inbox,
    Globe,
    Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ApprovalReviewDialog } from "@/components/admin/ApprovalReviewDialog";
import { GlobalPublishReviewDialog } from "@/components/assessments/GlobalPublishReviewDialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ApprovalsDashboard() {
    const [queueType, setQueueType] = useState<"roles" | "global-publish">("roles");
    const [requests, setRequests] = useState<any[]>([]);
    const [globalRequests, setGlobalRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("PENDING");

    const fetchRequests = async (status: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/approvals?status=${status}`);
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                toast.error((data as { error?: string }).error ?? "Failed to load approval requests.");
                setRequests([]);
                return;
            }
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load approval requests.");
            setRequests([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGlobalRequests = async (status: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/assessments/admin/global-publish-requests?status=${status}`);
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                toast.error((data as { error?: string }).error ?? "Failed to load global publish requests.");
                setGlobalRequests([]);
                return;
            }
            setGlobalRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load global publish requests.");
            setGlobalRequests([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (queueType === "roles") fetchRequests(activeTab);
        else fetchGlobalRequests(activeTab);
    }, [activeTab, queueType]);

    const handleDecision = async (requestId: string, decision: "APPROVED" | "REJECTED", reason?: string) => {
        try {
            const response = await fetch(`/api/admin/approvals/${requestId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision, reason }),
            });

            if (!response.ok) throw new Error("Decision failed");

            toast.success(`Request ${decision.toLowerCase()} successfully.`);
            fetchRequests(activeTab);
        } catch (error) {
            throw error;
        }
    };

    const handleGlobalDecision = async (
        requestId: string,
        decision: "APPROVED" | "REJECTED",
        reviewComments?: string
    ) => {
        try {
            const response = await fetch(
                `/api/assessments/admin/global-publish-requests/${requestId}/review`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ decision, reviewComments }),
                }
            );

            if (!response.ok) throw new Error("Decision failed");

            toast.success(`Request ${decision.toLowerCase()} successfully.`);
            fetchGlobalRequests(activeTab);
            setIsReviewOpen(false);
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="container mx-auto p-8 space-y-12 max-w-7xl pb-24">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 lowercase">Admin <span className="text-indigo-600">Approvals</span></h1>
                    <p className="text-slate-500 font-medium italic">Review and manage custom role and competency submissions from all tenants.</p>
                </div>
                <Button
                    variant="outline"
                    className="rounded-xl font-bold italic h-12 border-slate-100 bg-white"
                    onClick={() =>
                        queueType === "roles"
                            ? fetchRequests(activeTab)
                            : fetchGlobalRequests(activeTab)
                    }
                >
                    <RefreshCcw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} /> Refresh Queue
                </Button>
            </div>

            {/* Queue type selector */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                <Button
                    variant={queueType === "roles" ? "default" : "ghost"}
                    className="rounded-lg font-bold italic"
                    onClick={() => {
                        setQueueType("roles");
                        setSelectedRequest(null);
                        setIsReviewOpen(false);
                    }}
                >
                    <Briefcase className="w-4 h-4 mr-2" /> Role & Competency
                </Button>
                <Button
                    variant={queueType === "global-publish" ? "default" : "ghost"}
                    className="rounded-lg font-bold italic"
                    onClick={() => {
                        setQueueType("global-publish");
                        setSelectedRequest(null);
                        setIsReviewOpen(false);
                    }}
                >
                    <Globe className="w-4 h-4 mr-2" /> Global Publish
                </Button>
            </div>

            <Tabs defaultValue="PENDING" className="w-full space-y-8" onValueChange={setActiveTab}>
                <div className="flex justify-between items-center bg-slate-100 p-1 rounded-2xl h-14 w-fit min-w-[400px]">
                    <TabsList className="bg-transparent h-full">
                        <TabsTrigger value="PENDING" className="rounded-xl font-black italic h-full px-8 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Pending</TabsTrigger>
                        <TabsTrigger value="APPROVED" className="rounded-xl font-black italic h-full px-8 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">Approved</TabsTrigger>
                        <TabsTrigger value="REJECTED" className="rounded-xl font-black italic h-full px-8 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm">Rejected</TabsTrigger>
                    </TabsList>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-slate-50 border border-slate-100 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {queueType === "global-publish" ? (
                            globalRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 space-y-4">
                                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-slate-300 shadow-sm">
                                        <Globe className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-500 font-black italic text-lg tracking-tight">No global publish requests</p>
                                        <p className="text-slate-400 font-medium italic text-sm">No {activeTab.toLowerCase()} requests for assessment models.</p>
                                    </div>
                                </div>
                            ) : (
                                globalRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        role="button"
                                        tabIndex={0}
                                        className="border-none shadow-sm hover:shadow-xl hover:ring-2 hover:ring-indigo-100 transition-all rounded-[2rem] cursor-pointer group bg-white ring-1 ring-slate-100"
                                        onClick={() => {
                                            setSelectedRequest(req);
                                            setIsReviewOpen(true);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                setSelectedRequest(req);
                                                setIsReviewOpen(true);
                                            }
                                        }}
                                    >
                                        <Card className="h-full">
                                            <CardContent className="p-8 flex items-center justify-between">
                                                <div className="flex gap-6 items-center">
                                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 duration-300 bg-indigo-50 text-indigo-600">
                                                        <Globe className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-xl font-black italic tracking-tighter text-slate-900 lowercase uppercase-first">
                                                                {req.entityType} <span className="text-slate-300 font-serif not-italic">–</span> {req.entityName || req.entityId}
                                                            </h3>
                                                            <Badge className="bg-slate-50 text-slate-400 border-none font-black italic lowercase tracking-tight">
                                                                #{req.id.slice(-4)}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <div className="flex items-center gap-1.5 text-slate-400 font-bold italic text-sm">
                                                                <Clock className="w-3.5 h-3.5" /> {format(new Date(req.requestedAt), "MMM d, yyyy")}
                                                            </div>
                                                            <span className="text-slate-200 text-xs">•</span>
                                                            <div className="flex items-center gap-1.5 text-indigo-400 font-bold italic text-sm">
                                                                By {req.requester?.name || req.requester?.email || "—"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {activeTab === "PENDING" ? (
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black italic text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Review <ChevronRight className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <Badge
                                                            className={cn(
                                                                "rounded-xl font-black italic px-4 py-1.5",
                                                                req.status === "APPROVED"
                                                                    ? "bg-green-50 text-green-600"
                                                                    : "bg-red-50 text-red-600"
                                                            )}
                                                        >
                                                            {req.status}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))
                            )
                        ) : requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 space-y-4">
                                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-slate-300 shadow-sm">
                                    <Inbox className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-500 font-black italic text-lg tracking-tight">Your queue is empty!</p>
                                    <p className="text-slate-400 font-medium italic text-sm">No {activeTab.toLowerCase()} requests found at this moment.</p>
                                </div>
                            </div>
                        ) : (
                            requests.map((request) => (
                                <div
                                    key={request.id}
                                    role="button"
                                    tabIndex={0}
                                    className="border-none shadow-sm hover:shadow-xl hover:ring-2 hover:ring-indigo-100 transition-all rounded-[2rem] cursor-pointer group bg-white ring-1 ring-slate-100"
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        setIsReviewOpen(true);
                                    }}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setSelectedRequest(request); setIsReviewOpen(true); } }}
                                >
                                <Card className="h-full">
                                    <CardContent className="p-8 flex items-center justify-between">
                                        <div className="flex gap-6 items-center">
                                            <div className={cn(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 duration-300",
                                                request.type === "ROLE" ? "bg-indigo-50 text-indigo-600" : "bg-teal-50 text-teal-600"
                                            )}>
                                                {request.type === "ROLE" ? "🎭" : "🎯"}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-black italic tracking-tighter text-slate-900 lowercase uppercase-first">
                                                        {request.type} Request <span className="text-slate-300 font-serif not-italic">by</span> {request.tenant.name}
                                                    </h3>
                                                    <Badge className="bg-slate-50 text-slate-400 border-none font-black italic lowercase tracking-tight">#{request.id.slice(-4)}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <div className="flex items-center gap-1.5 text-slate-400 font-bold italic text-sm">
                                                        <Clock className="w-3.5 h-3.5" /> {format(new Date(request.createdAt), "MMM d, yyyy")}
                                                    </div>
                                                    <span className="text-slate-200 text-xs">•</span>
                                                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold italic text-sm">
                                                        <Filter className="w-3.5 h-3.5" /> ID: {request.entityId.slice(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {activeTab === "PENDING" ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black italic text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Review Changes <ChevronRight className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <Badge className={cn(
                                                    "rounded-xl font-black italic px-4 py-1.5",
                                                    request.status === "APPROVED" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                                )}>
                                                    {request.status}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </Tabs>

            {queueType === "roles" ? (
                <ApprovalReviewDialog
                    request={selectedRequest}
                    open={isReviewOpen}
                    onOpenChange={setIsReviewOpen}
                    onDecision={handleDecision}
                />
            ) : (
                <GlobalPublishReviewDialog
                    request={selectedRequest}
                    open={isReviewOpen}
                    onOpenChange={setIsReviewOpen}
                    onDecision={handleGlobalDecision}
                />
            )}
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}

"use client";

import React, { useEffect, useState } from "react";
import {
    Filter,
    Clock,
    ChevronRight,
    RefreshCcw,
    Inbox,
    Globe,
    Briefcase,
    UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ApprovalReviewDialog } from "@/components/admin/ApprovalReviewDialog";
import { GlobalPublishReviewDialog } from "@/components/assessments/GlobalPublishReviewDialog";
import { RoleAssignmentRequestReviewDialog } from "@/components/admin/RoleAssignmentRequestReviewDialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ApprovalsDashboard() {
    const [queueType, setQueueType] = useState<"roles" | "role-assignment" | "global-publish">("role-assignment");
    const [requests, setRequests] = useState<any[]>([]);
    const [roleAssignmentRequests, setRoleAssignmentRequests] = useState<any[]>([]);
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

    const fetchRoleAssignmentRequests = async (status: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/role-assignment-requests?status=${status}`);
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                const errMsg = (data as { error?: string }).error ?? "Failed to load role assignment requests.";
                toast.error(errMsg);
                setRoleAssignmentRequests([]);
                return;
            }
            setRoleAssignmentRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load role assignment requests. Ensure the database migration has been applied.");
            setRoleAssignmentRequests([]);
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
        else if (queueType === "role-assignment") fetchRoleAssignmentRequests(activeTab);
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">Approval Queue</h1>
                    <p className="text-sm text-muted-foreground mt-1">Review and manage custom role and competency submissions from all tenants.</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => {
                        if (queueType === "roles") fetchRequests(activeTab);
                        else if (queueType === "role-assignment") fetchRoleAssignmentRequests(activeTab);
                        else fetchGlobalRequests(activeTab);
                    }}
                >
                    <RefreshCcw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} /> Refresh
                </Button>
            </div>

            {/* Queue type selector */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                <Button
                    variant={queueType === "roles" ? "default" : "ghost"}
                    size="sm"
                    className="h-9 rounded-md"
                    onClick={() => {
                        setQueueType("roles");
                        setSelectedRequest(null);
                        setIsReviewOpen(false);
                    }}
                >
                    <Briefcase className="w-4 h-4 mr-2" /> Role & Competency
                </Button>
                <Button
                    variant={queueType === "role-assignment" ? "default" : "ghost"}
                    size="sm"
                    className="h-9 rounded-md"
                    onClick={() => {
                        setQueueType("role-assignment");
                        setSelectedRequest(null);
                        setIsReviewOpen(false);
                    }}
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Role Assignment
                </Button>
                <Button
                    variant={queueType === "global-publish" ? "default" : "ghost"}
                    size="sm"
                    className="h-9 rounded-md"
                    onClick={() => {
                        setQueueType("global-publish");
                        setSelectedRequest(null);
                        setIsReviewOpen(false);
                    }}
                >
                    <Globe className="w-4 h-4 mr-2" /> Global Publish
                </Button>
            </div>

            <Tabs defaultValue="PENDING" className="w-full space-y-4" onValueChange={setActiveTab}>
                <div className="flex justify-between items-center bg-card p-1 rounded-lg border border-border w-fit">
                    <TabsList className="bg-transparent h-9 gap-0">
                        <TabsTrigger value="PENDING" className="rounded-md h-8 px-4 text-sm data-[state=active]:bg-muted data-[state=active]:text-foreground">Pending</TabsTrigger>
                        <TabsTrigger value="APPROVED" className="rounded-md h-8 px-4 text-sm data-[state=active]:bg-muted data-[state=active]:text-foreground">Approved</TabsTrigger>
                        <TabsTrigger value="REJECTED" className="rounded-md h-8 px-4 text-sm data-[state=active]:bg-muted data-[state=active]:text-foreground">Rejected</TabsTrigger>
                    </TabsList>
                </div>

                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {queueType === "role-assignment" ? (
                            roleAssignmentRequests.length === 0 ? (
                                <div className="text-center py-16 bg-card rounded-lg border border-border">
                                    <UserPlus className="mx-auto h-10 w-10 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-medium text-foreground">No {activeTab.toLowerCase()} requests</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Role assignment requests from profile will appear here.</p>
                                </div>
                            ) : (
                                roleAssignmentRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        role="button"
                                        tabIndex={0}
                                        className="rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer group"
                                        onClick={() => {
                                            if (req.status === "PENDING") {
                                                setSelectedRequest(req);
                                                setIsReviewOpen(true);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if ((e.key === "Enter" || e.key === " ") && req.status === "PENDING") {
                                                setSelectedRequest(req);
                                                setIsReviewOpen(true);
                                            }
                                        }}
                                    >
                                        <Card className="border-0 shadow-none">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Briefcase className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-medium text-foreground">
                                                                {req.requestedRoleName} – {req.member?.name}
                                                            </span>
                                                            <Badge variant="secondary" className="text-xs font-mono">
                                                                #{req.id.slice(-4)}
                                                            </Badge>
                                                            {req.assignedRoleId && req.status === "PENDING" && (
                                                                <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
                                                                    Role & competencies created
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3" /> {format(new Date(req.createdAt), "MMM d, yyyy")}
                                                            <span>•</span>
                                                            <span>{req.tenant?.name}</span>
                                                            <span>•</span>
                                                            <span>{req.totalExperienceYears} yrs exp</span>
                                                            <span>•</span>
                                                            <span>{req.context === "current" ? "Current role" : "Aspirational role"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {req.status === "PENDING" ? (
                                                        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                            Review <ChevronRight className="w-3 h-3" />
                                                        </span>
                                                    ) : (
                                                        <Badge
                                                            variant={req.status === "APPROVED" ? "default" : "destructive"}
                                                            className="text-xs"
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
                        ) : queueType === "global-publish" ? (
                            globalRequests.length === 0 ? (
                                <div className="text-center py-16 bg-card rounded-lg border border-border">
                                    <Globe className="mx-auto h-10 w-10 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-medium text-foreground">No global publish requests</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">No {activeTab.toLowerCase()} requests for assessment models.</p>
                                </div>
                            ) : (
                                globalRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        role="button"
                                        tabIndex={0}
                                        className="rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer group"
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
                                        <Card className="border-0 shadow-none">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Globe className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-medium text-foreground">
                                                                {req.entityType} – {req.entityName || req.entityId}
                                                            </span>
                                                            <Badge variant="secondary" className="text-xs font-mono">
                                                                #{req.id.slice(-4)}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3" /> {format(new Date(req.requestedAt), "MMM d, yyyy")}
                                                            <span>•</span>
                                                            <span>By {req.requester?.name || req.requester?.email || "—"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {activeTab === "PENDING" ? (
                                                        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                            Review <ChevronRight className="w-3 h-3" />
                                                        </span>
                                                    ) : (
                                                        <Badge
                                                            variant={req.status === "APPROVED" ? "default" : "destructive"}
                                                            className="text-xs"
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
                            <div className="text-center py-16 bg-card rounded-lg border border-border">
                                <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-medium text-foreground">No {activeTab.toLowerCase()} requests</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Role and competency approval requests will appear here.</p>
                            </div>
                        ) : (
                            requests.map((request) => (
                                <div
                                    key={request.id}
                                    role="button"
                                    tabIndex={0}
                                    className="rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer group"
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        setIsReviewOpen(true);
                                    }}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setSelectedRequest(request); setIsReviewOpen(true); } }}
                                >
                                    <Card className="border-0 shadow-none">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <span className="text-lg">{request.type === "ROLE" ? "🎭" : "🎯"}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium text-foreground">
                                                            {request.type} Request by {request.tenant.name}
                                                        </span>
                                                        <Badge variant="secondary" className="text-xs font-mono">
                                                            #{request.id.slice(-4)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" /> {format(new Date(request.createdAt), "MMM d, yyyy")}
                                                        <span>•</span>
                                                        <Filter className="w-3 h-3" /> ID: {request.entityId.slice(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {activeTab === "PENDING" ? (
                                                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                        Review <ChevronRight className="w-3 h-3" />
                                                    </span>
                                                ) : (
                                                    <Badge
                                                        variant={request.status === "APPROVED" ? "default" : "destructive"}
                                                        className="text-xs"
                                                    >
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
            ) : queueType === "role-assignment" ? (
                <RoleAssignmentRequestReviewDialog
                    request={selectedRequest}
                    open={isReviewOpen}
                    onOpenChange={setIsReviewOpen}
                    onApproved={() => fetchRoleAssignmentRequests(activeTab)}
                    onRejected={() => fetchRoleAssignmentRequests(activeTab)}
                    onRoleCreated={() => fetchRoleAssignmentRequests(activeTab)}
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

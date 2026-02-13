"use client";

import React, { useEffect, useState } from "react";
import {
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    RefreshCcw,
    UserPlus,
    Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { RoleAssignmentRequestReviewDialog } from "@/components/admin/RoleAssignmentRequestReviewDialog";
import { toast } from "sonner";
import { format } from "date-fns";

function cn(...inputs: (string | boolean | undefined)[]) {
    return inputs.filter(Boolean).join(" ");
}

export default function RoleRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("PENDING");

    const fetchRequests = async (status: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/role-assignment-requests?status=${status}`);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data.error || "Failed to load role requests");
                setRequests([]);
                return;
            }
            setRequests(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Failed to load role requests");
            setRequests([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(activeTab);
    }, [activeTab]);

    return (
        <div className="container mx-auto p-8 space-y-12 max-w-7xl pb-24">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 lowercase">
                        Role <span className="text-indigo-600">Assignment Requests</span>
                    </h1>
                    <p className="text-slate-500 font-medium italic">
                        Approve or reject role requests from employees and students. Create roles, assign competencies, and assign to members.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="rounded-xl font-bold italic h-12 border-slate-100 bg-white"
                    onClick={() => fetchRequests(activeTab)}
                >
                    <RefreshCcw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} /> Refresh
                </Button>
            </div>

            <Tabs defaultValue="PENDING" className="w-full space-y-8" onValueChange={setActiveTab}>
                <div className="flex justify-between items-center bg-slate-100 p-1 rounded-2xl h-14 w-fit min-w-[400px]">
                    <TabsList className="bg-transparent h-full">
                        <TabsTrigger
                            value="PENDING"
                            className="rounded-xl font-black italic h-full px-8 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                        >
                            Pending
                        </TabsTrigger>
                        <TabsTrigger
                            value="APPROVED"
                            className="rounded-xl font-black italic h-full px-8 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
                        >
                            Approved
                        </TabsTrigger>
                        <TabsTrigger
                            value="REJECTED"
                            className="rounded-xl font-black italic h-full px-8 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
                        >
                            Rejected
                        </TabsTrigger>
                    </TabsList>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-32 bg-slate-50 border border-slate-100 rounded-[2rem] animate-pulse"
                            />
                        ))}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-slate-300 shadow-sm">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 font-black italic text-lg tracking-tight">
                                No {activeTab.toLowerCase()} requests
                            </p>
                            <p className="text-slate-400 font-medium italic text-sm">
                                Role assignment requests from employees and students will appear here.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {requests.map((req) => (
                            <div
                                key={req.id}
                                role="button"
                                tabIndex={0}
                                className="border-none shadow-sm hover:shadow-xl hover:ring-2 hover:ring-indigo-100 transition-all rounded-[2rem] cursor-pointer group bg-white ring-1 ring-slate-100"
                                onClick={() => {
                                    if (req.status === "PENDING") {
                                        setSelectedRequest(req);
                                        setIsReviewOpen(true);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        (e.key === "Enter" || e.key === " ") &&
                                        req.status === "PENDING"
                                    ) {
                                        setSelectedRequest(req);
                                        setIsReviewOpen(true);
                                    }
                                }}
                            >
                                <Card className="h-full">
                                    <CardContent className="p-8 flex items-center justify-between">
                                        <div className="flex gap-6 items-center">
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 duration-300 bg-indigo-50 text-indigo-600">
                                                <Briefcase className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-black italic tracking-tighter text-slate-900 lowercase">
                                                        {req.requestedRoleName}{" "}
                                                        <span className="text-slate-300 font-serif not-italic">
                                                            –
                                                        </span>{" "}
                                                        {req.member?.name}
                                                    </h3>
                                                    <Badge className="bg-slate-50 text-slate-400 border-none font-black italic lowercase tracking-tight">
                                                        #{req.id.slice(-4)}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <div className="flex items-center gap-1.5 text-slate-400 font-bold italic text-sm">
                                                        <Clock className="w-3.5 h-3.5" />{" "}
                                                        {format(new Date(req.createdAt), "MMM d, yyyy")}
                                                    </div>
                                                    <span className="text-slate-200 text-xs">•</span>
                                                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold italic text-sm">
                                                        {req.tenant?.name} • {req.totalExperienceYears} yrs exp
                                                    </div>
                                                    <span className="text-slate-200 text-xs">•</span>
                                                    <span className="text-slate-500 text-sm italic">
                                                        {req.context === "current"
                                                            ? "Current role"
                                                            : "Aspirational role"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {req.status === "PENDING" ? (
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
                        ))}
                    </div>
                )}
            </Tabs>

            <RoleAssignmentRequestReviewDialog
                request={selectedRequest}
                open={isReviewOpen}
                onOpenChange={setIsReviewOpen}
                onApproved={() => fetchRequests(activeTab)}
                onRejected={() => fetchRequests(activeTab)}
            />
        </div>
    );
}

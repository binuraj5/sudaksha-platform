"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Loader2, Trophy, ArrowRight, ClipboardList, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RequestAssessmentDialog } from "@/components/assessments/RequestAssessmentDialog";

interface Assessment {
    id: string;
    modelName: string;
    roleName?: string;
    competencies: string[];
    status: "NOT_STARTED" | "ACTIVE" | "DRAFT" | "IN_PROGRESS" | "COMPLETED";
    score?: number;
    dueDate?: string;
    completedAt?: string;
    isMandatory?: boolean;
    assignmentType?: "ASSIGNED" | "SELF_SELECTED";
    completionPercentage?: number;
    totalSections?: number;
}

interface AssessmentRequest {
    id: string;
    itemName: string;
    itemType: string;
    note?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    rejectionReason?: string;
}

export default function MyAssessmentsPage() {
    const { data: session } = useSession();
    const user = session?.user as any;
    const isEmployee = user?.role === "EMPLOYEE" || user?.userType === "TENANT" || user?.role === "TENANT_USER" || user?.accountType === "CLIENT_USER";

    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [requests, setRequests] = useState<AssessmentRequest[]>([]);
    const [groupBy, setGroupBy] = useState<"all" | "role" | "competency" | "scores" | "requests">("all");
    const [loading, setLoading] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);

    useEffect(() => {
        if (session) fetchAssessments();
    }, [session]);

    useEffect(() => {
        if (groupBy === "requests" && requests.length === 0) fetchRequests();
    }, [groupBy]);

    async function fetchAssessments() {
        setLoading(true);
        try {
            const res = await fetch("/api/members/me/assessments");
            if (res.ok) {
                const data = await res.json();
                setAssessments(data.assessments || []);
            }
        } finally {
            setLoading(false);
        }
    }

    async function fetchRequests() {
        setLoadingRequests(true);
        try {
            const res = await fetch("/api/members/me/assessment-requests");
            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests || []);
            }
        } finally {
            setLoadingRequests(false);
        }
    }

    // Group by role
    const byRole = assessments.reduce((acc, a) => {
        const key = a.roleName || "No Role";
        if (!acc[key]) acc[key] = [];
        acc[key].push(a);
        return acc;
    }, {} as Record<string, Assessment[]>);

    // Group by competency
    const byCompetency = assessments.reduce((acc, a) => {
        if (!a.competencies || a.competencies.length === 0) {
            if (!acc["No Competency"]) acc["No Competency"] = [];
            acc["No Competency"].push(a);
        } else {
            a.competencies.forEach((c) => {
                if (!acc[c]) acc[c] = [];
                acc[c].push(a);
            });
        }
        return acc;
    }, {} as Record<string, Assessment[]>);

    const completedAssessments = assessments.filter(a => a.status === "COMPLETED");

    const requestStatusBadge = (status: string) => {
        if (status === "PENDING") return <Badge className="bg-yellow-100 text-yellow-700 border-none">Pending Review</Badge>;
        if (status === "APPROVED") return <Badge className="bg-green-100 text-green-700 border-none">Approved</Badge>;
        return <Badge className="bg-red-100 text-red-700 border-none">Rejected</Badge>;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Assessments</h1>
                    <p className="text-gray-500 mt-1">
                        Your organisation-assigned assessments
                    </p>
                </div>

                {/* Request Assessment — only for org employees, replaces Browse */}
                {isEmployee && (
                    <RequestAssessmentDialog onSubmitted={() => {
                        setGroupBy("requests");
                        fetchRequests();
                    }}>
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4" />
                            Request an Assessment
                        </Button>
                    </RequestAssessmentDialog>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
                <TabsList>
                    <TabsTrigger value="all">All Assessments</TabsTrigger>
                    <TabsTrigger value="role">By Role</TabsTrigger>
                    <TabsTrigger value="competency">By Competency</TabsTrigger>
                    <TabsTrigger value="scores">Scores</TabsTrigger>
                    {isEmployee && <TabsTrigger value="requests">My Requests</TabsTrigger>}
                </TabsList>

                {/* ── All Assessments ─────────────────────────────────────── */}
                <TabsContent value="all" className="space-y-4 mt-6">
                    {assessments.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 text-center text-gray-500 py-16">
                                <ClipboardList className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium text-gray-700">No assessments assigned yet.</p>
                                <p className="text-sm mt-1">Your organisation will assign assessments to you. You can also request one above.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        assessments.map((a) => <AssessmentCard key={a.id} assessment={a} />)
                    )}
                </TabsContent>

                {/* ── By Role ─────────────────────────────────────────────── */}
                <TabsContent value="role" className="space-y-6 mt-6">
                    {Object.entries(byRole).map(([role, items]) => (
                        <div key={role}>
                            <h2 className="text-lg font-semibold mb-3 text-gray-800">{role}</h2>
                            <div className="space-y-4">
                                {items.map((a) => <AssessmentCard key={a.id} assessment={a} />)}
                            </div>
                        </div>
                    ))}
                    {Object.keys(byRole).length === 0 && <EmptyState />}
                </TabsContent>

                {/* ── By Competency ────────────────────────────────────────── */}
                <TabsContent value="competency" className="space-y-6 mt-6">
                    {Object.entries(byCompetency).map(([comp, items]) => (
                        <div key={comp}>
                            <h2 className="text-lg font-semibold mb-3 text-gray-800">{comp}</h2>
                            <div className="space-y-4">
                                {items.map((a) => <AssessmentCard key={a.id} assessment={a} />)}
                            </div>
                        </div>
                    ))}
                    {Object.keys(byCompetency).length === 0 && <EmptyState />}
                </TabsContent>

                {/* ── Scores ──────────────────────────────────────────────── */}
                <TabsContent value="scores" className="mt-6">
                    {completedAssessments.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <Trophy className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                <p className="font-medium text-gray-900">No results yet</p>
                                <p className="text-sm text-gray-500 mt-1">Complete an assessment to see your scores here.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-white overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead>Assessment</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Completed On</TableHead>
                                        <TableHead className="w-[120px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completedAssessments.map((a) => (
                                        <TableRow key={a.id}>
                                            <TableCell>
                                                <div className="font-medium text-gray-900">{a.modelName}</div>
                                                {a.roleName && <div className="text-xs text-gray-500">{a.roleName}</div>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {a.score != null ? `${Math.round(a.score)}%` : "—"}
                                                    </span>
                                                    {a.score != null && (
                                                        <Badge className={a.score >= 50 ? "bg-green-50 text-green-700 border-none" : "bg-red-50 text-red-700 border-none"}>
                                                            {a.score >= 50 ? "PASSED" : "FAILED"}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {a.completedAt ? new Date(a.completedAt).toLocaleDateString() : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/assessments/results/${a.id}`}>
                                                        View Report <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                </TabsContent>

                {/* ── My Requests (employees only) ─────────────────────────── */}
                {isEmployee && (
                    <TabsContent value="requests" className="mt-6">
                        {loadingRequests ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : requests.length === 0 ? (
                            <Card>
                                <CardContent className="py-16 text-center">
                                    <ClipboardList className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                    <p className="font-medium text-gray-900">No requests yet</p>
                                    <p className="text-sm text-gray-500 mt-1">Use "Request an Assessment" to ask for one.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-white overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead>Review Target</TableHead>
                                            <TableHead>Requested Type</TableHead>
                                            <TableHead>Date Requested</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {requests.map((r) => (
                                            <TableRow key={r.id}>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">{r.itemName}</div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    <Badge variant="outline">{r.itemType}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {new Date(r.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {requestStatusBadge(r.status)}
                                                        {r.status === "REJECTED" && r.rejectionReason && (
                                                            <p className="text-xs text-red-600">{r.rejectionReason}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function EmptyState() {
    return (
        <Card>
            <CardContent className="py-16 text-center">
                <ClipboardList className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No assessments to display.</p>
            </CardContent>
        </Card>
    );
}

function SectionProgressBar({ completionPercentage, totalSections }: { completionPercentage: number; totalSections: number }) {
    if (totalSections <= 0) return null;

    // How many full sections are done
    const completedSections = Math.round((completionPercentage / 100) * totalSections);
    const pctPerSection = 100 / totalSections;

    return (
        <div className="mt-3 space-y-1">
            <div className="flex gap-1">
                {Array.from({ length: totalSections }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                            i < completedSections
                                ? "bg-blue-500"
                                : "bg-gray-200"
                        }`}
                        title={`Section ${i + 1}${i < completedSections ? " — completed" : ""}`}
                    />
                ))}
            </div>
            <p className="text-xs text-gray-500">
                {completedSections} of {totalSections} section{totalSections !== 1 ? "s" : ""} completed
                {" "}({Math.round(pctPerSection * completedSections)}%)
            </p>
        </div>
    );
}

function AssessmentCard({ assessment }: { assessment: Assessment }) {
    const statusColors: Record<string, string> = {
        NOT_STARTED: "bg-gray-100 text-gray-700",
        ACTIVE: "bg-gray-100 text-gray-700",
        DRAFT: "bg-gray-100 text-gray-700",
        IN_PROGRESS: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
    };

    const isOverdue =
        assessment.dueDate &&
        new Date(assessment.dueDate) < new Date() &&
        assessment.status !== "COMPLETED";

    const showProgress = ["IN_PROGRESS", "ACTIVE"].includes(assessment.status) &&
        (assessment.totalSections ?? 0) > 0 &&
        (assessment.completionPercentage ?? 0) > 0;

    return (
        <Card className={isOverdue ? "border-red-200 bg-red-50/30" : ""}>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{assessment.modelName}</h3>
                            {assessment.isMandatory && (
                                <Badge className="bg-red-100 text-red-700">Mandatory</Badge>
                            )}
                        </div>

                        {assessment.roleName && (
                            <div className="text-sm text-gray-600 mb-1">Role: {assessment.roleName}</div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-2">
                            {assessment.competencies?.map((c) => (
                                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                            ))}
                        </div>

                        {assessment.dueDate && (
                            <div className={`text-sm mt-2 ${isOverdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                                Due: {new Date(assessment.dueDate).toLocaleDateString()}
                                {isOverdue && " (Overdue!)"}
                            </div>
                        )}

                        {showProgress && (
                            <SectionProgressBar
                                completionPercentage={assessment.completionPercentage!}
                                totalSections={assessment.totalSections!}
                            />
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                        <Badge className={statusColors[assessment.status] || "bg-gray-100 text-gray-700"}>
                            {assessment.status.replace("_", " ")}
                        </Badge>

                        {assessment.status === "COMPLETED" && assessment.score !== undefined && (
                            <div className="text-2xl font-bold text-green-600">{assessment.score}%</div>
                        )}

                        {(assessment.status === "NOT_STARTED" || assessment.status === "ACTIVE" || assessment.status === "DRAFT") && (
                            <Button asChild>
                                <Link href={`/assessments/take/${assessment.id}`}>Start Assessment</Link>
                            </Button>
                        )}

                        {assessment.status === "IN_PROGRESS" && (
                            <Button asChild variant="outline">
                                <Link href={`/assessments/take/${assessment.id}`}>Continue</Link>
                            </Button>
                        )}

                        {assessment.status === "COMPLETED" && (
                            <Button asChild variant="outline">
                                <Link href={`/assessments/results/${assessment.id}`}>View Results</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Loader2, Trophy, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Assessment {
    id: string;
    modelName: string;
    roleName?: string;
    competencies: string[];
    status: "NOT_STARTED" | "DRAFT" | "IN_PROGRESS" | "COMPLETED";
    score?: number;
    dueDate?: string;
    isMandatory?: boolean;
    assignmentType?: "ASSIGNED" | "SELF_SELECTED";
}

export default function MyAssessmentsPage() {
    const { data: session } = useSession();
    const user = session?.user;
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [groupBy, setGroupBy] = useState<"all" | "role" | "competency" | "scores">("all");
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState<any[]>([]);
    const [loadingScores, setLoadingScores] = useState(false);

    useEffect(() => {
        if (session) {
            fetchAssessments();
        }
    }, [session]);

    useEffect(() => {
        if (groupBy === "scores" && scores.length === 0) {
            fetchScores();
        }
    }, [groupBy]);

    async function fetchAssessments() {
        setLoading(true);
        try {
            const res = await fetch("/api/members/me/assessments");
            if (res.ok) {
                const data = await res.json();
                setAssessments(data.assessments || []);
            }
        } catch (error) {
            console.error("Failed to load assessments:", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchScores() {
        setLoadingScores(true);
        try {
            const res = await fetch("/api/members/me/assessments");
            if (res.ok) {
                const data = await res.json();
                const completed = (data.assessments || []).filter((a: any) => a.status === "COMPLETED");
                setScores(completed);
            }
        } catch (error) {
            console.error("Failed to load scores:", error);
        } finally {
            setLoadingScores(false);
        }
    }

    // Group assessments by role
    const byRole = assessments.reduce((acc, assessment) => {
        const role = assessment.roleName || "No Role";
        if (!acc[role]) acc[role] = [];
        acc[role].push(assessment);
        return acc;
    }, {} as Record<string, Assessment[]>);

    // Group assessments by competency
    const byCompetency = assessments.reduce((acc, assessment) => {
        if (!assessment.competencies || assessment.competencies.length === 0) {
            if (!acc["No Competency"]) acc["No Competency"] = [];
            acc["No Competency"].push(assessment);
        } else {
            assessment.competencies.forEach((comp) => {
                if (!acc[comp]) acc[comp] = [];
                acc[comp].push(assessment);
            });
        }
        return acc;
    }, {} as Record<string, Assessment[]>);

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
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Assessments
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Track and complete your assigned assessments
                    </p>
                </div>

                {/* Browse button for B2C & Self Assessment */}
                <Button asChild>
                    <Link href="/assessments/individuals/browse">
                        Browse Assessments
                    </Link>
                </Button>
            </div>

            {/* View Toggle */}
            <Tabs value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
                <TabsList>
                    <TabsTrigger value="all">All Assessments</TabsTrigger>
                    <TabsTrigger value="role">By Role</TabsTrigger>
                    <TabsTrigger value="competency">By Competency</TabsTrigger>
                    <TabsTrigger value="scores">Scores</TabsTrigger>
                </TabsList>

                {/* All Assessments View */}
                <TabsContent value="all" className="space-y-4 mt-6">
                    {assessments.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 text-center text-gray-500">
                                No assessments assigned yet.
                                <div className="mt-2">
                                    <Link
                                        href="/assessments/individuals/browse"
                                        className="text-indigo-600 hover:underline"
                                    >
                                        Browse available assessments &rarr;
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        assessments.map((assessment) => (
                            <AssessmentCard
                                key={assessment.id}
                                assessment={assessment}
                            />
                        ))
                    )}
                </TabsContent>

                {/* By Role View */}
                <TabsContent value="role" className="space-y-6 mt-6">
                    {Object.entries(byRole).map(([role, items]) => (
                        <div key={role}>
                            <h2 className="text-xl font-semibold mb-3 text-gray-800">
                                {role}
                            </h2>
                            <div className="space-y-4">
                                {items.map((assessment) => (
                                    <AssessmentCard
                                        key={assessment.id}
                                        assessment={assessment}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </TabsContent>

                {/* By Competency View */}
                <TabsContent value="competency" className="space-y-6 mt-6">
                    {Object.entries(byCompetency).map(([competency, items]) => (
                        <div key={competency}>
                            <h2 className="text-xl font-semibold mb-3 text-gray-800">
                                {competency}
                            </h2>
                            <div className="space-y-4">
                                {items.map((assessment) => (
                                    <AssessmentCard
                                        key={assessment.id}
                                        assessment={assessment}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </TabsContent>

                {/* Scores Tab */}
                <TabsContent value="scores" className="mt-6">
                    {loadingScores ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
                        </div>
                    ) : scores.length === 0 ? (
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
                                    {scores.map((a) => (
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
            </Tabs>
        </div>
    );
}

function AssessmentCard({ assessment }: { assessment: Assessment }) {
    const statusColors: Record<string, string> = {
        NOT_STARTED: "bg-gray-100 text-gray-700",
        DRAFT: "bg-gray-100 text-gray-700",
        IN_PROGRESS: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
    };

    const isOverdue =
        assessment.dueDate &&
        new Date(assessment.dueDate) < new Date() &&
        assessment.status !== "COMPLETED";

    return (
        <Card className={isOverdue ? "border-red-200 bg-red-50/30" : ""}>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                                {assessment.modelName}
                            </h3>
                            {assessment.isMandatory && (
                                <Badge className="bg-red-100 text-red-700">
                                    Mandatory
                                </Badge>
                            )}
                            {assessment.assignmentType === "SELF_SELECTED" && (
                                <Badge className="bg-blue-100 text-blue-700">
                                    Self-Selected
                                </Badge>
                            )}
                        </div>

                        {assessment.roleName && (
                            <div className="text-sm text-gray-600 mb-1">
                                Role: {assessment.roleName}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-2">
                            {assessment.competencies?.map((comp) => (
                                <Badge
                                    key={comp}
                                    variant="outline"
                                    className="text-xs"
                                >
                                    {comp}
                                </Badge>
                            ))}
                        </div>

                        {assessment.dueDate && (
                            <div
                                className={`text-sm mt-2 ${isOverdue
                                    ? "text-red-600 font-medium"
                                    : "text-gray-600"
                                    }`}
                            >
                                Due:{" "}
                                {new Date(
                                    assessment.dueDate
                                ).toLocaleDateString()}
                                {isOverdue && " (Overdue!)"}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <Badge className={statusColors[assessment.status] || "bg-gray-100 text-gray-700"}>
                            {assessment.status.replace("_", " ")}
                        </Badge>

                        {assessment.status === "COMPLETED" &&
                            assessment.score !== undefined && (
                                <div className="text-2xl font-bold text-green-600">
                                    {assessment.score}%
                                </div>
                            )}

                        {(assessment.status === "NOT_STARTED" || assessment.status === "DRAFT") && (
                            <Button asChild>
                                <Link
                                    href={`/assessments/take/${assessment.id}`}
                                >
                                    Start Assessment
                                </Link>
                            </Button>
                        )}

                        {assessment.status === "IN_PROGRESS" && (
                            <Button asChild variant="outline">
                                <Link
                                    href={`/assessments/take/${assessment.id}`}
                                >
                                    Continue
                                </Link>
                            </Button>
                        )}

                        {assessment.status === "COMPLETED" && (
                            <Button asChild variant="outline">
                                <Link
                                    href={`/assessments/results/${assessment.id}`}
                                >
                                    View Results
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

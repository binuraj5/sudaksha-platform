import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    User,
    ChevronLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Award,
    BarChart3,
    FileText,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function CandidateReportingPage({
    params,
}: {
    params: Promise<{ clientId: string; projectId: string; assignmentId: string; userId: string }>;
}) {
    const session = await getApiSession();
    const { clientId, projectId, assignmentId, userId } = await params;

    const user = session?.user as any;
    if (!session || !user || (user.role !== "SUPER_ADMIN" && user.role !== "CLIENT_ADMIN") || (user.role === "CLIENT_ADMIN" && user.clientId !== clientId)) {
        redirect("/assessments/login");
    }

    const userAssessment = await prisma.projectUserAssessment.findFirst({
        where: {
            userId,
            projectAssignmentId: assignmentId
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    accountType: true,
                    dept: { select: { name: true } }
                }
            },
            projectAssignment: {
                include: {
                    model: {
                        select: { name: true, durationMinutes: true }
                    }
                }
            },
            componentResults: {
                include: {
                    component: {
                        include: { competency: { select: { name: true, category: true } } }
                    }
                }
            }
        }
    });

    if (!userAssessment) {
        notFound();
    }

    // Type assertion: findFirst with include returns relations but Prisma type can be narrow
    type AssessmentWithRelations = typeof userAssessment & {
        user: { name: string; email: string; accountType?: unknown; dept: { name: string } | null };
        projectAssignment: { createdAt: Date; model: { name: string; durationMinutes: number | null } };
        componentResults: { id: string; status: string; score: number | null; timeSpent: number | null; component: { order: number; competency: { name: string; category: string } | null } }[];
    };
    const assessment = userAssessment as AssessmentWithRelations;

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href={`/assessments/clients/${clientId}/projects/${projectId}/assignments/${assignmentId}`}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Assignment
                    </Link>
                </Button>
            </div>

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{assessment.user.name}</h1>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span>{assessment.user.email}</span>
                            <span>•</span>
                            <Badge variant="secondary" className="font-normal">
                                {assessment.user.dept?.name || "Unassigned Dept"}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Assigned on {formatDate(assessment.projectAssignment.createdAt)}
                    </div>
                    <Badge className={assessment.status === 'COMPLETED' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                        {assessment.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase">Overall Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="relative h-32 w-32 flex items-center justify-center">
                            <svg className="h-full w-full" viewBox="0 0 36 36">
                                <path
                                    className="text-gray-100"
                                    strokeDasharray="100, 100"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-blue-600"
                                    strokeDasharray={`${assessment.overallScore || 0}, 100`}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-bold">{assessment.overallScore || 0}%</span>
                                <span className="text-[10px] text-gray-500 uppercase">Score</span>
                            </div>
                        </div>

                        <div className="mt-6 w-full space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Result</span>
                                <span className={assessment.passed ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                    {assessment.passed ? "PASSED" : "FAILED"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Completion</span>
                                <span className="font-medium text-gray-900">{assessment.completionPercentage}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline & Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Assessment Timeline</CardTitle>
                        <CardDescription>
                            Key milestones in this candidate's assessment journey.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                            <div className="relative">
                                <div className="absolute -left-8 top-1 h-5 w-5 bg-white border-2 border-green-500 rounded-full flex items-center justify-center z-10">
                                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Assigned to Project</p>
                                    <p className="text-xs text-gray-500">{formatDate(assessment.projectAssignment.createdAt)}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className={`absolute -left-8 top-1 h-5 w-5 bg-white border-2 ${assessment.startedAt ? 'border-green-500' : 'border-gray-200'} rounded-full flex items-center justify-center z-10`}>
                                    <div className={`h-2 w-2 ${assessment.startedAt ? 'bg-green-500' : 'bg-gray-100'} rounded-full`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Assessment Started</p>
                                    <p className="text-xs text-gray-500">{assessment.startedAt ? formatDate(assessment.startedAt) : "Pending"}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className={`absolute -left-8 top-1 h-5 w-5 bg-white border-2 ${assessment.completedAt ? 'border-green-500' : 'border-gray-200'} rounded-full flex items-center justify-center z-10`}>
                                    <div className={`h-2 w-2 ${assessment.completedAt ? 'bg-green-500' : 'bg-gray-100'} rounded-full`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Assessment Completed</p>
                                    <p className="text-xs text-gray-500">{assessment.completedAt ? formatDate(assessment.completedAt) : "Not yet finished"}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Component Breakdown */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Component Breakdown</h2>
                </div>

                <Card className="bg-white overflow-hidden shadow-sm border-gray-200">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Assessment Component</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead className="text-right">Time Spent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assessment.componentResults.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 italic">
                                        No component results available yet. Data will populate as the candidate progresses.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assessment.componentResults.map((result: { id: string; status: string; score: number | null; timeSpent: number | null; component: { order: number; competency: { name: string; category: string } | null } }) => (
                                    <TableRow key={result.id}>
                                        <TableCell className="font-medium text-gray-900">
                                            {result.component.competency?.name ?? `Section ${result.component.order}`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {result.component.competency?.category?.toLowerCase().replace('_', ' ') ?? '—'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={result.status === 'COMPLETED' ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}>
                                                {result.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-gray-900">{result.score || 0}%</span>
                                        </TableCell>
                                        <TableCell className="text-right text-gray-500 font-mono text-xs">
                                            {result.timeSpent ? `${result.timeSpent}m` : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed">
                <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-gray-400" />
                    <div>
                        <p className="font-medium text-gray-900">Download Official Report</p>
                        <p className="text-sm text-gray-500">Generate a comprehensive PDF certificate and competency report.</p>
                    </div>
                </div>
                <Button disabled variant="outline" className="bg-white">
                    Download PDF
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

import { getApiSession } from "@/lib/get-session";
import { resolveTenantLabels } from "@/lib/tenant-resolver";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    ClipboardList,
    ChevronLeft,
    User,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Mail,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function AssignmentDetailsPage({
    params,
}: {
    params: Promise<{ clientId: string; projectId: string; assignmentId: string }>;
}) {
    const session = await getApiSession();
    const { clientId, projectId, assignmentId } = await params;

    const user = session?.user as any;
    const userClientId = user?.clientId || user?.tenantId;
    if (!session || !user || !["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "TEAM_LEAD"].includes(user.role)) {
        redirect("/assessments/login");
    }
    if (user.role !== "SUPER_ADMIN" && userClientId !== clientId) {
        redirect("/assessments/login");
    }

    const assignment = await prisma.projectAssessmentModel.findFirst({
        where: { id: assignmentId, projectId },
        include: {
            model: {
                select: {
                    name: true,
                    durationMinutes: true
                }
            },
            department: {
                select: { name: true }
            },
            userAssignments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            dept: { select: { name: true } }
                        }
                    }
                },
                orderBy: {
                    user: { name: 'asc' }
                }
            }
        }
    });

    if (!assignment) {
        notFound();
    }

    const labels = await resolveTenantLabels(clientId);

    // Calculate Stats
    const totalEnrolled = assignment.userAssignments.length;
    const completed = assignment.userAssignments.filter(a => a.status === 'COMPLETED' || a.status === 'SUBMITTED').length;
    const pending = totalEnrolled - completed;
    const completionRate = totalEnrolled > 0 ? Math.round((completed / totalEnrolled) * 100) : 0;

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href={`/assessments/clients/${clientId}/projects/${projectId}`}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Project
                    </Link>
                </Button>
            </div>

            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-50 rounded-xl">
                            <ClipboardList className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{assignment.model.name}</h1>
                            <p className="text-gray-500">Progress Tracking & Reporting</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Nudge Pending
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Results
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500 uppercase">Enrolled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEnrolled}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500 uppercase">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {completed}
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                {completionRate}%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500 uppercase">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500 uppercase">Avg. Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignment.averageScore || 'N/A'}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Enrolled {labels.memberPlural}</h2>
                </div>

                <Card className="bg-white overflow-hidden shadow-sm border-gray-200">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>{labels.member}</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Started</TableHead>
                                <TableHead>Completed</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignment.userAssignments.map((ua) => (
                                <TableRow key={ua.id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{ua.user.name}</span>
                                            <span className="text-[10px] text-gray-500">{ua.user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {ua.status === 'COMPLETED' ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Completed
                                                </Badge>
                                            ) : ua.status === 'ACTIVE' ? (
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> In Progress
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-500 border-gray-200 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> Not Started
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {ua.overallScore !== null ? (
                                            <div className="font-semibold text-gray-700">{ua.overallScore}%</div>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500">
                                        {ua.startedAt ? formatDate(ua.startedAt) : '—'}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500">
                                        {ua.completedAt ? formatDate(ua.completedAt) : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                            <Link href={`/assessments/clients/${clientId}/projects/${projectId}/assignments/${assignmentId}/users/${ua.userId}`}>
                                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}

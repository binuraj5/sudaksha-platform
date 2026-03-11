import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, ArrowRight, Users, MessageSquare, Headphones, Video } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getAllAssessmentModels, getAdminAssessmentResponses } from "@/lib/assessment-responses-actions";

export default async function AdminAllResponsesPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ assessment?: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;
    const { assessment: assessmentFilter } = await searchParams;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    const u = session.user as { tenantSlug?: string; role?: string; userType?: string; id?: string };
    const isSuperAdmin = u.userType === "SUPER_ADMIN" || u.role === "SUPER_ADMIN";
    const isAdmin = isSuperAdmin || ["TENANT_ADMIN", "DEPARTMENT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"].includes(u.role || "");
    const hasAccess = isSuperAdmin || u.tenantSlug === slug;

    if (!hasAccess) {
        redirect(u.tenantSlug ? `/assessments/org/${u.tenantSlug}/dashboard` : "/assessments");
    }

    if (!isAdmin) {
        redirect(u.tenantSlug ? `/assessments/org/${u.tenantSlug}/dashboard` : "/assessments");
    }

    const basePath = `/assessments/org/${slug}`;

    // Fetch assessments and models
    const assessments = await getAdminAssessmentResponses(slug, assessmentFilter);
    const assessmentModels = await getAllAssessmentModels(slug);

    // Group responses by assessment model
    const responsesByModel = assessmentModels.map((model: any) => ({
        modelId: model.id,
        modelName: model.name,
        completedCount: model._count.memberAssessments,
        responses: assessments.filter((a: any) => a.assessmentModelId === model.id),
    }));

    const selectedModel = assessmentFilter ? responsesByModel.find((m: any) => m.modelId === assessmentFilter) : null;
    const displayResponses = selectedModel ? selectedModel.responses : assessments;

    const totalResponses = assessments.length;
    const totalModels = assessmentModels.length;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">All Assessment Responses</h1>
                        <p className="text-gray-500 font-medium">
                            {totalResponses} responses across {totalModels} assessments
                        </p>
                    </div>
                </div>
            </div>

            {/* Assessment Filter */}
            {assessmentModels.length > 0 && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none rounded-2xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-gray-700">Filter by Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Link href={basePath + "/responses"}>
                            <Button
                                variant={!selectedModel ? "default" : "outline"}
                                className="rounded-lg"
                            >
                                All Assessments ({totalResponses})
                            </Button>
                        </Link>
                        {assessmentModels.map((model: any) => (
                            <Link key={model.id} href={`${basePath}/responses?assessment=${model.id}`}>
                                <Button
                                    variant={selectedModel?.modelId === model.id ? "default" : "outline"}
                                    className="rounded-lg"
                                >
                                    {model.name} ({model._count.memberAssessments})
                                </Button>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Main Content */}
            {displayResponses.length === 0 ? (
                <Card className="py-20 text-center border-dashed rounded-3xl border-2">
                    <CardContent>
                        <FileText className="h-12 w-12 text-gray-200 mx-auto" />
                        <h3 className="mt-4 text-xl font-black text-gray-900">No responses yet</h3>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto">
                            No members have completed assessments yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {responsesByModel.map((modelGroup: any) =>
                        modelGroup.responses.length > 0 ? (
                            <div key={modelGroup.modelId} className="space-y-3">
                                <div className="flex items-center gap-2 px-2">
                                    <h2 className="font-bold text-lg text-gray-900">{modelGroup.modelName}</h2>
                                    <Badge variant="secondary" className="rounded-full">
                                        {modelGroup.responses.length}
                                    </Badge>
                                </div>

                                <Card className="bg-white overflow-hidden shadow-md shadow-slate-100 border-none rounded-2xl">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="border-slate-100">
                                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest pl-6">
                                                    Respondent
                                                </TableHead>
                                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                                                    Role / Department
                                                </TableHead>
                                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                                                    Score
                                                </TableHead>
                                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                                                    Date
                                                </TableHead>
                                                <TableHead className="w-[100px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {modelGroup.responses.map((response: any) => (
                                                <TableRow key={response.id} className="border-slate-50 hover:bg-blue-50/20 transition-colors">
                                                    <TableCell className="pl-6 py-4">
                                                        <div className="font-semibold text-slate-900">{response.member.name}</div>
                                                        <div className="text-[11px] text-slate-400 font-mono">{response.member.email}</div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="text-sm font-semibold text-slate-700">
                                                            {response.member.currentRole?.name || "—"}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400">
                                                            {response.member.orgUnit?.name || "—"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg font-black text-slate-900">
                                                                {Math.round(response.overallScore || 0)}%
                                                            </span>
                                                            {response.passed ? (
                                                                <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg font-black italic text-[10px]">
                                                                    PASSED
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-rose-50 text-rose-600 border-none rounded-lg font-black italic text-[10px]">
                                                                    BELOW TARGET
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-400 font-mono py-4">
                                                        {response.completedAt ? formatDate(response.completedAt) : "N/A"}
                                                    </TableCell>
                                                    <TableCell className="pr-6">
                                                        <Button
                                                            variant="ghost"
                                                            className="h-9 hover:bg-white hover:shadow-md rounded-lg font-bold flex gap-2"
                                                            asChild
                                                        >
                                                            <Link href={`${basePath}/responses/${response.id}`}>
                                                                View
                                                                <ArrowRight className="h-4 w-4 text-blue-500" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                        ) : null
                    )}
                </div>
            )}
        </div>
    );
}

import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    Trophy,
    Calendar,
    Clock,
    FileText,
    BrainCircuit,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CompetencyGapAnalysis } from "@/components/assessments/CompetencyGapAnalysis";

export default async function IndividualResultPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getApiSession();
    const { id } = await params;

    if (!session) {
        redirect("/assessments/login");
    }

    let assessment = await prisma.projectUserAssessment.findFirst({
        where: { id, userId: session.user.id },
        include: {
            projectAssignment: {
                include: {
                    model: true
                }
            },
            componentResults: {
                include: {
                    component: { include: { competency: true } }
                }
            }
        }
    });

    let isB2C = false;
    if (!assessment) {
        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "", type: "INDIVIDUAL" },
            select: { id: true }
        });
        if (member) {
            const memberAssessment = await prisma.memberAssessment.findFirst({
                where: { id, memberId: member.id },
                include: {
                    assessmentModel: true,
                    member: { select: { name: true } }
                }
            });
            if (memberAssessment) {
                const uam = await prisma.userAssessmentModel.findFirst({
                    where: { userId: session.user.id!, modelId: memberAssessment.assessmentModelId },
                    orderBy: { createdAt: "desc" },
                    include: {
                        componentResults: {
                            include: {
                                component: { include: { competency: true } }
                            }
                        }
                    }
                });
                if (uam) {
                    isB2C = true;
                    const componentResults = uam.componentResults;
                    const totalTimeSpent = componentResults.reduce((s: number, r: { timeSpent?: number | null }) => s + (r.timeSpent ?? 0), 0);
                    assessment = {
                        id: memberAssessment.id,
                        status: memberAssessment.status,
                        overallScore: memberAssessment.overallScore,
                        passed: memberAssessment.passed,
                        completedAt: memberAssessment.completedAt,
                        totalTimeSpent,
                        projectAssignment: { model: memberAssessment.assessmentModel },
                        componentResults
                    } as any;
                }
            }
        }
    }

    if (!assessment) {
        notFound();
    }

    return (
        <div className="space-y-8 mt-12 pb-12">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href={isB2C ? "/assessments/individuals/dashboard" : "/assessments/results"}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {isB2C ? "Back to Dashboard" : "Back to My Results"}
                    </Link>
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Summary Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-gradient-to-br from-red-600 to-red-800 text-white border-none shadow-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white/90">
                                <Trophy className="h-5 w-5" />
                                Overall Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-6xl font-black">{Math.round(assessment.overallScore || 0)}%</div>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] text-white/60 uppercase font-black">Status</p>
                                    <Badge className="bg-white/20 text-white border-none mt-1 uppercase text-[10px]">
                                        {assessment.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/60 uppercase font-black">Passed</p>
                                    <p className="text-sm font-bold mt-1">
                                        {assessment.passed ? "Qualified" : "Near Target"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-gray-100 italic">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                Assessment Context
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <h4 className="font-bold text-gray-900">{assessment.projectAssignment?.model?.name ?? "Assessment"}</h4>
                                <p className="text-xs text-gray-400 line-clamp-2">{assessment.projectAssignment?.model?.description ?? ""}</p>
                            </div>

                            <div className="pt-4 border-t space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Date Taken</span>
                                    <span className="font-bold text-gray-700">{assessment.completedAt ? format(assessment.completedAt, 'PPP') : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Total Duration</span>
                                    <span className="font-bold text-gray-700">{assessment.totalTimeSpent != null ? `${Math.round(Number(assessment.totalTimeSpent) / 60)} mins` : "—"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Gap Analysis & Component Results */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Integrated Gap Analysis (Phase 5) - org assessments only */}
                    {!isB2C && <CompetencyGapAnalysis assessmentId={id} />}

                    {/* Component-wise Breakdown */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-red-600" />
                            Section Breakdowns
                        </h3>
                        {(!assessment.componentResults || assessment.componentResults.length === 0) ? (
                            <Card className="border-dashed">
                                <CardContent className="p-8 text-center text-gray-500">
                                    <p>No section breakdown available.</p>
                                    <p className="text-sm mt-2">Sections will appear here once you complete the assessment.</p>
                                </CardContent>
                            </Card>
                        ) : (
                        <div className="grid gap-4">
                            {assessment.componentResults.map((res: { id: string; status: string; component: unknown; score?: number | null; percentage?: number | null }) => (
                                <Card key={res.id} className="hover:border-red-100 transition-colors shadow-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${res.status === 'COMPLETED' ? 'bg-green-50' : 'bg-gray-50'}`}>
                                                <CheckCircle2 className={`h-5 w-5 ${res.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-300'}`} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900">{(res.component as { competency?: { name?: string }; order?: number }).competency?.name ?? `Section ${((res.component as { order?: number }).order ?? 0) + 1}`}</h4>
                                                <Badge variant="outline" className="text-[10px] uppercase border-none bg-gray-100 text-gray-500">
                                                    {(res.component as { competency?: { name?: string } }).competency?.name ? "Competency" : "Section"}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-black text-gray-900">{Math.round((res as { score?: number; percentage?: number }).percentage ?? (res as { score?: number }).score ?? 0)}%</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Score</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        )}
                    </div>

                    {isB2C && (
                        <Card className="border-gray-200">
                            <CardContent className="p-6 flex justify-center">
                                <Button asChild className="bg-gray-900 hover:bg-gray-800">
                                    <Link href="/assessments/individuals/dashboard">Return to Dashboard</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

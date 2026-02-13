import { getApiSession } from "@/lib/get-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, Award, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { resolveTenantLabels } from "@/lib/tenant-resolver";
import { StatsGrid } from "@/components/Dashboard/StatsGrid";
import { GapAnalysisChart } from "@/components/Dashboard/GapAnalysisChart";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { DashboardContent } from "@/components/Dashboard/DashboardContent";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const ADMIN_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD"];

export default async function TenantDashboard({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const session = await getApiSession();

    if (!session || !session.user) {
        redirect("/assessments/login");
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) redirect("/");

    const role = (session.user as any).role;
    const isAdmin = ADMIN_ROLES.includes(role);

    if (isAdmin) {
        const labels = await resolveTenantLabels(tenant.id);
        return (
            <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                            {labels.dashboard}
                        </h1>
                        <p className="text-gray-500 font-medium">Talent Intelligence & Assessment Overview</p>
                    </div>
                </header>
                <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>}>
                    <DashboardContent clientId={tenant.id} labels={labels} basePath={`/assessments/org/${slug}`} />
                </Suspense>
            </div>
        );
    }

    // Fetch user's assigned assessments within this tenant
    const memberAssessments = await (prisma as any).memberAssessment.findMany({
        where: {
            memberId: (session.user as any).id,
            assessmentModel: {
                tenantId: tenant.id
            }
        },
        include: {
            assessmentModel: true,
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    const pendingCount = memberAssessments.filter((a: any) => a.status === 'NOT_STARTED' || a.status === 'IN_PROGRESS').length;
    const completedCount = memberAssessments.filter((a: any) => a.status === 'COMPLETED').length;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">My Dashboard</h1>
                    <p className="text-gray-500 font-medium">Welcome back, {session.user.name}. Here's your progress at <span className="text-indigo-600 font-bold">{tenant.name}</span>.</p>
                </div>
                <div className="flex gap-3">
                    <Link href={`/assessments/org/${slug}/assessments/interview/new`}>
                        <Button variant="outline" className="h-12 px-6 rounded-xl gap-2 font-bold border-gray-200">
                            <BrainCircuit className="h-5 w-5 text-indigo-600" />
                            AI Interview
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatsCard title="Assigned" value={memberAssessments.length} icon={<Clock className="text-indigo-600" />} color="indigo" />
                <StatsCard title="Completed" value={completedCount} icon={<Award className="text-emerald-600" />} color="emerald" />
                <StatsCard title="Certificates" value="0" icon={<Award className="text-amber-600" />} color="amber" />
            </div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Assessments</h2>
                <Link href={`/assessments/org/${slug}/assessments`} className="text-sm font-bold text-indigo-600 hover:underline">View All</Link>
            </div>

            {memberAssessments.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No assessments assigned to you yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memberAssessments.map((assign: any) => (
                        <Card key={assign.id} className="rounded-3xl border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group overflow-hidden">
                            <CardHeader className="pb-3 px-6 pt-6">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className={`${assign.status === "IN_PROGRESS" ? "bg-indigo-100 text-indigo-600" :
                                        assign.status === "COMPLETED" ? "bg-emerald-100 text-emerald-600" :
                                            "bg-gray-100 text-gray-500"
                                        } border-0 rounded-lg px-2 py-1 font-bold text-[10px] uppercase tracking-wider`}>
                                        {assign.status.replace("_", " ")}
                                    </Badge>
                                    <span className="text-[10px] font-black text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                                        <Clock className="w-3 h-3" /> {assign.assessmentModel.durationMinutes} Min
                                    </span>
                                </div>
                                <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem] tracking-tight">{assign.assessmentModel.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 pt-2">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <span>Progress</span>
                                            <span>{assign.completionPercentage || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-indigo-600 h-full transition-all duration-1000"
                                                style={{ width: `${assign.completionPercentage || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    <Link href={`/assessments/org/${slug}/assessments/take/${assign.id}`}>
                                        <Button className="w-full h-12 bg-gray-900 hover:bg-black text-white font-black italic rounded-xl transition-all group-hover:scale-[1.02]">
                                            {assign.status === "NOT_STARTED" ? "Start Now" : assign.status === "COMPLETED" ? "View Insights" : "Resume"}
                                            <PlayCircle className="w-5 h-5 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon, color }: any) {
    const colorMap: any = {
        indigo: "bg-indigo-50",
        emerald: "bg-emerald-50",
        amber: "bg-amber-50"
    };
    return (
        <Card className="rounded-3xl border-gray-100 hover:border-indigo-100 transition-colors shadow-none bg-white">
            <CardContent className="p-8 flex items-center gap-6">
                <div className={`p-4 ${colorMap[color]} rounded-2xl`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
                </div>
            </CardContent>
        </Card>
    )
}

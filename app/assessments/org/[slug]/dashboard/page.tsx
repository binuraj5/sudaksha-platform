import { getApiSession } from "@/lib/get-session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Clock, Award } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { resolveTenantLabels } from "@/lib/tenant-resolver";
import { DashboardContent } from "@/components/Dashboard/DashboardContent";
import { PersonalAssessmentsList } from "@/components/assessments/PersonalAssessmentsList";
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

    const sessionRole = (session.user as any).role;
    const userType = (session.user as any).userType;

    // Fast check via session
    let isAdmin = ADMIN_ROLES.includes(sessionRole) || userType === "SUPER_ADMIN" || userType === "TENANT_ADMIN";

    // Deep check via DB
    if (!isAdmin) {
        const member = await prisma.member.findUnique({
            where: { email: session.user.email! },
            include: { managedUnits: { select: { id: true } } }
        });

        if (member) {
            if (ADMIN_ROLES.includes(member.role) || member.managedUnits.length > 0) {
                isAdmin = true;
            }
        }
    }

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
            assessmentModel: {
                include: {
                    role: { select: { id: true, name: true } }
                }
            },
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

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

            <PersonalAssessmentsList
                assessments={memberAssessments}
                slug={slug}
                userName={session.user.name || "User"}
                tenantName={tenant.name}
            />
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

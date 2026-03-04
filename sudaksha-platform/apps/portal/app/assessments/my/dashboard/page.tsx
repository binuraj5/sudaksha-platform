import { getApiSession } from "@/lib/get-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, Award, BrainCircuit, Sparkles } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function PersonalDashboard() {
    const session = await getApiSession();

    if (!session || !session.user) {
        redirect("/assessments/login");
    }

    // Fetch user's individual assessments (those not linked to a tenant, OR explicitly assigned to them as an individual)
    const memberAssessments = await (prisma as any).memberAssessment.findMany({
        where: {
            memberId: (session.user as any).id,
        },
        include: {
            assessmentModel: true,
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    const completedCount = memberAssessments.filter((a: any) => a.status === 'COMPLETED').length;

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Growth Hub</h1>
                    <p className="text-slate-500 font-medium italic">Welcome back, {session.user.name}. Your personal skill development journey.</p>
                </div>
                <Link href="/assessments/my/assessments/new">
                    <Button className="h-14 px-8 rounded-2xl gap-3 font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 italic transition-all active:scale-95">
                        <Sparkles className="h-5 w-5" />
                        Explore New Skills
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <StatsCard title="In Progress" value={memberAssessments.length - completedCount} icon={<Clock className="text-indigo-600" />} color="indigo" />
                <StatsCard title="Completed" value={completedCount} icon={<Award className="text-emerald-600" />} color="emerald" />
                <StatsCard title="Global Rank" value="Top 15%" icon={<BrainCircuit className="text-purple-600" />} color="purple" />
            </div>

            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-10 relative z-10">Recent Activity</h2>

                {memberAssessments.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 relative z-10">
                        <p className="text-slate-400 font-medium font-italic">No assessments taken yet. Start your journey today!</p>
                    </div>
                ) : (
                    <div className="space-y-6 relative z-10">
                        {memberAssessments.map((assign: any) => (
                            <div key={assign.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                                <div className="flex items-center gap-6 mb-4 md:mb-0">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 transition-colors">
                                        {assign.assessmentModel.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{assign.assessmentModel.name}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <Badge className="bg-slate-100 text-slate-500 border-none text-[10px] font-black tracking-widest uppercase px-2">
                                                {assign.status}
                                            </Badge>
                                            <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                                <Clock className="w-3 h-3" /> {assign.assessmentModel.durationMinutes} Mins
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden md:block">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                                        <p className="text-lg font-black text-slate-900 tracking-tight">{assign.score || 'N/A'}</p>
                                    </div>
                                    <Link href={`/assessments/my/assessments/take/${assign.id}`}>
                                        <Button className="h-12 px-6 rounded-xl bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white font-black italic transition-all">
                                            {assign.status === "COMPLETED" ? "Insights" : "Continue"}
                                            <PlayCircle className="w-5 h-5 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, color }: any) {
    const colorMap: any = {
        indigo: "bg-indigo-50",
        emerald: "bg-emerald-50",
        purple: "bg-purple-50"
    };
    return (
        <Card className="rounded-[32px] border-none shadow-xl shadow-slate-200/40 bg-white hover:-translate-y-1 transition-transform">
            <CardContent className="p-8 flex items-center gap-6">
                <div className={`p-5 ${colorMap[color]} rounded-2xl`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
                </div>
            </CardContent>
        </Card>
    )
}

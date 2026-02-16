import { getApiSession } from "@/lib/get-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, Award, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function B2CUserDashboard() {
    const session = await getApiSession();

    if (!session || !session.user) {
        redirect("/assessments/login");
    }

    // B2C: resolve Member by session user email (type INDIVIDUAL), then fetch MemberAssessment by memberId
    const member = await prisma.member.findFirst({
        where: {
            email: (session.user as { email?: string }).email ?? "",
            type: "INDIVIDUAL",
        },
        select: { id: true },
    });

    const memberAssessments = member
        ? await prisma.memberAssessment.findMany({
              where: { memberId: member.id },
              include: { assessmentModel: true },
              orderBy: { updatedAt: "desc" },
          })
        : [];

    const pendingCount = memberAssessments.filter(a => a.status === 'DRAFT' || a.status === 'ACTIVE').length;
    const completedCount = memberAssessments.filter(a => a.status === 'COMPLETED').length;

    // Fallback for interviews (if using separate table)
    // For now assuming interviews might be linked or we fetch separately

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
                    <p className="text-slate-500">Welcome back, {session.user.name}. Track your progress and take assessments.</p>
                </div>
                <Link href="/assessments/interview/new">
                    <Button variant="outline" className="gap-2">
                        <BrainCircuit className="h-4 w-4" />
                        Take AI Interview
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatsCard title="Pending" value={pendingCount} icon={<Clock className="text-orange-500" />} />
                <StatsCard title="Completed" value={completedCount} icon={<Award className="text-green-500" />} />
                <StatsCard title="Certificates" value="0" icon={<Award className="text-blue-500" />} />
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-4">Assigned Assessments</h2>
            {memberAssessments.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    <p>No assessments assigned yet.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memberAssessments.map((assign) => (
                        <Card key={assign.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant={assign.status === "ACTIVE" ? "default" : assign.status === "COMPLETED" ? "outline" : "secondary"}>
                                        {assign.status.replace("_", " ")}
                                    </Badge>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {assign.assessmentModel.durationMinutes} min
                                    </span>
                                </div>
                                <CardTitle className="text-lg mt-2 truncate">{assign.assessmentModel.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full transition-all"
                                            style={{ width: `${assign.completionPercentage || 0}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-slate-500">
                                        <span>{assign.completionPercentage || 0}% Complete</span>
                                        {/* {assign.dueDate && <span>Due: {assign.dueDate}</span>} */}
                                    </div>

                                    <Link href={`/assessments/take/${assign.id}`}>
                                        <Button className="w-full mt-2" disabled={assign.status === 'COMPLETED'}>
                                            {assign.status === "DRAFT" ? "Start Assessment" : assign.status === "COMPLETED" ? "View Results" : "Continue"}
                                            <PlayCircle className="w-4 h-4 ml-2" />
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

function StatsCard({ title, value, icon }: any) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-full">
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                </div>
            </CardContent>
        </Card>
    )
}

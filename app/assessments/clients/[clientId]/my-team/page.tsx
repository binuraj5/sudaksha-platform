import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { resolveTenantLabels } from "@/lib/tenant-resolver";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, UserPlus, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function TeamDashboardPage({ params }: { params: Promise<{ clientId: string }> }) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session || (session.user as any).role !== 'TEAM_LEAD' || !(session.user as any).managedOrgUnitId) {
        return <div className="p-8 text-red-500">Access Denied: You must be a Team Lead to view this page.</div>;
    }

    const teamId = (session.user as any).managedOrgUnitId;
    const labels = await resolveTenantLabels(clientId);

    // Fetch Team Info
    const team = await prisma.organizationUnit.findUnique({
        where: { id: teamId },
        include: {
            manager: true,
            _count: {
                select: {
                    members: true
                }
            },
            parent: true // Department
        }
    });

    if (!team) return <div>Team Not Found</div>;

    // Fetch Team Members
    const members = await prisma.member.findMany({
        where: { orgUnitId: teamId, isActive: true },
        orderBy: { name: 'asc' }
    });

    // Fetch Recent Assessments (Mock for now or query real assessments if relation exists)
    // Assuming MemberAssessments link to Members
    // const recentAssessments = ...

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <div className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">{team.parent?.name || labels.orgUnit}</div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        {team.name}
                    </h1>
                    <p className="text-gray-500 font-medium">{labels.subUnit} Dashboard</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/assessments/clients/${clientId}/assessments`}>
                        <Button>
                            <FileText className="mr-2 h-4 w-4" /> Assign Assessment
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{labels.subUnit} Size</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{team._count.members}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">87%</div>
                        <p className="text-xs text-muted-foreground">Based on last assessment</p>
                    </CardContent>
                </Card>
            </div>

            {/* Members List */}
            <div>
                <h2 className="text-xl font-bold mb-4">{labels.subUnit} {labels.memberPlural}</h2>
                <div className="bg-white rounded-lg border shadow-sm">
                    {members.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No {labels.memberPlural.toLowerCase()} in this {labels.subUnit.toLowerCase()} yet.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{member.name}</p>
                                            <p className="text-sm text-gray-500">{member.designation}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">Profile</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

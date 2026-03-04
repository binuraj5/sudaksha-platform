import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { resolveTenantLabels } from "@/lib/tenant-resolver";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, UserPlus, GitBranch, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DepartmentDashboardPage({ params }: { params: Promise<{ clientId: string }> }) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session || ((session.user as any).role !== 'DEPARTMENT_HEAD' && (session.user as any).role !== 'DEPT_HEAD') || !(session.user as any).managedOrgUnitId) {
        // Fallback or unauthorized
        return <div className="p-8 text-red-500">Access Denied: You must be a Department Head to view this page.</div>;
    }

    const deptId = (session.user as any).managedOrgUnitId;
    const labels = await resolveTenantLabels(clientId);

    // Fetch Department Info & Stats
    const department = await prisma.organizationUnit.findUnique({
        where: { id: deptId },
        include: {
            manager: true,
            _count: {
                select: {
                    members: true, // Direct members + maybe recursive if needed (but schema relation is direct)
                    children: true // Teams
                }
            }
        }
    });

    if (!department) return <div>Department Not Found</div>;

    // Fetch Recent Members
    const recentMembers = await prisma.member.findMany({
        where: { orgUnitId: deptId, isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    // Fetch Teams
    const teams = await prisma.organizationUnit.findMany({
        where: { parentId: deptId, type: 'TEAM', isActive: true },
        include: {
            manager: true,
            _count: { select: { members: true } }
        }
    });

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        {department.name} Dashboard
                    </h1>
                    <p className="text-gray-500 font-medium">Overview of your department performance and resources</p>
                </div>
                <div className="flex gap-2">
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Member
                    </Button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total {labels.memberPlural}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{department._count.members}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active {labels.subUnitPlural}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{department._count.children}</div>
                        <p className="text-xs text-muted-foreground">Operating efficiently</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{labels.activityPlural}</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground">Active projects involved</p>
                    </CardContent>
                </Card>
            </div>

            {/* Teams Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Your {labels.subUnitPlural}</h2>
                    <Link href={`/assessments/clients/${clientId}/teams`} className="text-sm text-indigo-600 hover:underline flex items-center">
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map(team => (
                        <Card key={team.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{team.name}</CardTitle>
                                <CardDescription className="text-xs line-clamp-1">{team.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                        {team.manager?.name?.charAt(0) || "U"}
                                    </div>
                                    <span className="text-sm font-medium">{team.manager?.name || "No Manager"}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {team._count.members} Members
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {teams.length === 0 && (
                        <div className="col-span-3 text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed">
                            No teams created yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Hires */}
            <div>
                <h2 className="text-xl font-bold mb-4">Recent {labels.memberPlural}</h2>
                <div className="bg-white rounded-lg border">
                    {recentMembers.map((member, i) => (
                        <div key={member.id} className={`flex items-center justify-between p-4 ${i !== recentMembers.length - 1 ? 'border-b' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{member.name}</p>
                                    <p className="text-sm text-gray-500">{member.designation} • {member.memberCode}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">Details</Button>
                        </div>
                    ))}
                    {recentMembers.length === 0 && <div className="p-4 text-center text-gray-500">No members found.</div>}
                </div>
            </div>
        </div>
    );
}

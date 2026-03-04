import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveTenantLabels } from "@/lib/tenant-resolver";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2, Edit } from "lucide-react";
import { DeleteDepartmentDialog } from "@/components/Departments/DeleteDepartmentDialog";

export default async function DepartmentDetailPage({
    params
}: {
    params: Promise<{ clientId: string; deptId: string }>
}) {
    const session = await getServerSession(authOptions);
    const { clientId, deptId } = await params;

    const dept = await prisma.organizationUnit.findUnique({
        where: { id: deptId },
        include: {
            manager: true,
            children: { // Teams
                include: { manager: true, _count: { select: { members: true } } }
            },
            members: true, // Direct Employees
            scopedActivities: { include: { activity: true } } // Projects
        }
    });

    if (!dept || dept.tenantId !== clientId) {
        return <div>Department not found</div>;
    }

    const labels = await resolveTenantLabels(clientId);

    // Stats
    const teamCount = dept.children.length;
    const directMemberCount = dept.members.length;
    const totalMemberCount = directMemberCount + dept.children.reduce((acc, curr) => acc + curr._count.members, 0);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                        {dept.code.substring(0, 2)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none">
                                {dept.name}
                            </h1>
                            {!dept.isActive && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                        <p className="text-gray-500 font-medium font-mono mt-1">{dept.code}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <DeleteDepartmentDialog
                        clientId={clientId}
                        deptId={deptId}
                        deptName={dept.name}
                        activeProjectsCount={dept.scopedActivities.length}
                    />
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Head of {labels.orgUnit}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dept.manager ? (
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={dept.manager.avatar || undefined} />
                                    <AvatarFallback>{dept.manager.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-bold text-sm">{dept.manager.name}</div>
                                    <div className="text-xs text-gray-500 truncate w-32">{dept.manager.email}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 italic">Unassigned</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total {labels.memberPlural}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalMemberCount}</div>
                        <p className="text-xs text-gray-500">{directMemberCount} direct, {totalMemberCount - directMemberCount} in teams</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">{labels.subUnitPlural}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{teamCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Active {labels.activityPlural}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{dept.scopedActivities.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="teams">{labels.subUnitPlural}</TabsTrigger>
                    <TabsTrigger value="employees">{labels.memberPlural}</TabsTrigger>
                    <TabsTrigger value="projects">{labels.activityPlural}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>{labels.orgUnit} Overview</CardTitle>
                            <CardDescription>
                                {dept.description || "No description provided."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">Performance charts coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="teams">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {dept.children.map(team => (
                            <Card key={team.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{team.name}</CardTitle>
                                    <CardDescription>{team.code}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm">Members: {team._count.members}</div>
                                </CardContent>
                            </Card>
                        ))}
                        {dept.children.length === 0 && <div className="text-gray-500">No teams found.</div>}
                    </div>
                </TabsContent>

                <TabsContent value="employees">
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-gray-500">Name</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Email</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Role</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {dept.members.map(member => (
                                        <tr key={member.id}>
                                            <td className="p-4 font-medium">{member.name}</td>
                                            <td className="p-4 text-gray-500">{member.email}</td>
                                            <td className="p-4 text-gray-500">{member.type}</td>
                                            <td className="p-4">
                                                <Badge variant={member.isActive ? "default" : "secondary"}>
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {dept.members.length === 0 && <div className="p-8 text-center text-gray-500">No direct employees.</div>}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projects">
                    <div className="space-y-4">
                        {dept.scopedActivities.map(sa => (
                            <Card key={sa.activity.id}>
                                <CardHeader>
                                    <CardTitle>{sa.activity.name}</CardTitle>
                                    <CardDescription>{labels.activity}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                        {dept.scopedActivities.length === 0 && <div className="text-gray-500">No {labels.activityPlural.toLowerCase()} assigned.</div>}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

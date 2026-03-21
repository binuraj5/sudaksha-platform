import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AllocateEmployeesDialog } from "@/components/Teams/AllocateEmployeesDialog";
import { Button } from "@/components/ui/button";
import { RemoveMemberButton } from "@/components/Teams/RemoveMemberButton";
import { EditTeamDialog } from "@/components/Teams/EditTeamDialog";
import { DeleteTeamButton } from "@/components/Teams/DeleteTeamButton";

export default async function TeamDetailPage({ params }: { params: Promise<{ clientId: string; teamId: string }> }) {
    const session = await getServerSession(authOptions);
    const { clientId, teamId } = await params;

    const team = await prisma.organizationUnit.findUnique({
        where: { id: teamId },
        include: {
            manager: true,
            parent: true,
            members: { include: { currentRole: true } },
            _count: { select: { members: true } }
        }
    });

    if (!team) return <div>Not Found</div>;
    const parentId = team.parentId || '';

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{team.code}</Badge>
                        <Badge variant="secondary">{team.parent?.name}</Badge>
                    </div>
                    <h1 className="text-3xl font-black">{team.name}</h1>
                    <p className="text-gray-500 mt-2">{team.description || "No description."}</p>
                </div>
                <div className="flex gap-2">
                    <EditTeamDialog clientId={clientId} team={{
                        id: team.id,
                        name: team.name,
                        description: team.description,
                        parentId: team.parentId,
                        managerId: team.managerId
                    }} />
                    <DeleteTeamButton clientId={clientId} teamId={team.id} />
                </div>
            </header>

            <div className="grid md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Team Lead</CardTitle></CardHeader>
                    <CardContent>
                        {team.manager ? (
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{team.manager.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="font-bold text-sm">{team.manager.name}</div>
                            </div>
                        ) : "Unassigned"}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Members</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{team._count.members}</div></CardContent>
                </Card>
            </div>

            <Tabs defaultValue="members">
                <TabsList>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="overview">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="members">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Team Members</CardTitle>
                            {parentId && <AllocateEmployeesDialog clientId={clientId} teamId={teamId} deptId={parentId} />}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {team.members.map(m => (
                                    <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{m.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{m.name}</div>
                                                <div className="text-xs text-gray-500">{m.email}</div>
                                            </div>
                                        </div>
                                        <RemoveMemberButton clientId={clientId} teamId={teamId} memberId={m.id} />
                                    </div>
                                ))}
                                {team.members.length === 0 && <div className="text-gray-500 italic">No members in this team.</div>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="overview">
                    <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        Performance Charts Placeholder
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

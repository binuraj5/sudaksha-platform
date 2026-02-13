import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default async function ProjectDetailPage({ params }: { params: Promise<{ clientId: string; projectId: string }> }) {
    const session = await getServerSession(authOptions);
    const { clientId, projectId } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: clientId },
        select: { type: true, slug: true },
    });
    if (tenant?.type === "INSTITUTION") {
        redirect(tenant.slug ? `/assessments/org/${tenant.slug}/courses` : `/assessments/clients/${clientId}/departments`);
    }

    const project = await prisma.activity.findUnique({
        where: { id: projectId },
        include: {
            owner: true,
            orgUnits: { include: { orgUnit: true } },
            members: { include: { member: true } },
            assessments: { include: { assessmentModel: true } }
        }
    });

    if (!project) return <div>Not Found</div>;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{project.code}</Badge>
                        <Badge>{project.status}</Badge>
                    </div>
                    <h1 className="text-3xl font-black">{project.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                        <span className="flex items-center"><Calendar className="mr-1 h-4 w-4" /> {new Date(project.startDate).toLocaleDateString()}</span>
                        {project.endDate && <span className="flex items-center"><Clock className="mr-1 h-4 w-4" /> Due {new Date(project.endDate).toLocaleDateString()}</span>}
                    </div>
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-gray-600">{project.description || "No description."}</p>
                            <div className="mt-6">
                                <h4 className="text-sm font-medium mb-2">Completion</h4>
                                <Progress value={35} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="team">
                        <TabsList>
                            <TabsTrigger value="team">Team ({project.members.length})</TabsTrigger>
                            <TabsTrigger value="assessments">Assessments ({project.assessments.length})</TabsTrigger>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        </TabsList>
                        <TabsContent value="team" className="mt-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-wrap gap-4">
                                        {project.members.map((m: { member: { id: string; name: string }; role?: string | null }) => (
                                            <div key={m.member.id} className="flex items-center gap-3 p-3 border rounded-lg min-w-[200px]">
                                                <Avatar>
                                                    <AvatarFallback>{m.member.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-sm">{m.member.name}</div>
                                                    <div className="text-xs text-gray-500">{m.role || 'Member'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Departments</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {project.orgUnits.map((ou: { orgUnit: { id: string; name: string } }) => (
                                    <Badge key={ou.orgUnit.id} variant="secondary">{ou.orgUnit.name}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Project Manager</CardTitle></CardHeader>
                        <CardContent>
                            {project.owner ? (
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{project.owner.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{project.owner.name}</div>
                                        <div className="text-xs text-gray-500">Manager</div>
                                    </div>
                                </div>
                            ) : <div>Unassigned</div>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { CreateRoleDialog } from "@/components/Roles/CreateRoleDialog";
import { RoleStatusBadge } from "@/components/Roles/RoleStatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function RolesPage({ params }: { params: Promise<{ clientId: string }> }) {
    const session = await getServerSession(authOptions);
    const { clientId } = await params;

    // Fetch Roles
    const globalRoles = await prisma.role.findMany({
        where: { visibility: 'UNIVERSAL', isActive: true },
        include: { _count: { select: { competencies: true } } }
    });

    const myRoles = await prisma.role.findMany({
        where: { tenantId: clientId, isActive: true },
        include: { _count: { select: { competencies: true } } },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        Roles
                    </h1>
                    <p className="text-gray-500 font-medium">Manage job roles and competencies</p>
                </div>
                {/* Create button shown here, but logically belongs to My Roles tab. Can be global if it defaults to My Roles. */}
            </header>

            <Tabs defaultValue="my-roles">
                <TabsList className="mb-4">
                    <TabsTrigger value="global">Global Roles ({globalRoles.length})</TabsTrigger>
                    <TabsTrigger value="my-roles">My Custom Roles ({myRoles.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="global">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {globalRoles.map(role => (
                            <Card key={role.id}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{role.name}</h3>
                                        <RoleStatusBadge status={role.status} visibility={role.visibility} />
                                    </div>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{role.description}</p>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">{role.overallLevel}</Badge>
                                        <Badge variant="secondary">{role._count.competencies} Competencies</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="my-roles">
                    <div className="flex justify-end mb-4">
                        <CreateRoleDialog clientId={clientId} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {myRoles.map(role => (
                            <Card key={role.id}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{role.name}</h3>
                                        <RoleStatusBadge status={role.status} visibility={role.visibility} />
                                    </div>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{role.description}</p>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">{role.overallLevel}</Badge>
                                        <Badge variant="secondary">{role._count.competencies} Competencies</Badge>
                                    </div>
                                    {role.status === 'REJECTED' && (role.rejectionReason) && (
                                        <div className="mt-4 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                                            <strong>Rejected:</strong> {role.rejectionReason}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        {myRoles.length === 0 && (
                            <div className="col-span-3 text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                                You haven't created any custom roles yet.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

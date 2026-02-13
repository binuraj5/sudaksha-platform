import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { CreateRoleDialog } from "@/components/Roles/CreateRoleDialog";
import { RoleStatusBadge } from "@/components/Roles/RoleStatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect, notFound } from "next/navigation";
import { getLabelsForTenant } from "@/lib/tenant-labels";
import type { TenantType } from "@/lib/tenant-labels";

const ROLES_ALLOWED = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"];

export default async function OrgRolesPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const role = (session.user as { role?: string })?.role;
    if (!role || !ROLES_ALLOWED.includes(role)) {
        redirect("/assessments/login");
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { id: true, type: true } });
    if (!tenant) notFound();

    const labels = getLabelsForTenant((tenant.type || "CORPORATE") as TenantType);
    const isInstitution = tenant.type === "INSTITUTION";
    const pageSubtitle = isInstitution
        ? "Manage academic and teaching roles and competencies for courses and assessments."
        : "Manage job roles and competencies";
    const myRolesTabLabel = isInstitution ? "Institution Roles" : "My Custom Roles";

    const globalRoles = await prisma.role.findMany({
        where: { visibility: "UNIVERSAL", isActive: true },
        include: { _count: { select: { competencies: true } } },
    });

    const myRoles = await prisma.role.findMany({
        where: { tenantId: tenant.id, isActive: true },
        include: { _count: { select: { competencies: true } } },
        orderBy: { updatedAt: "desc" },
    });

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        Roles
                    </h1>
                    <p className="text-gray-500 font-medium">{pageSubtitle}</p>
                </div>
            </header>

            <Tabs defaultValue="my-roles">
                <TabsList className="mb-4">
                    <TabsTrigger value="global">Global Roles ({globalRoles.length})</TabsTrigger>
                    <TabsTrigger value="my-roles">{myRolesTabLabel} ({myRoles.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="global">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {globalRoles.map((roleItem) => (
                            <Card key={roleItem.id}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{roleItem.name}</h3>
                                        <RoleStatusBadge status={roleItem.status} visibility={roleItem.visibility} />
                                    </div>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{roleItem.description}</p>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">{roleItem.overallLevel}</Badge>
                                        <Badge variant="secondary">{roleItem._count.competencies} Competencies</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="my-roles">
                    <div className="flex justify-end mb-4">
                        <CreateRoleDialog clientId={tenant.id} isInstitution={isInstitution} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {myRoles.map((roleItem) => (
                            <Card key={roleItem.id}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{roleItem.name}</h3>
                                        <RoleStatusBadge status={roleItem.status} visibility={roleItem.visibility} />
                                    </div>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{roleItem.description}</p>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">{isInstitution ? "Junior" : roleItem.overallLevel}</Badge>
                                        <Badge variant="secondary">{roleItem._count.competencies} Competencies</Badge>
                                    </div>
                                    {roleItem.status === "REJECTED" && roleItem.rejectionReason && (
                                        <div className="mt-4 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                                            <strong>Rejected:</strong> {roleItem.rejectionReason}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        {myRoles.length === 0 && (
                            <div className="col-span-3 text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                                {isInstitution
                                    ? "No institution roles yet. Create one to define academic/teaching roles."
                                    : "You haven't created any custom roles yet."}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

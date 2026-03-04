import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Scale, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { MapCompetencyDialog } from "@/components/admin/MapCompetencyDialog";
import { RoleCompetencyRow } from "@/components/admin/RoleCompetencyRow";
import { BulkUploadRoleCompetenciesDialog } from "@/components/Roles/BulkUploadRoleCompetenciesDialog";
import { AIGenerateRoleCompetenciesDialog } from "@/components/Roles/AIGenerateRoleCompetenciesDialog";
import { OrgEditRolePanel } from "./OrgEditRolePanel";

const ROLES_ALLOWED = [
    "SUPER_ADMIN", "ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN",
    "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"
];

export default async function OrgRoleDetailPage({
    params,
}: {
    params: Promise<{ slug: string; id: string }>;
}) {
    const session = await getApiSession();
    const { slug, id } = await params;

    const userRole = (session?.user as any)?.role;
    if (!session || !userRole || !ROLES_ALLOWED.includes(userRole)) {
        redirect("/assessments/login");
    }

    // Verify the tenant exists
    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { id: true, name: true },
    });
    if (!tenant) notFound();

    const clientId = tenant.id;

    const [role, allCompetencies] = await Promise.all([
        prisma.role.findFirst({
            where: {
                id,
                OR: [{ tenantId: clientId }, { visibility: "UNIVERSAL" }],
            },
            include: {
                competencies: {
                    include: { competency: true },
                    orderBy: { competency: { name: "asc" } },
                },
            },
        }),
        prisma.competency.findMany({ orderBy: { name: "asc" } }),
    ]);

    if (!role) notFound();

    // Determine if this role is owned by this org (can edit/modify)
    const isOrgOwned = role.tenantId === clientId;
    const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "TENANT_ADMIN" || userRole === "ADMIN";
    const canManage = isOrgOwned || isSuperAdmin;

    return (
        <div className="space-y-8 mt-8 pb-12">
            <header className="flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href={`/assessments/org/${slug}/roles`}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Roles
                    </Link>
                </Button>
                {!isOrgOwned && (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Shield className="h-3 w-3" /> Global / Shared role — read only
                    </Badge>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column: Role Details + Edit */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="sticky top-24 border-blue-100 shadow-blue-50/50 shadow-lg">
                        <CardHeader className="bg-blue-50/50">
                            <Badge variant="outline" className="w-fit mb-2 bg-white">
                                {role.industries?.[0] || "General"}
                            </Badge>
                            <CardTitle className="text-2xl">{role.name}</CardTitle>
                            <div className="flex gap-2 mt-1">
                                <Badge className="text-xs">{role.overallLevel}</Badge>
                                <Badge variant={isOrgOwned ? "default" : "secondary"} className="text-xs">
                                    {isOrgOwned ? "Org Role" : "Global"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <p className="text-sm text-gray-500 leading-relaxed">{role.description}</p>

                            {canManage && (
                                <OrgEditRolePanel
                                    roleId={id}
                                    clientId={clientId}
                                    slug={slug}
                                    initialName={role.name}
                                    initialDescription={role.description ?? ""}
                                    initialLevel={role.overallLevel ?? "JUNIOR"}
                                    isOrgOwned={isOrgOwned}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Competency Mapping */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Scale className="h-5 w-5 text-red-600" />
                                Competency Mapping
                            </h2>
                            <p className="text-sm text-gray-500">
                                {canManage
                                    ? "Add, remove, or AI-generate competencies for this role."
                                    : "Skills and proficiency levels required for this role."}
                            </p>
                        </div>

                        {canManage && (
                            <div className="flex flex-wrap gap-2">
                                <AIGenerateRoleCompetenciesDialog
                                    roleId={id}
                                    roleName={role.name}
                                    roleLevel={role.overallLevel}
                                />
                                <BulkUploadRoleCompetenciesDialog
                                    roleId={id}
                                    roleName={role.name}
                                />
                                <MapCompetencyDialog roleId={id} competencies={allCompetencies} />
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4">
                        {role.competencies.length === 0 ? (
                            <Card className="py-20 border-dashed text-center">
                                <CardContent>
                                    <Settings className="h-12 w-12 text-gray-200 mx-auto" />
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                                        No Competencies Mapped
                                    </h3>
                                    <p className="text-gray-500 mt-1 text-sm">
                                        {canManage
                                            ? "Use the buttons above to add or generate competencies."
                                            : "This role has no competencies defined yet."}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            role.competencies.map((rc) => (
                                <RoleCompetencyRow
                                    key={rc.id}
                                    roleId={id}
                                    mappingId={rc.id}
                                    competencyName={rc.competency.name}
                                    competencyCategory={rc.competency.category}
                                    requiredLevel={rc.requiredLevel}
                                    weight={rc.weight}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

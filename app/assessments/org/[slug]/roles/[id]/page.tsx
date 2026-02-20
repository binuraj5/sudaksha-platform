import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Scale, Settings } from "lucide-react";
import Link from "next/link";
import { MapCompetencyDialog } from "@/components/admin/MapCompetencyDialog";
import { RoleCompetencyRow } from "@/components/admin/RoleCompetencyRow";

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

    const userRole = (session?.user as { role?: string })?.role;
    if (!session || !userRole || !ROLES_ALLOWED.includes(userRole)) {
        redirect("/assessments/login");
    }

    // Verify the tenant exists
    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { id: true },
    });
    if (!tenant) notFound();

    const [role, allCompetencies] = await Promise.all([
        prisma.role.findUnique({
            where: { id },
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

    return (
        <div className="space-y-8 mt-12 pb-12">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href={`/assessments/org/${slug}/roles`}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Roles
                    </Link>
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column: Role Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="sticky top-24 border-blue-100 shadow-blue-50/50 shadow-lg">
                        <CardHeader className="bg-blue-50/50">
                            <Badge variant="outline" className="w-fit mb-2 bg-white">
                                {role.industries?.[0] || "General"}
                            </Badge>
                            <CardTitle className="text-2xl">{role.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <p className="text-sm text-gray-500 leading-relaxed">{role.description}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Mapped Competencies */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Scale className="h-5 w-5 text-red-600" />
                                Competency Mapping
                            </h2>
                            <p className="text-sm text-gray-500">
                                Skills and proficiency levels required for this role.
                            </p>
                        </div>
                        <MapCompetencyDialog roleId={id} competencies={allCompetencies} />
                    </div>

                    <div className="grid gap-4">
                        {role.competencies.length === 0 ? (
                            <Card className="py-20 border-dashed text-center">
                                <CardContent>
                                    <Settings className="h-12 w-12 text-gray-200 mx-auto" />
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                                        No Skill Mappings
                                    </h3>
                                    <p className="text-gray-500">
                                        Map competencies from the library to define this role framework.
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

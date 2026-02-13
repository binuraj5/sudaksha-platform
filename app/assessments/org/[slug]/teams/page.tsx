import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { CreateTeamDialog } from "@/components/Teams/CreateTeamDialog";
import { TeamCard } from "@/components/Teams/TeamCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLabelsForTenant } from "@/lib/tenant-labels";
import { redirect, notFound } from "next/navigation";

export default async function OrgTeamsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    const clientId = tenant.id;
    const basePath = `/assessments/org/${slug}`;

    const teams = await prisma.organizationUnit.findMany({
        where: { tenantId: clientId, type: "TEAM", isActive: true },
        include: {
            manager: { select: { name: true, avatar: true } },
            parent: { select: { id: true, name: true } },
            _count: { select: { members: true } },
        },
        orderBy: { name: "asc" },
    });

    const teamsByDept: Record<string, typeof teams> = {};
    const depts = new Set<string>();
    teams.forEach((t) => {
        const dName = t.parent?.name || "Unassigned";
        if (!teamsByDept[dName]) teamsByDept[dName] = [];
        teamsByDept[dName].push(t);
        depts.add(dName);
    });
    const deptList = Array.from(depts);

    const labels = getLabelsForTenant((tenant.type as any) || "CORPORATE");

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        {labels.subUnitPlural}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Manage operational {labels.subUnitPlural.toLowerCase()}
                    </p>
                </div>
                <CreateTeamDialog clientId={clientId} />
            </header>

            {deptList.length > 0 ? (
                <Tabs defaultValue={deptList[0]} className="space-y-6">
                    <TabsList className="flex flex-wrap h-auto">
                        {deptList.map((d) => (
                            <TabsTrigger key={d} value={d}>
                                {d}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {deptList.map((d) => (
                        <TabsContent key={d} value={d}>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {teamsByDept[d].map((t) => (
                                    <TeamCard
                                        key={t.id}
                                        team={{
                                            id: t.id,
                                            name: t.name,
                                            code: t.code,
                                            department: t.parent || { name: "Unassigned" },
                                            manager: t.manager
                                                ? {
                                                      name: t.manager.name,
                                                      avatar: t.manager.avatar ?? undefined,
                                                  }
                                                : undefined,
                                            memberCount: t._count.members,
                                            performance: 0,
                                        }}
                                        clientId={clientId}
                                        basePath={basePath}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    No teams found. Create a team to get started.
                </div>
            )}
        </div>
    );
}

import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { CreateProjectDialog } from "@/components/Projects/CreateProjectDialog";
import { ProjectCard } from "@/components/Projects/ProjectCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List as ListIcon } from "lucide-react";
import { getLabelsForTenant } from "@/lib/tenant-labels";
import { redirect, notFound } from "next/navigation";

export default async function OrgProjectsPage({
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

    const projects = await prisma.activity.findMany({
        where: { tenantId: clientId, type: "PROJECT", status: { not: "ARCHIVED" } },
        include: {
            owner: { select: { id: true, name: true, avatar: true } },
            _count: { select: { members: true, assessments: true } },
            orgUnits: { include: { orgUnit: true } },
            members: { include: { member: { select: { id: true, name: true, avatar: true } } } },
        },
        orderBy: { updatedAt: "desc" },
    });

    const formatted = projects.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        description: p.description,
        status: p.status,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate?.toISOString(),
        owner: p.owner ? { name: p.owner.name, avatar: p.owner.avatar ?? undefined } : undefined,
        stats: {
            members: p._count.members,
            assessments: p._count.assessments,
            progress: 35,
        },
        departments: p.orgUnits.map((ou) => ({ id: ou.orgUnit.id, name: ou.orgUnit.name })),
        teamData: p.members.map((m) => m.member).slice(0, 5),
    }));

    const columns = [
        { id: "PLANNED", label: "Planned" },
        { id: "ACTIVE", label: "Active" },
        { id: "ON_HOLD", label: "On Hold" },
        { id: "COMPLETED", label: "Completed" },
    ];

    const labels = getLabelsForTenant((tenant.type as any) || "CORPORATE");

    return (
        <div className="p-8 h-full flex flex-col max-w-[1600px] mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        {labels.activityPlural}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Manage and track {labels.activityPlural.toLowerCase()}
                    </p>
                </div>
                <CreateProjectDialog clientId={clientId} />
            </header>

            <Tabs defaultValue="board" className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="board">
                            <LayoutGrid className="mr-2 h-4 w-4" /> Board
                        </TabsTrigger>
                        <TabsTrigger value="list">
                            <ListIcon className="mr-2 h-4 w-4" /> List
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="board" className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-[1000px] h-full">
                        {columns.map((col) => (
                            <div
                                key={col.id}
                                className="flex-1 min-w-[280px] bg-gray-50/50 rounded-xl border p-4 flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-700">{col.label}</h3>
                                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {formatted.filter((p) => p.status === col.id).length}
                                    </span>
                                </div>
                                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                                    {formatted
                                        .filter((p) => p.status === col.id)
                                        .map((p) => (
                                            <ProjectCard
                                                key={p.id}
                                                project={p}
                                                clientId={clientId}
                                                basePath={basePath}
                                            />
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="list">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {formatted.map((p) => (
                            <ProjectCard
                                key={p.id}
                                project={p}
                                clientId={clientId}
                                basePath={basePath}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

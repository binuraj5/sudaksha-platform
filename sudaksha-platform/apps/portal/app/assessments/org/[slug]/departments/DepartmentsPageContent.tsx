import { prisma } from "@/lib/prisma";
import { getLabelsForTenant } from "@/lib/tenant-labels";
import { CreateDepartmentDialog } from "@/components/Departments/CreateDepartmentDialog";
import { BulkUploadDepartmentsDialog } from "@/components/Departments/BulkUploadDepartmentsDialog";
import { DepartmentCard } from "@/components/Departments/DepartmentCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export async function DepartmentsPageContent({
    clientId,
    slug,
    searchParams,
    scope,
}: {
    clientId: string;
    slug: string;
    searchParams: { search?: string; status?: string };
    scope?: { role?: string; managedOrgUnitId?: string | null };
}) {
    const tenant = await prisma.tenant.findUnique({
        where: { id: clientId },
        select: { type: true },
    });
    const tenantType = (tenant?.type as "CORPORATE" | "INSTITUTION" | "SYSTEM") || "CORPORATE";
    const labels = getLabelsForTenant(tenantType);
    const basePath = `/assessments/org/${slug}`;

    const status = searchParams.status || "active";
    const search = searchParams.search || "";
    const whereClause: any = {
        tenantId: clientId,
        type: "DEPARTMENT",
        parentId: null,
    };
    // Department Head / HoD: only show the department they manage
    const isDeptHead = scope?.role === "DEPARTMENT_HEAD" || scope?.role === "DEPT_HEAD";
    if (isDeptHead && scope?.managedOrgUnitId) {
        whereClause.id = scope.managedOrgUnitId;
    }
    if (status === "active") whereClause.isActive = true;
    if (status === "inactive") whereClause.isActive = false;
    if (search) {
        whereClause.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
        ];
    }
    const childType = tenantType === "INSTITUTION" ? "CLASS" : "TEAM";
    const departments = await prisma.organizationUnit.findMany({
        where: whereClause,
        include: {
            manager: { select: { name: true, avatar: true } },
            _count: { select: { children: true, members: true } },
            children: {
                where: { type: childType },
                select: { _count: { select: { members: true } } },
            },
        },
        orderBy: { name: "asc" },
    });
    const formatted = departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description || "",
        isActive: d.isActive,
        manager: d.manager ? { name: d.manager.name, avatar: d.manager.avatar ?? undefined } : null,
        stats: {
            teams: d._count.children,
            employees: d._count.members + d.children.reduce((acc, curr) => acc + curr._count.members, 0),
            projects: 0,
        },
    }));

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        {labels.orgUnitPlural}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Manage {tenantType === "INSTITUTION" ? "departments, classes and students" : "organization structure"} and {labels.subUnitPlural.toLowerCase()}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {!isDeptHead && (
                        <>
                            <CreateDepartmentDialog clientId={clientId} tenantType={tenantType} />
                            <BulkUploadDepartmentsDialog clientId={clientId} tenantType={tenantType} />
                        </>
                    )}
                </div>
            </header>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <form>
                            <Input name="search" defaultValue={search} placeholder={`Search ${labels.orgUnitPlural.toLowerCase()}...`} className="pl-9 bg-gray-50" />
                            <input type="hidden" name="status" value={status} />
                        </form>
                    </div>
                    <div className="flex gap-2">
                        <a href={`?status=active`} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${status === "active" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>Active</a>
                        <a href={`?status=inactive`} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${status === "inactive" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>Inactive</a>
                        <a href={`?status=all`} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${status === "all" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>All</a>
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {formatted.map((dept) => (
                        <DepartmentCard key={dept.id} dept={dept} clientId={clientId} basePath={basePath} />
                    ))}
                </div>
                {formatted.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No {labels.orgUnitPlural.toLowerCase()} found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
}

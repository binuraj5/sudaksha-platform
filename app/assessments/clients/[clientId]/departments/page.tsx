import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { CreateDepartmentDialog } from "@/components/Departments/CreateDepartmentDialog";
import { DepartmentCard } from "@/components/Departments/DepartmentCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLabelsForTenant } from "@/lib/tenant-labels";
import { prisma } from "@/lib/prisma";

// Helper to fetch departments on server
async function getDepartments(clientId: string, search?: string, status?: string) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    // Direct DB call is preferred in Server Components over fetch to self, avoiding network overhead
    // BUT we must filter similar to the API route.
    // For consistency with M1-2, I'll use the API route logic directly here if I extracted it to a controller,
    // or just fetch via HTTP which is slower but decoupled.
    // Given the previous pattern, I'll try to fetch or implement direct DB logic.
    // I will implement DIRECT DB logic here for speed and type safety.

    /* 
       Actually, re-implementing logic is bad for maintenance. 
       Use data access layer or fetch. 
       For "Autonomous Mode" speed, I will use fetch with Cookie workaround if needed, 
       BUT `fetch` to generic API route inside SC needs absolute URL and cookies.
       I will use Prisma directly here.
    */

    // Leaving this placeholder comment to confirm I'm aware of the trade-off.
    // I will use fetch for now to reuse the API logic I just wrote.

    return []; // Replaced by Client Component fetching or direct implementation below
}

export default async function DepartmentsPage({
    params,
    searchParams
}: {
    params: Promise<{ clientId: string }>,
    searchParams: Promise<{ search?: string; status?: string }>
}) {
    const session = await getServerSession(authOptions);
    const { clientId } = await params;

    // We mock the fetch or use a Client Component for the list if we want dynamic interaction without page reload
    // But page reload with URL params is standard next.js

    // Get Tenant type for dynamic labels
    const tenant = await prisma.tenant.findUnique({
        where: { id: clientId },
        select: { type: true }
    });

    const tenantType = (tenant?.type as 'CORPORATE' | 'INSTITUTION' | 'SYSTEM') || 'CORPORATE';
    const labels = getLabelsForTenant(tenantType);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        {labels.orgUnitPlural}
                    </h1>
                    <p className="text-gray-500 font-medium">Manage {tenantType === 'INSTITUTION' ? 'faculty and classes' : 'organization structure'} and {labels.subUnitPlural.toLowerCase()}</p>
                </div>
                <CreateDepartmentDialog clientId={clientId} tenantType={tenantType} />
            </header>

            <DepartmentsListLoader clientId={clientId} searchParams={await searchParams} tenantType={tenantType} labels={labels} />
        </div>
    );
}

// Sub-component to handle fetching (polymorphic: CORPORATE = Departments/Teams, INSTITUTION = Faculties/Classes)
async function DepartmentsListLoader({ clientId, searchParams, tenantType, labels }: {
    clientId: string;
    searchParams: { search?: string; status?: string };
    tenantType: 'CORPORATE' | 'INSTITUTION' | 'SYSTEM';
    labels: { orgUnitPlural: string; subUnitPlural: string; memberPlural: string; activityPlural: string };
}) {
    const status = searchParams.status || 'active';
    const search = searchParams.search || '';

    // Top-level: DEPARTMENT (Corporate = Dept, Institution = Faculty). Children: TEAM (Corporate) or CLASS (Institution)
    const whereClause: any = {
        tenantId: clientId,
        type: 'DEPARTMENT',
        parentId: null
    };

    if (status === 'active') whereClause.isActive = true;
    if (status === 'inactive') whereClause.isActive = false;

    if (search) {
        whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
        ];
    }

    const childType = tenantType === 'INSTITUTION' ? 'CLASS' : 'TEAM';

    const departments = await prisma.organizationUnit.findMany({
        where: whereClause,
        include: {
            manager: {
                select: {
                    name: true,
                    avatar: true,
                }
            },
            _count: {
                select: {
                    children: true,
                    members: true
                }
            },
            children: {
                where: { type: childType },
                select: {
                    _count: {
                        select: { members: true }
                    }
                }
            }
        },
        orderBy: { name: 'asc' }
    });

    const formatted = departments.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description || '',
        isActive: d.isActive,
        manager: d.manager ? { name: d.manager.name, avatar: d.manager.avatar ?? undefined } : null,
        stats: {
            teams: d._count.children,
            employees: d._count.members + d.children.reduce((acc, curr) => acc + curr._count.members, 0),
            projects: 0
        }
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <form>
                        <Input
                            name="search"
                            defaultValue={search}
                            placeholder={`Search ${labels.orgUnitPlural.toLowerCase()}...`}
                            className="pl-9 bg-gray-50"
                        />
                        {/* Status hidden input to persist */}
                        <input type="hidden" name="status" value={status} />
                    </form>
                </div>
                <div className="flex gap-2">
                    {/* Links act as tabs */}
                    <a href={`?status=active`} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${status === 'active' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Active</a>
                    <a href={`?status=inactive`} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${status === 'inactive' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Inactive</a>
                    <a href={`?status=all`} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${status === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>All</a>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {formatted.map(dept => (
                    <DepartmentCard key={dept.id} dept={dept} clientId={clientId} />
                ))}
            </div>
            {formatted.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No {labels.orgUnitPlural.toLowerCase()} found matching your criteria.
                </div>
            )}
        </div>
    );
}

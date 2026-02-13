import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { CreateEmployeeDialog } from "@/components/Employees/CreateEmployeeDialog";
import { BulkUploadDialog } from "@/components/Employees/BulkUploadDialog";
import { EmployeeTable } from "@/components/Employees/EmployeeTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLabelsForTenant } from "@/lib/tenant-labels";
import { redirect, notFound } from "next/navigation";

export default async function OrgEmployeesPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ search?: string; page?: string; dept?: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    const clientId = tenant.id;
    const basePath = `/assessments/org/${slug}`;
    const role = (session.user as { role?: string }).role;
    const managedOrgUnitId = (session.user as { managedOrgUnitId?: string | null }).managedOrgUnitId ?? null;
    const isDeptHead = role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD";

    const { search, page, dept: deptParam } = await searchParams;
    const pageNum = parseInt(page || "1");
    const take = 50;
    const skip = (pageNum - 1) * take;

    const tenantType = (tenant.type as "CORPORATE" | "INSTITUTION") || "CORPORATE";
    const memberType = tenantType === "INSTITUTION" ? "STUDENT" : "EMPLOYEE";

    // Scope by department: HoD only sees their dept; optional ?dept= for Tenant Admin
    let effectiveDeptId: string | null = null;
    if (isDeptHead && managedOrgUnitId) {
        effectiveDeptId = managedOrgUnitId;
    } else if (deptParam) {
        const deptExists = await prisma.organizationUnit.findFirst({
            where: { id: deptParam, tenantId: clientId, type: "DEPARTMENT" },
        });
        if (deptExists) effectiveDeptId = deptParam;
    }

    const where: any = { tenantId: clientId, type: memberType };
    if (effectiveDeptId) {
        const classesUnderDept = await prisma.organizationUnit.findMany({
            where: { tenantId: clientId, type: "CLASS", parentId: effectiveDeptId },
            select: { id: true },
        });
        const orgUnitIds = [effectiveDeptId, ...classesUnderDept.map((c) => c.id)];
        where.orgUnitId = { in: orgUnitIds };
    }
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            ...(tenantType === "INSTITUTION"
                ? [{ enrollmentNumber: { contains: search, mode: "insensitive" } }]
                : [{ employeeId: { contains: search, mode: "insensitive" } }]),
        ];
    }

    const employees = await prisma.member.findMany({
        where,
        take,
        skip,
        include: { orgUnit: true },
        orderBy: { createdAt: "desc" },
    });

    const total = await prisma.member.count({ where });
    const labels = getLabelsForTenant(tenantType);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        {labels.memberPlural}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {total} {labels.memberPlural.toLowerCase()} in organization
                    </p>
                </div>
                <div className="flex gap-2">
                    <BulkUploadDialog clientId={clientId} />
                    <CreateEmployeeDialog clientId={clientId} />
                </div>
            </header>

            <div className="flex gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <form>
                        <Input
                            name="search"
                            defaultValue={search}
                            placeholder="Search by name or email..."
                            className="pl-9 bg-gray-50"
                        />
                    </form>
                </div>
            </div>

            <EmployeeTable employees={employees} clientId={clientId} basePath={basePath} />

            <div className="flex justify-center gap-2">
                {pageNum > 1 && (
                    <Button variant="outline" asChild>
                        <a href={`?page=${pageNum - 1}&search=${search || ""}${effectiveDeptId ? `&dept=${effectiveDeptId}` : ""}`}>Previous</a>
                    </Button>
                )}
                {total > pageNum * take && (
                    <Button variant="outline" asChild>
                        <a href={`?page=${pageNum + 1}&search=${search || ""}${effectiveDeptId ? `&dept=${effectiveDeptId}` : ""}`}>Next</a>
                    </Button>
                )}
            </div>
        </div>
    );
}

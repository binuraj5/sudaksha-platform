import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { CreateEmployeeDialog } from "@/components/Employees/CreateEmployeeDialog";
import { BulkUploadDialog } from "@/components/Employees/BulkUploadDialog";
import { EmployeeTable } from "@/components/Employees/EmployeeTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLabelsForTenant } from "@/lib/tenant-labels";

export default async function EmployeesPage({
    params,
    searchParams
}: {
    params: Promise<{ clientId: string }>;
    searchParams: Promise<{ search?: string; page?: string }>
}) {
    const session = await getServerSession(authOptions);
    const { clientId } = await params;

    // Fetch Params
    const { search, page } = await searchParams;
    const pageNum = parseInt(page || '1');
    const take = 50;
    const skip = (pageNum - 1) * take;

    // Polymorphic: INSTITUTION = Students, CORPORATE = Employees
    const tenant = await prisma.tenant.findUnique({
        where: { id: clientId },
        select: { type: true }
    });
    const tenantType = (tenant?.type as 'CORPORATE' | 'INSTITUTION') || 'CORPORATE';
    const memberType = tenantType === 'INSTITUTION' ? 'STUDENT' : 'EMPLOYEE';

    const where: any = {
        tenantId: clientId,
        type: memberType
    };

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            ...(tenantType === 'INSTITUTION' ? [{ enrollmentNumber: { contains: search, mode: 'insensitive' } }] : [{ employeeId: { contains: search, mode: 'insensitive' } }]),
        ];
    }

    const employees = await prisma.member.findMany({
        where,
        take,
        skip,
        include: { orgUnit: true },
        orderBy: { createdAt: 'desc' }
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
                    <p className="text-gray-500 font-medium">{total} {labels.memberPlural.toLowerCase()} in organization</p>
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

            <EmployeeTable employees={employees} clientId={clientId} />

            <div className="flex justify-center gap-2">
                {pageNum > 1 && <Button variant="outline" asChild><a href={`?page=${pageNum - 1}&search=${search || ''}`}>Previous</a></Button>}
                {total > pageNum * take && <Button variant="outline" asChild><a href={`?page=${pageNum + 1}&search=${search || ''}`}>Next</a></Button>}
            </div>
        </div>
    );
}

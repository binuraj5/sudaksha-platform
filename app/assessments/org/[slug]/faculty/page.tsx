import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FacultyPageContent } from "./FacultyPageContent";
import { getLabelsForTenant } from "@/lib/tenant-labels";

export default async function OrgFacultyPage({
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

    // Faculty page is institution-only; corporates use Employees/Members
    if (tenant.type === "CORPORATE") {
        redirect(`/assessments/org/${slug}/employees`);
    }

    const clientId = tenant.id;
    const role = (session.user as { role?: string }).role;
    const managedOrgUnitId = (session.user as { managedOrgUnitId?: string | null }).managedOrgUnitId ?? null;
    const isDeptHead = role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD";

    const { search, page: pageParam, dept: deptParam } = await searchParams;
    const pageNum = parseInt(pageParam || "1");
    const take = 50;
    const skip = (pageNum - 1) * take;

    let effectiveDeptId: string | null = null;
    if (isDeptHead && managedOrgUnitId) {
        effectiveDeptId = managedOrgUnitId;
    } else if (deptParam) {
        const deptExists = await prisma.organizationUnit.findFirst({
            where: { id: deptParam, tenantId: clientId, type: "DEPARTMENT" },
        });
        if (deptExists) effectiveDeptId = deptParam;
    }

    const where: Record<string, unknown> = { tenantId: clientId, type: "EMPLOYEE" };
    if (effectiveDeptId) {
        const classesUnderDept = await prisma.organizationUnit.findMany({
            where: { tenantId: clientId, type: "CLASS", parentId: effectiveDeptId },
            select: { id: true },
        });
        const orgUnitIds = [effectiveDeptId, ...classesUnderDept.map((c) => c.id)];
        (where as { orgUnitId?: { in: string[] } }).orgUnitId = { in: orgUnitIds };
    }
    if (search) {
        (where as { OR?: unknown[] }).OR = [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { memberCode: { contains: search, mode: "insensitive" as const } },
        ];
    }

    const [faculty, total, departments, classes] = await Promise.all([
        prisma.member.findMany({
            where,
            take,
            skip,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                memberCode: true,
                designation: true,
                facultyType: true,
                isActive: true,
                orgUnitId: true,
                orgUnit: { select: { id: true, name: true, code: true, type: true } },
            },
            orderBy: { name: "asc" },
        }),
        prisma.member.count({ where }),
        prisma.organizationUnit.findMany({
            where: { tenantId: clientId, type: "DEPARTMENT", parentId: null },
            select: { id: true, name: true, code: true },
            orderBy: { name: "asc" },
        }),
        prisma.organizationUnit.findMany({
            where: { tenantId: clientId, type: "CLASS" },
            select: {
                id: true,
                name: true,
                code: true,
                parent: { select: { name: true } },
            },
            orderBy: { name: "asc" },
        }),
    ]);

    const tenantType = (tenant.type as "CORPORATE" | "INSTITUTION") || "INSTITUTION";
    const labels = getLabelsForTenant(tenantType);
    const facultyLabel = labels.facultyPlural || labels.faculty || "Faculty";

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        {facultyLabel}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {total} {facultyLabel.toLowerCase()} in organization
                    </p>
                </div>
                <Button asChild>
                    <Link href={`/assessments/org/${slug}/faculty/new`}>
                        Add {labels.faculty || "Faculty"}
                    </Link>
                </Button>
            </header>
            <FacultyPageContent
                faculty={faculty}
                slug={slug}
                clientId={clientId}
                departments={departments}
                classes={classes}
                total={total}
                pageNum={pageNum}
                take={take}
                search={search}
                effectiveDeptId={effectiveDeptId}
                isDeptHead={!!isDeptHead}
            />
        </div>
    );
}

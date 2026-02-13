import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CreateFacultyDialog } from "@/components/Faculty/CreateFacultyDialog";
import { getLabelsForTenant } from "@/lib/tenant-labels";

export default async function OrgNewFacultyPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ departmentId?: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session?.user) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    if (tenant.type === "CORPORATE") redirect(`/assessments/org/${slug}/employees`);

    const { departmentId } = await searchParams;
    const tenantType = (tenant.type as "CORPORATE" | "INSTITUTION") || "INSTITUTION";
    const labels = getLabelsForTenant(tenantType);
    const basePath = `/assessments/org/${slug}`;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Button variant="ghost" asChild className="mb-6 -ml-2">
                <Link href={`${basePath}/faculty`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to {labels.facultyPlural || "Faculty"}
                </Link>
            </Button>
            <h1 className="text-2xl font-bold mb-2">Add {labels.faculty || "Faculty"}</h1>
            <p className="text-gray-500 mb-6">
                Invite a teacher or staff member to the institution.
            </p>
            <CreateFacultyDialog
                clientId={tenant.id}
                slug={slug}
                defaultDepartmentId={departmentId}
            />
        </div>
    );
}

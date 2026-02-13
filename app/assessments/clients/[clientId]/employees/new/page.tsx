import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CreateEmployeeDialog } from "@/components/Employees/CreateEmployeeDialog";
import { getLabelsForTenant } from "@/lib/tenant-labels";
import { prisma } from "@/lib/prisma";

export default async function NewEmployeePage({
    params,
}: {
    params: Promise<{ clientId: string }>;
}) {
    const session = await getServerSession(authOptions);
    const { clientId } = await params;
    if (!session?.user) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({
        where: { id: clientId },
        select: { type: true },
    });
    const tenantType = (tenant?.type as "CORPORATE" | "INSTITUTION") || "CORPORATE";
    const labels = getLabelsForTenant(tenantType);

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Button variant="ghost" asChild className="mb-6 -ml-2">
                <Link href={`/assessments/clients/${clientId}/employees`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to {labels.memberPlural}
                </Link>
            </Button>
            <h1 className="text-2xl font-bold mb-2">Add New {labels.member}</h1>
            <p className="text-gray-500 mb-6">Invite a new {labels.member.toLowerCase()} to the organization.</p>
            <CreateEmployeeDialog clientId={clientId} defaultOpen />
        </div>
    );
}

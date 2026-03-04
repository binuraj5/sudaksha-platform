import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CreateProjectDialog } from "@/components/Projects/CreateProjectDialog";
import { getLabelsForTenant } from "@/lib/tenant-labels";

export default async function OrgNewProjectPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session?.user) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    if (tenant.type === "INSTITUTION") redirect(`/assessments/org/${slug}/courses`);

    const tenantType = (tenant.type as "CORPORATE" | "INSTITUTION") || "CORPORATE";
    const labels = getLabelsForTenant(tenantType);
    const basePath = `/assessments/org/${slug}`;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Button variant="ghost" asChild className="mb-6 -ml-2">
                <Link href={`${basePath}/projects`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to {labels.activityPlural}
                </Link>
            </Button>
            <h1 className="text-2xl font-bold mb-2">Create New {labels.activity}</h1>
            <p className="text-gray-500 mb-6">
                Define {labels.activity.toLowerCase()} scope, timeline and team.
            </p>
            <CreateProjectDialog clientId={tenant.id} defaultOpen redirectBase={basePath} />
        </div>
    );
}

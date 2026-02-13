import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CurriculumPageClient } from "@/components/Curriculum/CurriculumPageClient";
import { GraduationCap } from "lucide-react";
import { getApiSession } from "@/lib/get-session";
import { redirect, notFound } from "next/navigation";

export default async function OrgCurriculumPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { id: true, name: true, type: true },
    });

    if (!tenant) notFound();

    if (tenant.type !== "INSTITUTION") {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                <p className="text-gray-500 mt-2">
                    Curriculum management is only available for educational institution tenants.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Curriculum Management</h1>
                        <p className="text-sm text-gray-500">
                            Define your institution&apos;s academic structure: Degrees, Semesters, and Subjects.
                        </p>
                    </div>
                </div>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <CurriculumPageClient clientId={tenant.id} />
            </Suspense>
        </div>
    );
}

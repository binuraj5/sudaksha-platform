import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CurriculumPageClient } from "@/components/Curriculum/CurriculumPageClient";
import { GraduationCap } from "lucide-react";

export default async function CurriculumPage({
    params
}: {
    params: Promise<{ clientId: string }>
}) {
    const { clientId } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: clientId },
        select: { name: true, type: true }
    });

    if (!tenant) return null;
    if (tenant.type !== 'INSTITUTION') {
        redirect(`/assessments/clients/${clientId}/departments`);
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
                        <p className="text-sm text-gray-500">Define your institution's academic structure: Degrees, Semesters, and Subjects.</p>
                    </div>
                </div>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <CurriculumPageClient clientId={clientId} />
            </Suspense>
        </div>
    );
}

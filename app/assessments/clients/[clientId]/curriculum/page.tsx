import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CurriculumManager } from "@/components/Curriculum/CurriculumManager";
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

    if (!tenant || tenant.type !== 'INSTITUTION') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                <p className="text-gray-500 mt-2">Curriculum management is only available for educational institution tenants.</p>
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

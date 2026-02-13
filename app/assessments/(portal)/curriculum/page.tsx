import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentCurriculumView } from "@/components/Curriculum/StudentCurriculumView";

export default async function StudentCurriculumPage() {
    const session = await getApiSession();
    if (!session) redirect("/assessments/login");

    const clientId = (session.user as { clientId?: string }).clientId || (session.user as { tenantId?: string }).tenantId;
    if (!clientId) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <p className="text-gray-500">You are not associated with an institution. Curriculum view is available for institution students.</p>
            </div>
        );
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id: clientId },
        select: { type: true, name: true }
    });

    if (!tenant || tenant.type !== "INSTITUTION") {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <p className="text-gray-500">Curriculum view is only available for educational institution students.</p>
            </div>
        );
    }

    const member = await prisma.member.findUnique({
        where: { email: session.user?.email! },
        select: { id: true }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                    My Curriculum
                </h1>
                <p className="text-gray-500">
                    Your learning structure at {tenant.name}. Track progress by subject and topic.
                </p>
            </header>

            <StudentCurriculumView clientId={clientId} memberId={member?.id} />
        </div>
    );
}

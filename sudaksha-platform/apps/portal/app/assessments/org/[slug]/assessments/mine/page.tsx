import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { PersonalAssessmentsList } from "@/components/assessments/PersonalAssessmentsList";
import { redirect, notFound } from "next/navigation";

export default async function MyAssessmentsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session || !session.user) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    // Fetch user's assigned assessments within this tenant (always personal view)
    const memberAssessments = await (prisma as any).memberAssessment.findMany({
        where: {
            memberId: (session.user as any).id,
            assessmentModel: {
                tenantId: tenant.id
            }
        },
        include: {
            assessmentModel: {
                include: {
                    role: { select: { id: true, name: true } }
                }
            },
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return (
        <div className="p-4 md:p-8">
            <PersonalAssessmentsList
                assessments={memberAssessments}
                slug={slug}
                userName={session.user.name || "User"}
                tenantName={tenant.name}
            />
        </div>
    );
}

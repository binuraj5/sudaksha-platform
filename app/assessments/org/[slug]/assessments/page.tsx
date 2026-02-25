import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ModelsPageContent } from "@/components/assessments/ModelsPageContent";
import { PersonalAssessmentsList } from "@/components/assessments/PersonalAssessmentsList";
import { redirect, notFound } from "next/navigation";

const ADMIN_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD"];

export default async function OrgAssessmentsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session || !session.user) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    const sessionRole = (session.user as any).role;
    const userType = (session.user as any).userType;

    // Fast check via session
    let isAdmin = ADMIN_ROLES.includes(sessionRole) || userType === "SUPER_ADMIN" || userType === "TENANT_ADMIN";

    // Deep check via DB — in case session role is stale or missing
    if (!isAdmin) {
        const member = await prisma.member.findUnique({
            where: { email: session.user.email! },
            include: { managedUnits: { select: { id: true } } },
        });
        if (member && (ADMIN_ROLES.includes(member.role) || member.managedUnits.length > 0)) {
            isAdmin = true;
        }
    }

    if (isAdmin) {
        return (
            <div className="p-4 md:p-8">
                <ModelsPageContent
                    isAdmin={true}
                    clientId={tenant.id}
                    baseUrl={`/assessments/org/${slug}/assessments`}
                />
            </div>
        );
    }

    // For non-admins, show their personal assessments
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

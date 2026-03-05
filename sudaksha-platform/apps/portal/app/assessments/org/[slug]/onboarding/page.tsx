import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OrgOnboardingWizard, type OnboardingStep } from "@/components/onboarding/OrgOnboardingWizard";

const ADMIN_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD"];

export const metadata = {
    title: "Setup | SudAssess",
    description: "Complete your organisation setup",
};

export default async function OrgOnboardingPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const session = await getApiSession();

    if (!session?.user) redirect("/assessments/login");

    const sessionRole = (session.user as any).role;
    const userType = (session.user as any).userType;
    let isAdmin = ADMIN_ROLES.includes(sessionRole) || userType === "SUPER_ADMIN" || userType === "TENANT_ADMIN";

    // DB deep-check (mirrors dashboard logic — session fields may be stale)
    if (!isAdmin) {
        const member = await prisma.member.findUnique({
            where: { email: session.user.email! },
            include: { managedUnits: { select: { id: true } } }
        });
        if (member && (ADMIN_ROLES.includes(member.role) || member.managedUnits.length > 0)) {
            isAdmin = true;
        }
    }

    if (!isAdmin) redirect(`/assessments/org/${slug}/dashboard`);

    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            features: true,
            settings: { select: { description: true, website: true } },
        },
    });
    if (!tenant) redirect("/");

    // If already completed, go to dashboard
    if ((tenant.features as any)?.onboardingComplete) {
        redirect(`/assessments/org/${slug}/dashboard`);
    }

    // Mark as seen on first visit so the dashboard won't redirect back here again
    if (!(tenant.features as any)?.onboardingSeen) {
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: { features: { ...(tenant.features as object ?? {}), onboardingSeen: true } },
        });
    }

    // Derive step completion from existing data
    const [orgUnitCount, memberCount, assessmentCount] = await Promise.all([
        prisma.organizationUnit.count({ where: { tenantId: tenant.id } }),
        prisma.member.count({ where: { tenantId: tenant.id } }),
        prisma.assessmentModel.count({ where: { tenantId: tenant.id } }),
    ]);

    const hasProfile = !!(tenant.settings?.description || tenant.settings?.website);
    const hasDepartments = orgUnitCount > 0;
    const hasEmployees = memberCount > 1; // >1 means at least one non-admin member
    const hasAssessment = assessmentCount > 0;

    const steps: OnboardingStep[] = [
        {
            id: "profile",
            title: "Complete Organisation Profile",
            description: "Add a description, website, and location for your organisation.",
            completed: hasProfile,
            actionLabel: "Edit Profile",
            actionHref: `/assessments/org/${slug}/settings`,
        },
        {
            id: "departments",
            title: "Create Departments or Teams",
            description: "Structure your organisation by adding departments, teams, or classes.",
            completed: hasDepartments,
            actionLabel: "Add Department",
            actionHref: `/assessments/org/${slug}/departments`,
        },
        {
            id: "employees",
            title: "Invite Your First Members",
            description: "Invite employees or students to join your organisation.",
            completed: hasEmployees,
            actionLabel: "Invite Members",
            actionHref: `/assessments/org/${slug}/employees`,
        },
        {
            id: "assessment",
            title: "Create Your First Assessment",
            description: "Build a competency-based assessment to start evaluating your team.",
            completed: hasAssessment,
            actionLabel: "Create Assessment",
            actionHref: `/assessments/org/${slug}/assessments/create`,
        },
    ];

    return (
        <OrgOnboardingWizard
            slug={slug}
            orgName={tenant.name}
            steps={steps}
        />
    );
}

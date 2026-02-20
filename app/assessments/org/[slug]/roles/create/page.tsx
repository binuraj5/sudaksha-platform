import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { CreateRoleWizard } from "@/components/assessments/admin/roles/CreateRoleWizard";

const ROLES_ALLOWED = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"];

export default async function OrgCreateRolePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const role = (session.user as { role?: string })?.role;
    if (!role || !ROLES_ALLOWED.includes(role)) {
        redirect("/assessments/login");
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { id: true, type: true } });
    if (!tenant) notFound();

    return (
        <div className="container mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Define New Role & Competencies</h1>
                <p className="text-slate-500">Create a role and use AI to suggest relevant competencies.</p>
            </div>
            {/* 
              CreateRoleWizard uses the server action createRoleWithCompetencies which 
              automatically reads getApiSession() and correctly scopes the created role 
              to the tenant/department/team based on the user permissions. No clientId prop needed!
            */}
            <CreateRoleWizard returnUrl={`/assessments/org/${slug}/roles`} />
        </div>
    );
}

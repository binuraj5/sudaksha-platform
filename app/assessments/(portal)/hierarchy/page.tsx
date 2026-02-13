import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { resolveTenantLabels } from "@/lib/tenant-resolver";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { User, Users, Building, ArrowDown } from "lucide-react";

const CLIENT_ROLES = ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'TEAM_LEAD', 'EMPLOYEE', 'STUDENT', 'ASSESSOR'];

export default async function HierarchyPage() {
    const session = await getApiSession();
    if (!session) redirect("/assessments/login");

    const u = session.user as { clientId?: string; tenantId?: string; role?: string };
    const sessionClientId = u.clientId || u.tenantId;
    if (sessionClientId && CLIENT_ROLES.includes(u.role || '')) {
        redirect(`/assessments/clients/${sessionClientId}/hierarchy`);
    }

    const member = await prisma.member.findUnique({
        where: { email: session.user.email! },
        include: {
            tenant: true,
            orgUnit: {
                include: {
                    parent: true,
                    manager: true
                }
            },
            reportingManager: true
        }
    });

    if (!member) return <div>Member not found</div>;

    const clientId = member.tenantId || (session.user as any).clientId;
    const labels = clientId ? await resolveTenantLabels(clientId) : null;

    const Node = ({ icon: Icon, title, subtitle, highlight = false }: any) => (
        <Card className={`w-full max-w-md mx-auto ${highlight ? 'border-2 border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200'}`}>
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${highlight ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className={`font-bold ${highlight ? 'text-indigo-900' : 'text-gray-900'}`}>{title}</h3>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
            </CardContent>
        </Card>
    );

    const Connector = () => (
        <div className="flex justify-center py-2">
            <ArrowDown className="h-6 w-6 text-gray-300" />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 text-center">
            <header className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">My Hierarchy</h1>
                <p className="text-gray-500">Your reporting structure within {member.tenant?.name}</p>
            </header>

            <div className="space-y-0">
                {/* Company */}
                <Node icon={Building} title={member.tenant?.name || "Company"} subtitle="Organization" />
                <Connector />

                {/* Department (if exists) */}
                {member.orgUnit?.parent && (
                    <>
                        <Node icon={Users} title={member.orgUnit.parent.name} subtitle={labels?.orgUnit || "Department"} />
                        <Connector />
                    </>
                )}

                {/* Team / Unit */}
                {member.orgUnit && (
                    <>
                        <Node
                            icon={Users}
                            title={member.orgUnit.name}
                            subtitle={`${labels?.subUnit || "Team"} (Lead: ${member.orgUnit.manager?.name || 'N/A'})`}
                        />
                        <Connector />
                    </>
                )}

                {/* Reporting Manager (Direct) */}
                {member.reportingManager && (
                    <>
                        <Node
                            icon={User}
                            title={member.reportingManager.name}
                            subtitle="Reporting Manager"
                        />
                        <Connector />
                    </>
                )}

                {/* YOU */}
                <Node icon={User} title={member.name} subtitle={member.designation || "Employee"} highlight />

            </div>
        </div>
    );
}

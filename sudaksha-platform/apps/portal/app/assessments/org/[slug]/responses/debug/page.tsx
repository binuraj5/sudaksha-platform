import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export default async function DebugPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    return (
        <div style={{ padding: "20px", fontFamily: "monospace", whiteSpace: "pre-wrap", background: "#f5f5f5" }}>
            <h1>Debug: Session & Route Info</h1>

            <h2>URL Slug</h2>
            {JSON.stringify({ slug }, null, 2)}

            <h2>Session Object</h2>
            {session ? (
                JSON.stringify(
                    {
                        user: {
                            id: ((session as any).user as any)?.id,
                            email: ((session as any).user as any)?.email,
                            role: ((session as any).user as any)?.role,
                            userType: ((session as any).user as any)?.userType,
                            tenantSlug: ((session as any).user as any)?.tenantSlug,
                            tenantId: ((session as any).user as any)?.tenantId,
                            clientId: ((session as any).user as any)?.clientId,
                            managedOrgUnitId: ((session as any).user as any)?.managedOrgUnitId,
                        },
                    },
                    null,
                    2
                )
            ) : (
                "No session"
            )}

            <h2>Tenant Lookup</h2>
            {await (async () => {
                try {
                    const tenant = await prisma.tenant.findUnique({
                        where: { slug },
                        select: { id: true, name: true, slug: true },
                    });
                    return JSON.stringify({ tenant }, null, 2);
                } catch (e: any) {
                    return `Error: ${e.message}`;
                }
            })()}

            <h2>Auth Checks</h2>
            {session ? (
                <div>
                    {(() => {
                        const u = (session as any).user as any;
                        const isSuperAdmin = u.userType === "SUPER_ADMIN" || u.role === "SUPER_ADMIN";
                        const isAdmin = isSuperAdmin || ["TENANT_ADMIN", "DEPARTMENT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"].includes(u.role || "");
                        const hasAccess = isSuperAdmin || u.tenantSlug === slug;
                        return JSON.stringify(
                            {
                                u_role: u.role,
                                u_userType: u.userType,
                                u_tenantSlug: u.tenantSlug,
                                slug_from_url: slug,
                                isSuperAdmin,
                                isAdmin,
                                hasAccess,
                                role_in_admin_roles: ["TENANT_ADMIN", "DEPARTMENT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"].includes(u.role || ""),
                                slug_match: u.tenantSlug === slug,
                            },
                            null,
                            2
                        );
                    })()}
                </div>
            ) : (
                "No session to check"
            )}
        </div>
    );
}

import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "./auth-config";
import { redirect } from "next/navigation";

export async function getSession(): Promise<Session | null> {
    return (await getServerSession(authOptions)) as Session | null;
}

export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }
    return user;
}

export async function checkRole(allowedRoles: string[]) {
    const user = await requireAuth();
    if (!allowedRoles.includes((user as any).role)) {
        redirect("/unauthorized");
    }
    return user;
}

export async function checkTenantAccess(slug: string) {
    const user = await requireAuth();
    if ((user as any).userType === "SUPER_ADMIN") return true;
    if ((user as any).tenantSlug !== slug) {
        redirect("/unauthorized");
    }
    return true;
}

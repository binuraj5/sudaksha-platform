import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD"];

/**
 * POST /api/org/[slug]/onboarding
 * Marks onboarding as complete by setting features.onboardingComplete = true on the tenant.
 */
export async function POST(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await getApiSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const sessionRole = (session.user as any).role;
    const isAdmin = ADMIN_ROLES.includes(sessionRole) || (session.user as any).userType === "TENANT_ADMIN";
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { id: true, features: true } });
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const updatedFeatures = { ...(tenant.features as object | null ?? {}), onboardingComplete: true };
    await prisma.tenant.update({ where: { id: tenant.id }, data: { features: updatedFeatures } });

    return NextResponse.json({ ok: true });
}

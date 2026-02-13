import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function POST(req: NextRequest) {
    const session = await getApiSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { roleName, description, totalExperienceYears, context, tenantSlug, tenantId } = body;

        if (!roleName || typeof roleName !== "string" || roleName.trim().length < 2) {
            return NextResponse.json(
                { error: "Role name is required (at least 2 characters)" },
                { status: 400 }
            );
        }

        if (
            typeof totalExperienceYears !== "number" ||
            totalExperienceYears < 0 ||
            totalExperienceYears > 50
        ) {
            return NextResponse.json(
                { error: "Total experience (years) is required and must be between 0 and 50" },
                { status: 400 }
            );
        }

        if (!["current", "aspirational"].includes(context)) {
            return NextResponse.json({ error: "Invalid context" }, { status: 400 });
        }

        const member = await prisma.member.findUnique({
            where: { email: session.user.email },
            include: { tenant: true },
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        let resolvedTenantId = member.tenantId || tenantId;

        if (!resolvedTenantId && tenantSlug) {
            const tenant = await prisma.tenant.findUnique({
                where: { slug: tenantSlug },
                select: { id: true },
            });
            if (tenant) resolvedTenantId = tenant.id;
        }

        if (!resolvedTenantId) {
            return NextResponse.json(
                { error: "Tenant context is required. Please access from your organization profile." },
                { status: 400 }
            );
        }

        const request = await prisma.roleAssignmentRequest.create({
            data: {
                memberId: member.id,
                tenantId: resolvedTenantId,
                requestedRoleName: roleName.trim(),
                description: description?.trim() || null,
                totalExperienceYears: Number(totalExperienceYears),
                context,
                status: "PENDING",
            },
        });

        return NextResponse.json({
            id: request.id,
            status: request.status,
            message: "Role request submitted successfully",
        });
    } catch (error) {
        console.error("[PROFILE_ROLE_REQUEST]", error);
        return NextResponse.json(
            { error: "Failed to submit role request" },
            { status: 500 }
        );
    }
}

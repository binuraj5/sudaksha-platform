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
        const {
            roleName,
            description,
            totalExperienceYears,
            context,
            tenantSlug,
            tenantId,
            isB2C,
            departmentId,
            departmentOtherText,
            industryId,
            industryOtherText,
        } = body;

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

        // B2C individual (no org): use a platform B2C tenant for role requests (slug "b2c" or first SYSTEM tenant)
        if (!resolvedTenantId) {
            const b2cTenant = await prisma.tenant.findFirst({
                where: { slug: "b2c" },
                select: { id: true },
            });
            if (b2cTenant) resolvedTenantId = b2cTenant.id;
            if (!resolvedTenantId) {
                const systemTenant = await prisma.tenant.findFirst({
                    where: { type: "SYSTEM" },
                    select: { id: true },
                });
                if (systemTenant) resolvedTenantId = systemTenant.id;
            }
        }

        if (!resolvedTenantId) {
            return NextResponse.json(
                {
                    error:
                        "Select your role from the list above. To request a new role to be created, contact support or ask your administrator to configure B2C role requests.",
                },
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
                departmentId: departmentId && typeof departmentId === "string" ? departmentId : null,
                departmentOtherText: departmentOtherText && typeof departmentOtherText === "string" ? departmentOtherText.trim() || null : null,
                industryId: industryId && typeof industryId === "string" ? industryId : null,
                industryOtherText: industryOtherText && typeof industryOtherText === "string" ? industryOtherText.trim() || null : null,
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

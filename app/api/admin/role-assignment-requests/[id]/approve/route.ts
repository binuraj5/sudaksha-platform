import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getApiSession();
    const u = session?.user as { id?: string; role?: string; userType?: string; name?: string } | undefined;
    const isSuperAdmin = u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";

    if (!session || !isSuperAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const body = await req.json();
        const { roleId, competencyIds } = body;

        // roleId: existing role to assign, OR we create a new one from the request
        const request = await prisma.roleAssignmentRequest.findUnique({
            where: { id },
            include: {
                member: true,
                tenant: true,
            },
        });

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (request.status !== "PENDING") {
            return NextResponse.json(
                { error: "Request has already been processed" },
                { status: 400 }
            );
        }

        let assignedRoleId = roleId;

        if (!assignedRoleId) {
            // Create new role from request
            const existingRole = await prisma.role.findFirst({
                where: {
                    name: { equals: request.requestedRoleName, mode: "insensitive" },
                },
            });

            if (existingRole) {
                assignedRoleId = existingRole.id;
            } else {
                const newRole = await prisma.role.create({
                    data: {
                        name: request.requestedRoleName,
                        description: request.description || `Requested by ${request.member.name}. Total experience: ${request.totalExperienceYears} years.`,
                        tenantId: request.tenantId,
                        overallLevel: "JUNIOR",
                        industries: ["GENERIC" as const],
                    },
                });
                assignedRoleId = newRole.id;
            }
        }

        // Assign competencies to role if provided
        if (Array.isArray(competencyIds) && competencyIds.length > 0) {
            for (const compId of competencyIds) {
                await prisma.roleCompetency.upsert({
                    where: {
                        roleId_competencyId: { roleId: assignedRoleId, competencyId: compId },
                    },
                    create: {
                        roleId: assignedRoleId,
                        competencyId: compId,
                        requiredLevel: "JUNIOR",
                    },
                    update: {},
                });
            }
        }

        // Assign role to member
        const updateField =
            request.context === "current" ? "currentRoleId" : "aspirationalRoleId";
        await prisma.member.update({
            where: { id: request.memberId },
            data: { [updateField]: assignedRoleId },
        });

        // Mark request as approved
        await prisma.roleAssignmentRequest.update({
            where: { id },
            data: {
                status: "APPROVED",
                assignedRoleId,
                processedBy: u?.id,
                processedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Role assigned successfully",
            assignedRoleId,
        });
    } catch (error) {
        console.error("[ROLE_ASSIGNMENT_APPROVE]", error);
        return NextResponse.json(
            { error: "Failed to approve request" },
            { status: 500 }
        );
    }
}

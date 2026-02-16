import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(req: Request) {
    const session = await getApiSession();
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const user = session.user as { tenantId?: string | null; email?: string } | undefined;
        const tenantId = user?.tenantId ?? null;

        // Include role IDs assigned to this member (current, aspirational, or via approved requests)
        // so approved role requests always show in the profile dropdown
        let memberAssignedRoleIds: string[] = [];
        const email = user?.email;
        if (email) {
            const member = await prisma.member.findUnique({
                where: { email },
                select: {
                    currentRoleId: true,
                    aspirationalRoleId: true,
                },
            });
            if (member) {
                memberAssignedRoleIds = [member.currentRoleId, member.aspirationalRoleId].filter(
                    (id): id is string => id != null
                );
            }
            const approvedAssigned = await prisma.roleAssignmentRequest.findMany({
                where: {
                    member: { email },
                    status: "APPROVED",
                    assignedRoleId: { not: null },
                },
                select: { assignedRoleId: true },
            });
            const fromRequests = approvedAssigned
                .map((r) => r.assignedRoleId)
                .filter((id): id is string => id != null);
            memberAssignedRoleIds = [...new Set([...memberAssignedRoleIds, ...fromRequests])];
        }

        const whereClause: any = {
            status: "APPROVED",
            isActive: true,
        };

        const orConditions: any[] = [];
        if (tenantId) {
            orConditions.push(
                { tenantId },
                { visibility: "UNIVERSAL" },
                { tenantId: null }
            );
        } else {
            orConditions.push({ visibility: "UNIVERSAL" }, { tenantId: null });
        }
        if (memberAssignedRoleIds.length > 0) {
            orConditions.push({ id: { in: memberAssignedRoleIds } });
        }
        whereClause.OR = orConditions;

        const roles = await prisma.role.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                description: true,
                competencies: {
                    select: {
                        competency: {
                            select: { id: true, name: true, category: true },
                        },
                    },
                },
            },
            orderBy: { name: "asc" },
        });

        return NextResponse.json(roles);
    } catch (error) {
        console.error("[CAREER_ROLES]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

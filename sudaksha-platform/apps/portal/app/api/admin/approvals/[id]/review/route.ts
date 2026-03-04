import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prismaAssessments } from "@sudaksha/db-assessments";
import { getApiSession } from "@/lib/get-session";
import { ApprovalStatus } from "@sudaksha/db-core";
import { notifyApprovalDecision } from "@/lib/notifications/approval-notifications";
import { normalizeUserRole } from "@/lib/permissions/role-competency-permissions";

const VALID_CATEGORIES = ["TECHNICAL", "BEHAVIORAL", "COGNITIVE", "DOMAIN_SPECIFIC"];
const CATEGORY_MAP: Record<string, string> = {
    FUNCTIONAL: "DOMAIN_SPECIFIC",
    LEADERSHIP: "BEHAVIORAL",
    CORE: "BEHAVIORAL",
    SOFT: "BEHAVIORAL",
    ANALYTICAL: "COGNITIVE",
    MANAGEMENT: "BEHAVIORAL",
    STRATEGIC: "COGNITIVE",
};

function sanitizeCategory(raw: string): string {
    const upper = (raw || "").toUpperCase();
    if (VALID_CATEGORIES.includes(upper)) return upper;
    return CATEGORY_MAP[upper] ?? "TECHNICAL";
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getApiSession();
    const u = session?.user as { id?: string; role?: string; userType?: string; tenantId?: string; name?: string } | undefined;
    if (!session?.user || !u?.role) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = normalizeUserRole(u.role);
    const isSuperAdmin = role === "SUPER_ADMIN" || u.userType === "SUPER_ADMIN";
    const isTenantAdmin = ["TENANT_ADMIN", "INSTITUTION_ADMIN", "CLIENT_ADMIN"].includes(role);
    const isDeptHead = ["DEPARTMENT_HEAD", "DEPT_HEAD_INST"].includes(role);
    const isTeamLead = ["TEAM_LEADER", "CLASS_TEACHER"].includes(role);

    if (!isSuperAdmin && !isTenantAdmin && !isDeptHead && !isTeamLead) {
        return new NextResponse("Unauthorized to perform reviews", { status: 403 });
    }

    const body = await req.json();
    // Frontend sends { decision, notes } — also accept legacy "reason"
    const { decision, notes, reason } = body;
    const reviewNotes = notes || reason || "";

    if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
        return new NextResponse("Invalid decision", { status: 400 });
    }

    const { id } = await params;
    try {
        let isAssessmentsDB = false;
        let request = await prisma.approvalRequest.findUnique({
            where: { id },
            include: { tenant: true },
        });

        if (!request) {
            request = await prismaAssessments.approvalRequest.findUnique({
                where: { id }
            }) as any;
            if (request) {
                isAssessmentsDB = true;
            }
        }

        if (!request) {
            return new NextResponse("Request not found", { status: 404 });
        }

        if (request.status !== "PENDING") {
            return new NextResponse("Request already processed", { status: 400 });
        }

        if (!isSuperAdmin && request.tenantId !== u.tenantId) {
            return new NextResponse("Unauthorized to review this tenant's request", { status: 403 });
        }

        const originalData = request.originalData as any;
        const isNewRoleRequest = request.entityId?.startsWith("NEW_ROLE_REQUEST_");

        let result;

        if (isAssessmentsDB) {
            result = await prismaAssessments.$transaction(async (tx) => {
                const updatedRequest = await tx.approvalRequest.update({
                    where: { id },
                    data: {
                        status: decision as any,
                        rejectionReason: decision === "REJECTED" ? reviewNotes : null,
                        comments: reviewNotes || null,
                        reviewerId: u.id,
                        reviewedAt: new Date(),
                    },
                });
                return updatedRequest;
            });
        } else {
            result = await prisma.$transaction(async (tx) => {
                let finalEntityId = request!.entityId;

                if (decision === "APPROVED") {
                    if (request!.type === "ROLE") {
                        if (isNewRoleRequest) {
                            // Role doesn't exist yet — create it from the stored originalData
                            const rd = originalData?.roleData || originalData || {};
                            const newRole = await tx.role.create({
                                data: {
                                    name: rd.name || "Unnamed Role",
                                    code: rd.code || `ROLE-${Date.now()}`,
                                    description: rd.description || "",
                                    overallLevel: rd.overallLevel || "JUNIOR",
                                    department: rd.department || null,
                                    industries: { set: rd.industries || [] },
                                    status: "APPROVED",
                                    visibility: "TENANT_SPECIFIC",
                                    tenantId: request!.tenantId,
                                    approvedBy: u.name,
                                    approvedAt: new Date(),
                                } as any,
                            });
                            finalEntityId = newRole.id;

                            // Create and link competencies from originalData
                            const competencies: any[] = originalData?.competencies || [];
                            for (const comp of competencies) {
                                let competency = await tx.competency.findFirst({
                                    where: { name: { equals: comp.name, mode: "insensitive" } },
                                });
                                if (!competency) {
                                    competency = await tx.competency.create({
                                        data: {
                                            name: comp.name,
                                            category: sanitizeCategory(comp.category || "TECHNICAL") as any,
                                            description: comp.description || "",
                                            scope: "ORGANIZATION",
                                            tenantId: request!.tenantId,
                                        } as any,
                                    });
                                }
                                await tx.roleCompetency.create({
                                    data: {
                                        roleId: newRole.id,
                                        competencyId: competency.id,
                                        requiredLevel: (comp.requiredLevel || "MIDDLE") as any,
                                        weight: comp.weight || 1.0,
                                    },
                                });
                            }

                            // Assign the approved role to the requester's member record
                            if (request!.requesterId) {
                                const requesterUser = await tx.user.findUnique({
                                    where: { id: request!.requesterId },
                                    select: { email: true },
                                });
                                if (requesterUser?.email) {
                                    const member = await tx.member.findFirst({
                                        where: {
                                            email: requesterUser.email,
                                            ...(request!.tenantId ? { tenantId: request!.tenantId } : {}),
                                        },
                                    });
                                    if (member) {
                                        await tx.member.update({
                                            where: { id: member.id },
                                            data: { currentRoleId: newRole.id } as any,
                                        });
                                    }
                                }
                            }
                        } else {
                            await tx.role.update({
                                where: { id: request!.entityId },
                                data: {
                                    ...(request!.modifiedData ? (request!.modifiedData as any) : {}),
                                    status: "APPROVED",
                                    approvedBy: u.name,
                                    approvedAt: new Date(),
                                },
                            });
                        }
                    } else if (request!.type === "COMPETENCY") {
                        await tx.competency.update({
                            where: { id: request!.entityId },
                            data: {
                                ...(request!.modifiedData ? (request!.modifiedData as any) : {}),
                                status: "APPROVED",
                            },
                        });
                    }
                } else if (decision === "REJECTED") {
                    // For new role requests there is no entity row to update — skip role/competency update
                    if (!isNewRoleRequest && request!.type === "ROLE") {
                        await tx.role.update({
                            where: { id: request!.entityId },
                            data: {
                                globalSubmissionStatus: "REJECTED",
                                globalRejectionReason: reviewNotes,
                            },
                        });
                    } else if (request!.type === "COMPETENCY") {
                        await tx.competency.update({
                            where: { id: request!.entityId },
                            data: {
                                globalSubmissionStatus: "REJECTED",
                                globalRejectionReason: reviewNotes,
                            },
                        });
                    }
                }

                const updatedRequest = await tx.approvalRequest.update({
                    where: { id },
                    data: {
                        status: decision as ApprovalStatus,
                        rejectionReason: decision === "REJECTED" ? reviewNotes : null,
                        comments: reviewNotes || null,
                        reviewerId: u.id,
                        reviewedAt: new Date(),
                        // Point entityId to the newly created real role ID
                        ...(isNewRoleRequest && decision === "APPROVED" ? { entityId: finalEntityId } : {}),
                    },
                });

                return updatedRequest;
            });
        }

        // Background notification
        notifyApprovalDecision(id).catch(console.error);

        return NextResponse.json(result);
    } catch (error) {
        console.error("[APPROVALS_REVIEW_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

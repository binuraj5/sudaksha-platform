import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getApiSession();
    const user = session?.user as { id?: string; role?: string; tenantId?: string; clientId?: string } | undefined;

    if (!session?.user || !user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const request = await prisma.competencyDevelopmentRequest.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                tenant: { select: { id: true, name: true, slug: true } },
            },
        });

        if (!request) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Scope check: non-superadmins can only see their tenant's requests
        const tenantId = (user.tenantId ?? user.clientId) as string | undefined;
        if (user.role !== "SUPER_ADMIN" && tenantId && request.tenantId !== tenantId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch the linked ApprovalRequest to get originalData (category, level, roleBenefit)
        const approvalRequest = await prisma.approvalRequest.findFirst({
            where: { entityId: id, type: "COMPETENCY" as any },
            select: { originalData: true },
        });

        return NextResponse.json({
            ...request,
            originalData: (approvalRequest?.originalData as any) ?? null,
        });
    } catch (error) {
        console.error("[COMPETENCY_REQUEST_ADMIN_GET_ID]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getApiSession();
    const user = session?.user as { id?: string; role?: string; tenantId?: string; clientId?: string } | undefined;

    if (!session?.user || !user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const allowedRoles = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_USER"];
    if (!allowedRoles.includes(user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { status, competencyId } = body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const request = await prisma.competencyDevelopmentRequest.findUnique({
            where: { id },
        });

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        // Determine if they have permission to modify this logic
        const tenantId = (user.tenantId ?? user.clientId) as string | undefined;
        if (user.role !== "SUPER_ADMIN" && request.tenantId !== tenantId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedRequest = await prisma.competencyDevelopmentRequest.update({
            where: { id },
            data: {
                status,
                resolvedAt: new Date(),
            },
            include: { user: true },
        });

        // Sync the status to the polymorphic ApprovalRequest queue
        try {
            await prisma.approvalRequest.updateMany({
                where: { entityId: id, type: "COMPETENCY" as any },
                data: {
                    status,
                    comments: status === "APPROVED" ? "Approved and competency created." : "Request rejected.",
                },
            });
        } catch (e) {
            console.error("Failed to sync ApprovalRequest status:", e);
        }

        // If approved and a competency id was provided, auto-assign to the user's techCompetencies
        if (status === "APPROVED" && competencyId) {
            const newComp = await prisma.competency.findUnique({
                where: { id: competencyId },
                select: { id: true, name: true, category: true },
            });

            if (newComp) {
                const member = await prisma.member.findUnique({
                    where: { email: updatedRequest.user.email },
                    select: { id: true, careerFormData: true },
                });

                const approvalRequest = await prisma.approvalRequest.findFirst({
                    where: { entityId: id, type: "COMPETENCY" as any },
                    select: { originalData: true },
                });

                const od = (approvalRequest?.originalData as any) || {};
                const requestedLevelStr = od.level || "JUNIOR";
                const levelMap: Record<string, number> = { "JUNIOR": 1, "MIDDLE": 2, "SENIOR": 3, "EXPERT": 4, "MASTER": 5 };
                const numericLevel = levelMap[requestedLevelStr] || 1;

                if (member) {
                    const careerData = (member.careerFormData as any) || {};
                    const isBehavioral = newComp.category === "BEHAVIORAL";
                    const listKey = isBehavioral ? "behavCompetencies" : "techCompetencies";

                    const existingList = Array.isArray(careerData[listKey]) ? careerData[listKey] : [];
                    const exists = existingList.find((c: any) => c.id === newComp.id);

                    if (!exists) {
                        const newList = [...existingList, { id: newComp.id, name: newComp.name, level: numericLevel }];
                        const updatedCareerData = { ...careerData, [listKey]: newList };

                        await prisma.member.update({
                            where: { id: member.id },
                            data: { careerFormData: updatedCareerData },
                        });
                    }
                }
            }
        }

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("[COMPETENCY_REQUEST_ADMIN_PATCH]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

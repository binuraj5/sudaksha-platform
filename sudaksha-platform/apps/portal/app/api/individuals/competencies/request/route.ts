import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function POST(req: NextRequest) {
    const session = await getApiSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const u = session.user as any;
    const userId = u.id;
    const tenantId = u.tenantId;

    if (!tenantId) {
        return NextResponse.json({ error: "No tenant context found." }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { name, description, positiveIndicators = [], negativeIndicators = [] } = body;

        if (!name || !description) {
            return NextResponse.json({ error: "Name and description are required." }, { status: 400 });
        }

        // Check if competency already exists to prevent duplicate pending names
        const existing = await prisma.competency.findFirst({
            where: { name: { equals: name, mode: "insensitive" } }
        });

        if (existing) {
            return NextResponse.json({ error: "A competency with this name already exists or is pending." }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Competency mapped to the user and marked PENDING
            const newCompetency = await tx.competency.create({
                data: {
                    name,
                    description,
                    status: "PENDING",
                    globalSubmissionStatus: "PENDING",
                    createdByUserId: userId,
                    tenantId: tenantId,
                    scope: "TENANT", // Initially tenant scoped until global approval
                }
            });

            // 2. Create Indicators
            const indicatorPayloads: any[] = [];

            // Build base indicators for the 4 levels
            const defaultLevels = ["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"];

            positiveIndicators.forEach((text: string, idx: number) => {
                defaultLevels.forEach(level => {
                    indicatorPayloads.push({
                        competencyId: newCompetency.id,
                        level: level as any,
                        type: "POSITIVE",
                        text,
                        order: idx
                    });
                });
            });

            negativeIndicators.forEach((text: string, idx: number) => {
                defaultLevels.forEach(level => {
                    indicatorPayloads.push({
                        competencyId: newCompetency.id,
                        level: level as any,
                        type: "NEGATIVE",
                        text,
                        order: idx
                    });
                });
            });

            if (indicatorPayloads.length > 0) {
                await tx.competencyIndicator.createMany({
                    data: indicatorPayloads
                });
            }

            // 3. Create the Approval Request for Super Admin or Tenant Admin
            const approvalReq = await tx.approvalRequest.create({
                data: {
                    tenantId: tenantId,
                    type: "COMPETENCY",
                    entityId: newCompetency.id,
                    status: "PENDING",
                    requesterId: userId,
                }
            });

            return { newCompetency, approvalReq };
        });

        return NextResponse.json({ success: true, newCompetency: result.newCompetency });
    } catch (e: any) {
        console.error("[COMPETENCY_REQUEST_API]", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}

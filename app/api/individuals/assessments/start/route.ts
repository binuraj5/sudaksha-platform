import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getApiSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { modelId } = await req.json();

    // Find or create Member for this user (type INDIVIDUAL)
    let member = await prisma.member.findFirst({
        where: {
            email: session.user.email!,
            type: "INDIVIDUAL",
        },
    });

    if (!member) {
        // Create B2C member on first assessment
        member = await prisma.member.create({
            data: {
                name: session.user.name || "B2C User",
                email: session.user.email!,
                password: "B2C_NO_PASSWORD", // Required by schema
                type: "INDIVIDUAL",
                tenantId: session.user.clientId || null, // B2C may not have tenant
            },
        });
    }

    // Check if already started
    const existing = await prisma.memberAssessment.findFirst({
        where: {
            memberId: member.id,
            assessmentModelId: modelId,
        },
    });

    if (existing) {
        return NextResponse.json({
            assessmentId: existing.id,
            message: "Assessment already started",
            alreadyExists: true,
        });
    }

    // Create self-selected assessment
    const assessment = await prisma.memberAssessment.create({
        data: {
            memberId: member.id,
            assessmentModelId: modelId,
            assignmentType: "SELF_SELECTED",
            status: "DRAFT" as any,
        },
    });

    return NextResponse.json(
        {
            assessmentId: assessment.id,
            message: "Assessment started",
        },
        { status: 201 }
    );
}

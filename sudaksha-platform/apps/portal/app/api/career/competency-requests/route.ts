import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await getApiSession();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const requests = await prisma.competencyDevelopmentRequest.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("[COMPETENCY_REQUEST_GET_ERROR]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getApiSession();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Look up the User record for its id
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Look up the Member record to get tenantId (Member.tenantId is the org reference)
        const member = await prisma.member.findFirst({
            where: { email: session.user.email },
            select: { tenantId: true }
        });

        const tenantId = member?.tenantId ?? null;

        const { name, category, description, roleBenefit, level } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newRequest = await prisma.competencyDevelopmentRequest.create({
            data: {
                name,
                description: description || null,
                userId: user.id,
                tenantId,
            },
        });

        // Also insert into the polymorphic ApprovalRequest table so it surfaces in /admin/approvals.
        // Non-fatal: if it fails the request is still saved.
        if (tenantId) {
            try {
                await prisma.approvalRequest.create({
                    data: {
                        type: "COMPETENCY",
                        entityId: newRequest.id,
                        tenantId,
                        requesterId: user.id,
                        status: "PENDING",
                        originalData: {
                            name,
                            category: category || "TECHNICAL",
                            level: level || "JUNIOR",
                            description: description || null,
                            roleBenefit: roleBenefit || null,
                        },
                        comments: description || null,
                    },
                });
            } catch (approvalErr) {
                console.warn("[COMPETENCY_REQUEST] Could not create ApprovalRequest row:", approvalErr);
            }
        }

        return NextResponse.json(newRequest);
    } catch (error) {
        console.error("[COMPETENCY_REQUEST_POST_ERROR]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

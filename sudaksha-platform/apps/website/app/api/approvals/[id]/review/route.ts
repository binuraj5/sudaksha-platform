import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getAdminEmail(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const raw = cookieStore.get("admin_session")?.value;
        if (!raw) return null;
        return JSON.parse(raw)?.email ?? null;
    } catch { return null; }
}

// POST /api/approvals/[id]/review
// body: { decision: "APPROVED" | "REJECTED", notes?: string }
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminEmail = await getAdminEmail();
    if (!adminEmail)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { decision, notes } = body as { decision: "APPROVED" | "REJECTED"; notes?: string };

    if (decision !== "APPROVED" && decision !== "REJECTED")
        return NextResponse.json({ error: "Invalid decision" }, { status: 400 });

    try {
        const existing = await prisma.approvalRequest.findUnique({ where: { id } });
        if (!existing)
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        if (existing.status !== "PENDING")
            return NextResponse.json({ error: "Request is no longer pending" }, { status: 409 });

        // Look up admin user to record reviewer id
        const reviewer = await prisma.user.findFirst({
            where: { email: adminEmail },
            select: { id: true },
        });

        await prisma.approvalRequest.update({
            where: { id },
            data: {
                status: decision,
                reviewedAt: new Date(),
                reviewerId: reviewer?.id ?? null,
                comments: notes ?? null,
                rejectionReason: decision === "REJECTED" ? (notes ?? null) : null,
            },
        });

        // If approved, activate the entity
        if (decision === "APPROVED") {
            if (existing.type === "ROLE") {
                await prisma.role.updateMany({
                    where: { id: existing.entityId },
                    data: { status: "APPROVED" } as any,
                }).catch(() => {}); // field may not exist on all Role variants
            } else if (existing.type === "COMPETENCY") {
                await prisma.competency.updateMany({
                    where: { id: existing.entityId },
                    data: { status: "APPROVED" } as any,
                }).catch(() => {});
            }
        }

        return NextResponse.json({ success: true, decision });
    } catch (error) {
        console.error("[POST /api/approvals/[id]/review]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

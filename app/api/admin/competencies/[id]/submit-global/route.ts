import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getApiSession();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const user = session.user as any;
        const { id: competencyId } = await params;
        const competency = await prisma.competency.findUnique({
            where: { id: competencyId },
            include: { tenant: { select: { id: true, name: true } } },
        });
        if (!competency) return NextResponse.json({ error: "Competency not found" }, { status: 404 });
        if (competency.tenantId !== user.tenantId && user.role !== "SUPER_ADMIN")
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if (competency.scope === "GLOBAL")
            return NextResponse.json({ error: "Competency is already global" }, { status: 400 });
        if (competency.globalSubmissionStatus === "PENDING")
            return NextResponse.json({ error: "Already pending global review" }, { status: 400 });
        if (!competency.tenantId)
            return NextResponse.json({ error: "Competency has no tenant" }, { status: 400 });
        const snapshot = JSON.parse(JSON.stringify(competency)) as object;
        await prisma.$transaction([
            prisma.competency.update({
                where: { id: competencyId },
                data: {
                    globalSubmissionStatus: "PENDING",
                    globalSubmittedBy: user.id,
                    globalSubmittedAt: new Date(),
                },
            }),
            prisma.globalApprovalRequest.create({
                data: {
                    entityType: "COMPETENCY",
                    entityId: competencyId,
                    tenantId: competency.tenantId,
                    submittedBy: user.id,
                    entitySnapshot: snapshot,
                },
            }),
        ]);
        return NextResponse.json({ message: "Submitted for global review" });
    } catch (error) {
        console.error("Submit competency for global review error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

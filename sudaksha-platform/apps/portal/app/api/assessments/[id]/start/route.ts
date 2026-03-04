import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Try ProjectUserAssessment (org-assigned)
        const projectAssessment = await prisma.projectUserAssessment.findFirst({
            where: { id, userId: session.user.id }
        });

        if (projectAssessment) {
            if (projectAssessment.status === 'DRAFT' || projectAssessment.status === 'ACTIVE') {
                await prisma.projectUserAssessment.update({
                    where: { id },
                    data: {
                        status: 'ACTIVE',
                        startedAt: new Date()
                    }
                });
            }
            return NextResponse.json({ success: true });
        }

        // 2. M15 B2C: Try MemberAssessment (self-selected by individual)
        const member = await prisma.member.findFirst({
            where: { email: (session.user as { email?: string }).email ?? "" },
            select: { id: true },
        });
        if (member) {
            const memberAssessment = await prisma.memberAssessment.findFirst({
                where: { id, memberId: member.id }
            });
            if (memberAssessment) {
                if (memberAssessment.status === 'DRAFT' || memberAssessment.status === 'PAUSED') {
                    await prisma.memberAssessment.update({
                        where: { id },
                        data: {
                            status: 'ACTIVE',
                            startedAt: new Date()
                        }
                    });
                }
                return NextResponse.json({ success: true });
            }
        }

        return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    } catch (error) {
        console.error("Start assessment error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * M15-14: Student Mode API
 * POST: Update member's userMode (PROFESSIONAL | STUDENT)
 */
export async function POST(req: Request) {
    try {
        const session = await getApiSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== "INDIVIDUAL") {
            return NextResponse.json({ error: "Forbidden: Individual users only" }, { status: 403 });
        }

        const body = await req.json();
        const { userMode } = body;

        if (!userMode || !["PROFESSIONAL", "STUDENT"].includes(userMode)) {
            return NextResponse.json({ error: "Invalid userMode. Use PROFESSIONAL or STUDENT." }, { status: 400 });
        }

        const member = await prisma.member.findFirst({
            where: { email: (session.user as { email?: string }).email ?? "", type: "INDIVIDUAL" },
            select: { id: true, metadata: true },
        });

        if (!member) {
            return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
        }

        const metadata = (member.metadata as Record<string, unknown>) || {};
        const updatedMetadata = {
            ...metadata,
            userMode,
        };

        await prisma.member.update({
            where: { id: member.id },
            data: { metadata: updatedMetadata },
        });

        return NextResponse.json({ success: true, userMode });
    } catch (error) {
        console.error("[INDIVIDUALS_PROFILE_MODE]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

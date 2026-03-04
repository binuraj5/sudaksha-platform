import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        const { id } = await params;

        const u = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = u?.role === "ADMIN" || u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";
        if (!session || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.competencyIndicator.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete indicator error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

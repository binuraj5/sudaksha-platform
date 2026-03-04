import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { id: roleId } = await params;

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { tenant: { select: { id: true, name: true } } },
    });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (role.tenantId !== user.tenantId && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if ((role as any).scope === "GLOBAL") {
      return NextResponse.json({ error: "Role is already global" }, { status: 400 });
    }

    if ((role as any).globalSubmissionStatus === "PENDING") {
      return NextResponse.json({ error: "Already pending global review" }, { status: 400 });
    }

    if (!role.tenantId) {
      return NextResponse.json({ error: "Role has no tenant" }, { status: 400 });
    }

    const snapshot = JSON.parse(JSON.stringify(role)) as object;

    await prisma.$transaction([
      prisma.role.update({
        where: { id: roleId },
        data: {
          globalSubmissionStatus: "PENDING",
          globalSubmittedBy: user.id,
          globalSubmittedAt: new Date(),
        } as any,
      }),
      (prisma as any).globalApprovalRequest.create({
        data: {
          entityType: "ROLE",
          entityId: roleId,
          tenantId: role.tenantId,
          submittedBy: user.id,
          entitySnapshot: snapshot,
        },
      }),
    ]);

    return NextResponse.json({ message: "Submitted for global review" });
  } catch (error) {
    console.error("Submit role for global review error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

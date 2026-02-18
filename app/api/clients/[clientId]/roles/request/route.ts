import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { createId } from "@paralleldrive/cuid2";

const LEVEL_MAP: Record<string, "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT"> = {
    junior: "JUNIOR",
    middle: "MIDDLE",
    senior: "SENIOR",
    management: "SENIOR",
    executive: "EXPERT",
    Junior: "JUNIOR",
    Middle: "MIDDLE",
    Senior: "SENIOR",
    Management: "SENIOR",
    Executive: "EXPERT",
};

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const user = session?.user as { id?: string; role?: string; tenantId?: string; clientId?: string } | undefined;

    if (!session?.user || !user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["SUPER_ADMIN", "TENANT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER", "EMPLOYEE", "MANAGER", "ASSESSOR", "STUDENT"];
    if (!allowedRoles.includes(user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tenantId = (user.tenantId ?? user.clientId) as string | undefined;
    const { clientId } = await params;
    if (user.role !== "SUPER_ADMIN" && tenantId !== clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, department, level, description, justification } = body;

        if (!title || typeof title !== "string" || title.trim().length < 2) {
            return NextResponse.json({ error: "Role title is required (at least 2 characters)" }, { status: 400 });
        }

        const trimmedTitle = title.trim();
        const overallLevel = LEVEL_MAP[level] || "JUNIOR";
        let departmentName: string | null = null;
        if (department && typeof department === "string") {
            const dept = await prisma.organizationUnit.findFirst({
                where: { id: department, tenantId: clientId, type: "DEPARTMENT" },
                select: { name: true },
            });
            departmentName = dept?.name ?? null;
        }

        const uniqueSuffix = createId().slice(0, 8);
        const draftName = `${trimmedTitle} (Request ${uniqueSuffix})`;
        const code = `REQ-${uniqueSuffix}`;

        const [role, approvalRequest] = await prisma.$transaction(async (tx) => {
            const newRole = await tx.role.create({
                data: {
                    name: draftName,
                    code,
                    description: (description && typeof description === "string" ? description.trim() : "") || `Requested: ${trimmedTitle}. ${justification && typeof justification === "string" ? justification.trim() : ""}`,
                    overallLevel,
                    department: departmentName,
                    industries: ["GENERIC" as any],
                    scope: department ? "DEPARTMENT" : "ORGANIZATION",
                    departmentId: department || null,
                    tenantId: clientId,
                    status: "DRAFT",
                    createdByUserId: user.id,
                },
            });

            const approval = await tx.approvalRequest.create({
                data: {
                    tenantId: clientId,
                    type: "ROLE",
                    entityId: newRole.id,
                    status: "PENDING",
                    requesterId: user.id,
                    modificationNotes: justification?.trim() || "New role definition request",
                    modifiedData: {
                        name: trimmedTitle,
                        description: description?.trim() || "",
                        overallLevel,
                        department: departmentName,
                        departmentId: department || null,
                        scope: department ? "DEPARTMENT" : "ORGANIZATION",
                        industries: { set: ["GENERIC"] },
                    },
                    originalData: {}, // Empty for new role
                },
            });

            return [newRole, approval];
        });

        return NextResponse.json({
            success: true,
            roleId: role.id,
            requestId: approvalRequest.id,
            message: "Role request submitted for approval",
        });
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "A role with this name may already exist. Try a different title or contact admin." }, { status: 409 });
        }
        console.error("[ROLES_REQUEST_POST]", error);
        return NextResponse.json({ error: "Failed to submit role request" }, { status: 500 });
    }
}

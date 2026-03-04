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

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Attempt to load from token, but fallback to DB to be strictly secure and robust against JWT shape mismatch
    let userRole = (session.user as any).role as string | undefined;
    let tenantId = ((session.user as any).tenantId ?? (session.user as any).clientId) as string | undefined;
    let userId = (session.user as any).id as string | undefined;

    const dbMember = await prisma.member.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true, tenantId: true }
    });

    if (!dbMember) {
        return NextResponse.json({ error: "User not found in database" }, { status: 401 });
    }

    // Always prefer fresh DB state over stale JWT cache! 
    userRole = dbMember.role;
    tenantId = dbMember.tenantId || undefined;
    // Do NOT override userId with dbMember.id, as createdByUserId maps to the User table, not the Member table.

    const allowedRoles = ["SUPER_ADMIN", "TENANT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER", "EMPLOYEE", "MANAGER", "ASSESSOR", "STUDENT"];
    if (!userRole || !allowedRoles.includes(userRole)) {
        console.error("403 REASON: Role not permitted", { userRole, email: session.user.email });
        return NextResponse.json({ error: `Forbidden - Role ${userRole} not permitted` }, { status: 403 });
    }

    const { clientId } = await params;
    if (userRole !== "SUPER_ADMIN" && tenantId !== clientId) {
        console.error("403 REASON: Cross-tenant isolation violation", {
            userRole,
            tenantId,
            clientId,
            dbMemberTenant: dbMember?.tenantId,
            sessionTenant: (session.user as any)?.tenantId,
            sessionClientId: (session.user as any)?.clientId
        });
        return NextResponse.json({ error: `Forbidden - tenantId [${tenantId}] !== clientId [${clientId}]` }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, department, level, description, justification, autoApprove } = body;

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
        const draftName = autoApprove ? trimmedTitle : `${trimmedTitle} (Request ${uniqueSuffix})`;
        const code = autoApprove ? `CUST-${uniqueSuffix}` : `REQ-${uniqueSuffix}`;

        const [role, approvalRequest] = await prisma.$transaction(async (tx) => {
            const newRole = await tx.role.create({
                data: {
                    name: draftName,
                    code,
                    description: (description && typeof description === "string" ? description.trim() : "") || `Requested: ${trimmedTitle}. ${justification && typeof justification === "string" ? justification.trim() : ""}`,
                    overallLevel,
                    department: departmentName,
                    industries: { set: ["GENERIC" as const] },
                    scope: "ORGANIZATION",
                    tenantId: clientId,
                    status: autoApprove ? "APPROVED" : "DRAFT",
                    createdByUserId: userId,
                },
            });

            const approval = await tx.approvalRequest.create({
                data: {
                    tenantId: clientId,
                    type: "ROLE",
                    entityId: newRole.id,
                    status: autoApprove ? "APPROVED" : "PENDING",
                    requesterId: userId,
                    originalData: {
                        requestedName: trimmedTitle,
                        description: description?.trim() || "",
                        level,
                        departmentId: department || null,
                        justification: justification?.trim() || "",
                    },
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

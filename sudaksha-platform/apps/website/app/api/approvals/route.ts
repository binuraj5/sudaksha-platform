import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAdminAuthenticated(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const raw = cookieStore.get("admin_session")?.value;
        if (!raw) return false;
        return !!JSON.parse(raw)?.email;
    } catch { return false; }
}

// GET /api/approvals — returns all PENDING approval requests with entity details
export async function GET() {
    if (!(await isAdminAuthenticated()))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const pending = await prisma.approvalRequest.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
        });

        // Collect entity ids by type to batch-fetch names
        const roleIds = pending.filter(r => r.type === "ROLE").map(r => r.entityId);
        const compIds = pending.filter(r => r.type === "COMPETENCY").map(r => r.entityId);

        const [roles, competencies] = await Promise.all([
            roleIds.length
                ? prisma.role.findMany({ where: { id: { in: roleIds } }, select: { id: true, name: true, description: true } })
                : [],
            compIds.length
                ? prisma.competency.findMany({ where: { id: { in: compIds } }, select: { id: true, name: true, description: true } })
                : [],
        ]);

        const roleMap = Object.fromEntries(roles.map(r => [r.id, r]));
        const compMap = Object.fromEntries(competencies.map(c => [c.id, c]));

        const requests = pending.map(req => {
            const entity =
                req.type === "ROLE" ? roleMap[req.entityId] :
                req.type === "COMPETENCY" ? compMap[req.entityId] : null;

            return {
                id: req.id,
                type: req.type,
                entityId: req.entityId,
                entityName: entity?.name ?? req.entityId,
                entityDescription: entity?.description ?? "",
                status: req.status,
                comments: req.comments,
                rejectionReason: req.rejectionReason,
                createdAt: req.createdAt.toISOString(),
                requesterId: req.requesterId,
            };
        });

        return NextResponse.json({ requests });
    } catch (error) {
        console.error("[GET /api/approvals]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/assessments/admin/global-publish-requests
 * List global publish requests (Super Admin only). Filter by status.
 */
export async function GET(req: NextRequest) {
    const session = await getApiSession();

    if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    try {
        const requests = await prisma.globalPublishRequest.findMany({
            where: status ? { status } : undefined,
            include: {
                requester: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { requestedAt: "desc" }
        });

        const enriched = await Promise.all(
            requests.map(async (r) => {
                let entityName = r.entityId;
                if (r.entityType === "MODEL") {
                    const model = await prisma.assessmentModel.findUnique({
                        where: { id: r.entityId },
                        select: { name: true, code: true }
                    });
                    entityName = model?.name ?? r.entityId;
                }
                return { ...r, entityName };
            })
        );

        return NextResponse.json(enriched);
    } catch (error) {
        console.error("[GLOBAL_PUBLISH_GET]", error);
        return NextResponse.json({ error: "Failed to load global publish requests" }, { status: 500 });
    }
}

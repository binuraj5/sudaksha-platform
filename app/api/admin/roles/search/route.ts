import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

/**
 * GET /api/admin/roles/search?q=...
 * Search roles by name - exact match (case-insensitive) and partial match (contains).
 * Used for suggesting similar roles when approving role assignment requests.
 */
export async function GET(req: NextRequest) {
    const session = await getApiSession();
    const u = session?.user as { role?: string; userType?: string } | undefined;
    const isSuperAdmin = u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";

    if (!session || !isSuperAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json([]);
    }

    try {
        const roles = await prisma.role.findMany({
            where: {
                name: { contains: q, mode: "insensitive" },
            },
            include: {
                _count: {
                    select: { competencies: true },
                },
            },
            orderBy: [
                { name: "asc" },
            ],
            take: 20,
        });

        return NextResponse.json(roles);
    } catch (error) {
        console.error("[ROLES_SEARCH]", error);
        return NextResponse.json(
            { error: "Failed to search roles" },
            { status: 500 }
        );
    }
}

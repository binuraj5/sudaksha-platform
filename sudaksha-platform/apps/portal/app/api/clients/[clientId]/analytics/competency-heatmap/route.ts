import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { clientId } = await params;

        // Fetch all DEPARTMENT-type org units for this tenant
        const departments = await prisma.organizationUnit.findMany({
            where: { tenantId: clientId, type: "DEPARTMENT", isActive: true },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });

        if (departments.length === 0) {
            return NextResponse.json([]);
        }

        // Fetch all members with careerFormData grouped by orgUnitId
        const members = await prisma.member.findMany({
            where: {
                tenantId: clientId,
                isActive: true,
                orgUnitId: { in: departments.map(d => d.id) },
            },
            select: { orgUnitId: true, careerFormData: true },
        });

        // Build department → competencyName → { sum, count } aggregation
        type CompAgg = Record<string, { sum: number; count: number }>;
        const deptAgg = new Map<string, CompAgg>();
        departments.forEach(d => deptAgg.set(d.id, {}));

        for (const member of members) {
            if (!member.orgUnitId) continue;
            const agg = deptAgg.get(member.orgUnitId);
            if (!agg) continue;

            const cd = (member.careerFormData as any) || {};
            const comps: Array<{ name: string; level: number }> = [
                ...(Array.isArray(cd.techCompetencies) ? cd.techCompetencies : []),
                ...(Array.isArray(cd.behavCompetencies) ? cd.behavCompetencies : []),
            ];

            for (const comp of comps) {
                if (!comp.name || typeof comp.level !== "number") continue;
                if (!agg[comp.name]) agg[comp.name] = { sum: 0, count: 0 };
                agg[comp.name].sum += comp.level;
                agg[comp.name].count += 1;
            }
        }

        // Shape into heatmap format
        const heatmap = departments.map(dept => {
            const agg = deptAgg.get(dept.id) || {};
            const competencies = Object.entries(agg).map(([name, { sum, count }]) => ({
                name,
                level: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
            }));
            return { department: dept.name, competencies };
        }).filter(d => d.competencies.length > 0);

        return NextResponse.json(heatmap);
    } catch (error) {
        console.error("[COMPETENCY_HEATMAP]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

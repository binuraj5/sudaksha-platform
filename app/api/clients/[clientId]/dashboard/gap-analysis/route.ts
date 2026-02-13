import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch all component results for this tenant's members
        // maximizing deep include is risky for performance, but necessary for gap analysis without raw SQL
        const results = await prisma.userAssessmentComponent.findMany({
            where: {
                userAssessmentModel: {
                    user: { clientId: clientId }
                },
                status: 'COMPLETED'
            },
            include: {
                component: {
                    include: {
                        competency: true
                    }
                }
            },
            take: 1000 // Limit for strict performance safety
        });

        // Group by Competency
        const competencyMap = new Map<string, { total: number; count: number; name: string }>();

        results.forEach(res => {
            const comp = (res as { component?: { competency?: { name?: string } } }).component;
            const competencyName = comp?.competency?.name || "General";
            const score = res.percentage || 0; // Assuming percentage is 0-100

            if (!competencyMap.has(competencyName)) {
                competencyMap.set(competencyName, { total: 0, count: 0, name: competencyName });
            }
            const entry = competencyMap.get(competencyName)!;
            entry.total += score;
            entry.count += 1;
        });

        const gaps = Array.from(competencyMap.values()).map(c => {
            const currentLevel = c.total / c.count;
            const targetLevel = 85; // Hardcoded organizational target for now
            const gapValue = targetLevel - currentLevel;

            let gapSeverity: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
            if (gapValue > 40) gapSeverity = 'HIGH';
            else if (gapValue > 20) gapSeverity = 'MEDIUM';

            return {
                competency: c.name,
                currentLevel: Math.round(currentLevel),
                targetLevel: targetLevel,
                gap: gapSeverity,
                employeesAffected: c.count // rough proxy
            };
        });

        // Sort by gap size (desc) and take top 10
        const sortedGaps = gaps.sort((a, b) => (b.targetLevel - b.currentLevel) - (a.targetLevel - a.currentLevel)).slice(0, 10);

        return NextResponse.json(sortedGaps);

    } catch (error) {
        console.error("Gap Analysis Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

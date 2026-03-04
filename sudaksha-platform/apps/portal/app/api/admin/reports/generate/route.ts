
import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getApiSession();
    if (!session || !session.user || !['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'PROJECT_MANAGER'].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { metric, groupBy, startDate, endDate } = await req.json();

        // Base Filter
        const whereClause: any = {};
        if (startDate && endDate) {
            whereClause.updatedAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        // Fetch Data
        // Note: Prisma groupBy has limitations with relations, so we might fetch and aggregate in JS for flexibility
        // or use raw queries for performance. For now, fetch & aggregate (MVP).

        const data = await prisma.memberAssessment.findMany({
            where: whereClause,
            include: {
                member: {
                    include: { orgUnit: true }
                },
                assessmentModel: true
            }
        });

        // Aggregation Logic
        const resultMap = new Map<string, { label: string, count: number, valueSum: number }>();

        data.forEach(item => {
            let key = 'Unknown';
            let label = 'Unknown';

            // 1. Determine Group Key
            if (groupBy === 'department') {
                key = item.member?.orgUnit?.id || 'no-dept';
                label = item.member?.orgUnit?.name || 'No Department';
            } else if (groupBy === 'assessment') {
                key = item.assessmentModelId;
                label = item.assessmentModel.name;
            } else if (groupBy === 'status') {
                key = item.status;
                label = item.status;
            }

            // 2. Initialize Map Entry
            if (!resultMap.has(key)) {
                resultMap.set(key, { label, count: 0, valueSum: 0 });
            }

            // 3. Update Metrics
            const entry = resultMap.get(key)!;
            entry.count += 1;

            if (metric === 'completion_rate') {
                entry.valueSum += (item.status === 'COMPLETED' ? 100 : item.completionPercentage || 0);
            } else if (metric === 'average_score') {
                entry.valueSum += (item.overallScore || 0);
            } else if (metric === 'time_spent') {
                // Mocking time spent based on completion (real data would track duration)
                const mins = item.status === 'COMPLETED' ? (item.assessmentModel.durationMinutes ?? 0) : 0;
                entry.valueSum += mins;
            }
        });

        // 4. Format Result
        const result = Array.from(resultMap.values()).map(entry => ({
            name: entry.label,
            value: Math.round(entry.valueSum / entry.count), // Average
            count: entry.count
        }));

        return NextResponse.json(result);

    } catch (error) {
        console.error("Report Gen Error:", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getApiSession();

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // 1. Subscription Tiers Distribution
        const tiers = await prisma.tenant.groupBy({
            by: ['subscriptionTier'],
            _count: { _all: true }
        });

        // 2. Monthly Revenue (Paid Invoices)
        const revenue = await prisma.invoice.aggregate({
            where: {
                status: "PAID",
                paidAt: { gte: startOfMonth }
            },
            _sum: { amountPaid: true }
        });

        const prevRevenue = await prisma.invoice.aggregate({
            where: {
                status: "PAID",
                paidAt: { gte: lastMonth, lt: startOfMonth }
            },
            _sum: { amountPaid: true }
        });

        // 3. Resource Usage Stats
        const usage = await prisma.usageRecord.groupBy({
            by: ['resourceType'],
            _sum: { quantity: true, totalPrice: true },
            where: { recordedAt: { gte: startOfMonth } }
        });

        // 4. Active Assessments Count
        const activeAssessments = await prisma.userAssessmentModel.count({
            where: { status: "ACTIVE" }
        });

        // 5. Recent Subscriptions
        const recentSubs = await prisma.subscription.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                tenant: { select: { name: true } }
            }
        });

        return NextResponse.json({
            tiers,
            monthlyRevenue: Number(revenue._sum.amountPaid || 0),
            revenueGrowth: calculateGrowth(Number(revenue._sum.amountPaid || 0), Number(prevRevenue._sum.amountPaid || 0)),
            usage,
            activeAssessments,
            recentSubs
        });
    } catch (error) {
        console.error("Usage Analytics Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}

function calculateGrowth(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

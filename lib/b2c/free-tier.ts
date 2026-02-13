import { prisma } from "@/lib/prisma";

export async function canTakeAssessment(
    memberId: string
): Promise<{ allowed: boolean; reason?: string }> {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: { metadata: true }
    });

    if (!member) {
        return { allowed: false, reason: "Member not found" };
    }

    const metadata = member.metadata as any || {};

    // Check tier
    if (metadata.subscriptionTier === 'PREMIUM') {
        return { allowed: true }; // No limits for premium
    }

    // Check free tier usage
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const usedThisMonth = await prisma.memberAssessment.count({
        where: {
            memberId,
            status: { in: ['COMPLETED', 'SUBMITTED'] },
            createdAt: { gte: thisMonth }
        }
    });

    if (usedThisMonth >= 10) {
        return {
            allowed: false,
            reason: 'Free tier limit reached (10/month). Upgrade to Premium for unlimited assessments.'
        };
    }

    return { allowed: true };
}

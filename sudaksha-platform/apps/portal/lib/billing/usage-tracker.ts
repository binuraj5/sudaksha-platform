import { prisma } from "@/lib/prisma";

export type ResourceType =
    | "ASSESSMENT"
    | "AI_QUESTION_GEN"
    | "AI_VOICE_INTERVIEW"
    | "CERTIFICATE_ISSUE";

const RESOURCE_PRICES: Record<ResourceType, number> = {
    ASSESSMENT: 1.0,        // $1.00 per assessment above limit
    AI_QUESTION_GEN: 0.5,   // $0.50 per set
    AI_VOICE_INTERVIEW: 5.0, // $5.00 per interview
    CERTIFICATE_ISSUE: 2.0  // $2.00 per certificate
};

/**
 * Records a usage event for a tenant.
 */
export async function trackUsage(
    tenantId: string,
    resourceType: ResourceType,
    quantity: number = 1,
    resourceId?: string
) {
    // 1. Get Active Subscription
    const subscription = await prisma.subscription.findFirst({
        where: {
            tenantId,
            status: "ACTIVE"
        }
    });

    if (!subscription) {
        console.warn(`No active subscription found for tenant ${tenantId}. Usage tracked but unbilled.`);
    }

    // 2. Create Usage Record
    const unitPrice = RESOURCE_PRICES[resourceType];

    return await prisma.usageRecord.create({
        data: {
            tenantId,
            subscriptionId: subscription?.id || "N/A", // Handled by business logic later if N/A
            resourceType,
            resourceId,
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity,
            recordedAt: new Date()
        }
    });
}

/**
 * Increments the internal counter for the active subscription period if applicable.
 */
export async function incrementPeriodUsage(tenantId: string) {
    const subscription = await prisma.subscription.findFirst({
        where: {
            tenantId,
            status: "ACTIVE"
        }
    });

    if (subscription) {
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                assessmentsUsedThisPeriod: {
                    increment: 1
                }
            }
        });
    }
}

import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";

export type FeatureKey =
    | "ai_questions"
    | "ai_voice_interview"
    | "bulk_upload"
    | "custom_reports"
    | "career_portal"
    | "white_label";

const TIER_FEATURES: Record<SubscriptionTier, FeatureKey[]> = {
    STARTER: [],
    GROWTH: ["bulk_upload"],
    BUSINESS: ["bulk_upload", "ai_questions", "custom_reports"],
    ENTERPRISE: ["bulk_upload", "ai_questions", "custom_reports", "career_portal", "white_label", "ai_voice_interview"]
};

/**
 * Checks if a tenant has access to a specific feature.
 * Features can be granted by Tier OR by explicit FeatureActivation.
 */
export async function hasFeatureAccess(tenantId: string, feature: FeatureKey): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
            subscriptionTier: true,
            features: true,
            featureActivations: {
                where: {
                    featureKey: feature,
                    isActive: true,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                }
            }
        }
    });

    if (!tenant) return false;

    // 1. Check explicit activations (Add-ons)
    if (tenant.featureActivations.length > 0) return true;

    // 2. Check tier-based features
    if (TIER_FEATURES[tenant.subscriptionTier].includes(feature)) return true;

    // 3. Check legacy/manual JSON flags
    const featuresJson = tenant.features as any;
    if (featuresJson && featuresJson[feature] === true) return true;

    return false;
}

/**
 * Checks if a tenant has reached their user limit.
 */
export async function checkUserLimit(tenantId: string): Promise<{ allowed: boolean, current: number, limit: number }> {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
            subscriptionTier: true,
            _count: {
                select: { members: true }
            }
        }
    });

    if (!tenant) return { allowed: false, current: 0, limit: 0 };

    const limits: Record<SubscriptionTier, number> = {
        STARTER: 10,
        GROWTH: 50,
        BUSINESS: 200,
        ENTERPRISE: 10000
    };

    const limit = limits[tenant.subscriptionTier];
    const current = tenant._count.members;

    return {
        allowed: current < limit,
        current,
        limit
    };
}

import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { SubscriptionTier, BillingPeriod, SubscriptionStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
    const session = await getApiSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            tenantId,
            plan,
            userCount,
            billingPeriod,
            selectedAddons,
            stripeSessionId
        } = body;

        if (!tenantId || !plan) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Calculate Prices (Mirroring frontend logic for now, in production use Stripe Price IDs)
        const planPrices = { STARTER: 49, GROWTH: 199, BUSINESS: 599, ENTERPRISE: 1500 };
        const addonsPrices: Record<string, number> = {
            adv_role: 20, bulk_upload: 15, custom_reports: 30, career_portal: 40, ai_questions: 50, ai_voice_interview: 150
        };

        const basePrice = planPrices[plan as SubscriptionTier];
        const addonsPrice = selectedAddons.reduce((sum: number, id: string) => sum + (addonsPrices[id] || 0), 0);

        const discounts = { MONTHLY: 0, QUARTERLY: 0.05, SEMI_ANNUAL: 0.10, ANNUAL: 0.20 };
        const discountPercent = discounts[billingPeriod as BillingPeriod] * 100;
        const totalPrice = (basePrice + addonsPrice) * (1 - discounts[billingPeriod as BillingPeriod]);

        // 2. Perform Transaction: Update Tenant and Create Subscription
        const result = await prisma.$transaction(async (tx) => {
            // Update Tenant Plan
            const updatedTenant = await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    subscriptionTier: plan as SubscriptionTier,
                    maxMembers: Math.max(userCount, 10), // Ensure at least 10 for starter
                    features: (Object.fromEntries((selectedAddons as string[] || []).map((a: string) => [a, true])) as Prisma.InputJsonValue)
                }
            });

            // Deactivate old subscriptions if any
            await tx.subscription.updateMany({
                where: { tenantId, status: "ACTIVE" },
                data: { status: "INACTIVE" }
            });

            // Create New Subscription
            const newSub = await tx.subscription.create({
                data: {
                    tenantId,
                    planType: plan as SubscriptionTier,
                    userCount,
                    billingPeriod: billingPeriod as BillingPeriod,
                    features: selectedAddons,
                    basePrice,
                    addonsPrice,
                    discountPercent,
                    totalPrice,
                    status: "ACTIVE",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: calculatePeriodEnd(billingPeriod as BillingPeriod),
                    stripeSubscriptionId: stripeSessionId // Mock or actual Session ID
                }
            });

            // Provision Features (FeatureActivation)
            await tx.featureActivation.deleteMany({ where: { tenantId } }); // Reset for simplicity in pilot
            await tx.featureActivation.createMany({
                data: selectedAddons.map((key: string) => ({
                    tenantId,
                    featureKey: key,
                    isActive: true,
                    activatedBy: session.user.id
                }))
            });

            return { updatedTenant, newSub };
        });

        return NextResponse.json({
            message: "Subscription activated successfully",
            subscriptionId: result.newSub.id
        });

    } catch (error) {
        console.error("Subscription Activation Error:", error);
        return NextResponse.json({ error: "Failed to activate subscription" }, { status: 500 });
    }
}

function calculatePeriodEnd(period: BillingPeriod): Date {
    const d = new Date();
    if (period === "MONTHLY") d.setMonth(d.getMonth() + 1);
    else if (period === "QUARTERLY") d.setMonth(d.getMonth() + 3);
    else if (period === "SEMI_ANNUAL") d.setMonth(d.getMonth() + 6);
    else if (period === "ANNUAL") d.setFullYear(d.getFullYear() + 1);
    return d;
}

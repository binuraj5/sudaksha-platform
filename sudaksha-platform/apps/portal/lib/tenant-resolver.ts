import { prisma } from "@/lib/prisma";
import { getLabelsForTenant } from "@/lib/tenant-labels";
import type { TenantType } from "@/lib/tenant-labels";
import type { TenantLabels } from "@/lib/tenant-labels";

/**
 * Resolves tenant type from clientId (which may refer to Tenant or Client).
 * Used for polymorphic Corporate/Institution labels.
 */
export async function resolveTenantType(clientId: string): Promise<TenantType> {
    const tenant = await prisma.tenant.findUnique({
        where: { id: clientId },
        select: { type: true },
    });
    if (tenant?.type) return tenant.type as TenantType;

    const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { id: true },
    });
    return client ? "CORPORATE" : "CORPORATE";
}

/**
 * Resolves tenant labels for a clientId. Use in Server Components.
 */
export async function resolveTenantLabels(clientId: string): Promise<TenantLabels> {
    const type = await resolveTenantType(clientId);
    return getLabelsForTenant(type);
}

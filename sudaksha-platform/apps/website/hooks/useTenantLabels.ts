'use client';

import { useTenant } from './useTenant';
import { getLabelsForTenant } from '@/lib/tenant-labels';

export function useTenantLabels() {
    const { tenant } = useTenant();

    if (!tenant) {
        return getLabelsForTenant('SYSTEM');
    }

    // Cast or ensuring type compatibility
    return getLabelsForTenant(tenant.type as any);
}

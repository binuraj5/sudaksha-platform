"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tenant, TenantType } from "@/lib/navigation-config";

export function useTenant() {
    const { data: session } = useSession();
    const params = useParams();
    const [tenantData, setTenantData] = useState<{ id: string; slug?: string; type: TenantType; name: string; logoUrl?: string } | null>(null);

    const slug = params?.slug as string | undefined;
    const clientId = params?.clientId as string | undefined;
    const sessionClientId = (session?.user as any)?.clientId || (session?.user as any)?.tenantId;
    const sessionSlug = (session?.user as any)?.tenantSlug as string | undefined;

    const activeSlug = slug || sessionSlug;
    const activeTenantId = clientId || sessionClientId;

    useEffect(() => {
        if (slug) {
            fetch(`/api/org/${slug}/tenant`)
                .then((r) => r.json())
                .then((data) => {
                    if (data?.type) {
                        setTenantData({
                            id: data.id,
                            slug: data.slug,
                            type: data.type as TenantType,
                            name: data.name ?? (data.type === "INSTITUTION" ? "Institution" : "Organization"),
                            logoUrl: data.logoUrl,
                        });
                    } else {
                        setTenantData(null);
                    }
                })
                .catch(() => setTenantData(null));
        } else if (activeTenantId) {
            fetch(`/api/clients/${activeTenantId}/tenant`)
                .then((r) => r.json())
                .then((data) => {
                    if (data?.type) {
                        setTenantData({
                            id: activeTenantId,
                            type: data.type as TenantType,
                            name: data.name ?? (data.type === "INSTITUTION" ? "Institution" : "Organization"),
                            logoUrl: data.logoUrl,
                        });
                    } else {
                        setTenantData({ id: activeTenantId, type: "CORPORATE", name: "Organization", logoUrl: undefined });
                    }
                })
                .catch(() => setTenantData({ id: activeTenantId, type: "CORPORATE", name: "Organization", logoUrl: undefined }));
        } else {
            setTenantData(null);
        }
    }, [slug, activeTenantId]);

    const tenant: Tenant | null = tenantData
        ? {
              id: tenantData.id,
              slug: tenantData.slug ?? slug ?? sessionSlug ?? undefined,
              type: tenantData.type,
              name: tenantData.name,
              logoUrl: tenantData.logoUrl ?? undefined,
          }
        : null;

    return { tenant };
}

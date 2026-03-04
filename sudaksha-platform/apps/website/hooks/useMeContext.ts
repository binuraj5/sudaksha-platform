"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface MeContextData {
    tenantName: string;
    logoUrl: string | null;
    hierarchyLabel: string | null;
    isCorporateOrInstitution: boolean;
}

export function useMeContext(): MeContextData | null {
    const { data: session } = useSession();
    const params = useParams();
    const [data, setData] = useState<MeContextData | null>(null);

    const clientId = (params?.clientId as string) || (session?.user as any)?.clientId || (session?.user as any)?.tenantId;

    useEffect(() => {
        if (!clientId || !session?.user) {
            setData(null);
            return;
        }
        fetch(`/api/clients/${clientId}/me-context`)
            .then((r) => r.json())
            .then((payload) => {
                if (payload.tenantName !== undefined) {
                    setData({
                        tenantName: payload.tenantName ?? "Organization",
                        logoUrl: payload.logoUrl ?? null,
                        hierarchyLabel: payload.hierarchyLabel ?? null,
                        isCorporateOrInstitution: !!payload.isCorporateOrInstitution,
                    });
                } else {
                    setData(null);
                }
            })
            .catch(() => setData(null));
    }, [clientId, session?.user]);

    return data;
}

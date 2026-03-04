"use client";

import { RolesPageContent } from "@/components/Roles/RolesPageContent";
import { BulkUploadRolesDialog } from "@/components/Roles/BulkUploadRolesDialog";

export function OrgRolesClient({
    clientId,
    isInstitution,
    slug,
}: {
    clientId: string;
    isInstitution: boolean;
    slug: string;
}) {
    return (
        <RolesPageContent
            baseUrl={`/assessments/org/${slug}/roles`}
            clientId={clientId}
            extraActions={
                <BulkUploadRolesDialog clientId={clientId} />
            }
        />
    );
}

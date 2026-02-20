"use client";

import { RolesPageContent } from "@/components/Roles/RolesPageContent";
import { BulkUploadRolesDialog } from "@/components/Roles/BulkUploadRolesDialog";
import { CreateRoleDialog } from "@/components/Roles/CreateRoleDialog";

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
            extraActions={
                <>
                    <BulkUploadRolesDialog clientId={clientId} />
                    <CreateRoleDialog clientId={clientId} isInstitution={isInstitution} />
                </>
            }
        />
    );
}

"use client";

import { RolesPageContent } from "@/components/Roles/RolesPageContent";
import { BulkUploadRolesDialog } from "@/components/Roles/BulkUploadRolesDialog";
import { CreateRoleDialog } from "@/components/Roles/CreateRoleDialog";

export function OrgRolesClient({
    clientId,
    isInstitution,
}: {
    clientId: string;
    isInstitution: boolean;
}) {
    return (
        <RolesPageContent
            extraActions={
                <>
                    <BulkUploadRolesDialog clientId={clientId} />
                    <CreateRoleDialog clientId={clientId} isInstitution={isInstitution} />
                </>
            }
        />
    );
}

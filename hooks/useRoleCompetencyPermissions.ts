import { useSession } from 'next-auth/react';
import { getRoleCompetencyPermissions, type RoleCompetencyPermissions } from '@/lib/permissions/role-competency-permissions';

export function useRoleCompetencyPermissions(): RoleCompetencyPermissions {
  const { data: session } = useSession();

  if (!session?.user) {
    // Return no-permission defaults
    return {
      canView: false, canCreate: false, canEditOwn: false,
      canEditOrg: false, canEditGlobal: false, canDeleteOwn: false,
      canDeleteOrg: false, canDeleteGlobal: false,
      canSubmitForGlobal: false, canApproveGlobal: false,
      canPublishToOrg: false, creatableScope: null,
      allowedLevels: [], visibleScopes: [], isInstitution: false,
    };
  }

  const user = session.user as any;

  return getRoleCompetencyPermissions({
    id: user.id,
    role: user.role,
    tenantId: user.tenantId,
    tenantType: user.tenant?.type || 'CORPORATE',
    departmentId: user.departmentId,
    teamId: user.teamId,
  });
}

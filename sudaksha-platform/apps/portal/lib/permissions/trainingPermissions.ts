/**
 * Training Delivery Assessment System — RBAC Permission Matrix
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T4
 *
 * SUDAKSHA_OBSERVER: full cross-tenant read + write on all TDAS resources
 * TRAINER: scoped to own assigned clients + cohorts only
 * OPS_DELIVERY: scoped to all sessions within their assigned clients
 */

export type TDASPermission =
  | 'session:create'
  | 'session:activate'
  | 'session:read'
  | 'session:read_all_tenants'
  | 'session:write_all_tenants'
  | 'questions:upload'
  | 'questions:read'
  | 'results:read'
  | 'results:read_all_tenants'
  | 'participant:manage';

const ROLE_PERMISSIONS: Record<string, TDASPermission[]> = {
  SUDAKSHA_OBSERVER: [
    'session:create',
    'session:activate',
    'session:read',
    'session:read_all_tenants',
    'session:write_all_tenants',
    'questions:upload',
    'questions:read',
    'results:read',
    'results:read_all_tenants',
    'participant:manage',
  ],
  SUDAKSHA_ADMIN: [
    'session:create',
    'session:activate',
    'session:read',
    'session:read_all_tenants',
    'session:write_all_tenants',
    'questions:upload',
    'questions:read',
    'results:read',
    'results:read_all_tenants',
    'participant:manage',
  ],
  OPS_DELIVERY: [
    'session:create',
    'session:activate',
    'session:read',
    'questions:upload',
    'questions:read',
    'results:read',
    'participant:manage',
  ],
  TRAINER: [
    'session:create',
    'session:activate',
    'session:read',
    'questions:upload',
    'questions:read',
    'results:read',
  ],
};

export function hasPermission(role: string, permission: TDASPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function isCrossTenantRole(role: string): boolean {
  return role === 'SUDAKSHA_OBSERVER' || role === 'SUDAKSHA_ADMIN';
}

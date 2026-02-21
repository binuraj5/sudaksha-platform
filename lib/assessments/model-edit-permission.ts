/**
 * Model edit permission logic for assessment models.
 *
 * Rules:
 * - Published models: components cannot be edited. Must unpublish first.
 * - Super Admin: can unpublish any model, then edit.
 * - Org Admin / Dept Head / Team Lead: can unpublish models in their hierarchy, then edit.
 * - Employees, Students, B2C: cannot unpublish or edit.
 */

import type { Session } from "next-auth";

const EDIT_ROLES = ["SUPER_ADMIN", "ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "ORG_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"];
const READ_ONLY_ROLES = ["EMPLOYEE", "STUDENT", "INDIVIDUAL", "ASSESSOR", "MANAGER"];

export type ModelWithStatus = { id: string; status: string; tenantId?: string | null; clientId?: string | null };

/**
 * Check if user can unpublish a model (revert to draft).
 * Super Admin: any model.
 * Org/Dept/Team: models in their tenant/client hierarchy.
 */
export async function canUnpublishModel(
    model: ModelWithStatus,
    session: Session | null
): Promise<{ allowed: boolean; reason?: string }> {
    if (!session?.user) {
        return { allowed: false, reason: "Not authenticated" };
    }

    const user = session.user as { role?: string; userType?: string; tenantId?: string; clientId?: string };
    const role = user.role || user.userType;

    if (role === "SUPER_ADMIN" || user.userType === "SUPER_ADMIN") {
        return { allowed: true };
    }

    if (READ_ONLY_ROLES.includes(role as string)) {
        return { allowed: false, reason: "Your role cannot unpublish models" };
    }

    if (!EDIT_ROLES.includes(role as string)) {
        return { allowed: false, reason: "Insufficient permissions" };
    }

    const userTenantId = user.tenantId || user.clientId;
    const modelTenantId = model.tenantId;
    const modelClientId = model.clientId;

    if (!userTenantId) {
        return { allowed: false, reason: "No organization context" };
    }

    const inHierarchy =
        modelTenantId === userTenantId ||
        modelClientId === userTenantId ||
        modelClientId === user.clientId;

    if (!inHierarchy) {
        return { allowed: false, reason: "Model is outside your organization hierarchy" };
    }

    return { allowed: true };
}

/**
 * Check if user can edit components (add/modify/delete).
 * Only allowed when model is DRAFT.
 * User must also have unpublish permission (so they could unpublish first if needed).
 */
export async function canEditModelComponents(
    model: ModelWithStatus,
    session: Session | null
): Promise<{ allowed: boolean; reason?: string }> {
    if (!session?.user) {
        return { allowed: false, reason: "Not authenticated" };
    }

    if (model.status === "PUBLISHED") {
        const unpublishCheck = await canUnpublishModel(model, session);
        if (unpublishCheck.allowed) {
            return {
                allowed: false,
                reason: "Model is published. Unpublish it first to make changes, then publish as the next version."
            };
        }
        return {
            allowed: false,
            reason: "Model is published and you cannot unpublish it. Contact your administrator."
        };
    }

    const unpublishCheck = await canUnpublishModel(model, session);
    if (!unpublishCheck.allowed) {
        return { allowed: false, reason: unpublishCheck.reason || "Insufficient permissions" };
    }

    return { allowed: true };
}

/**
 * Bump version string (e.g. 1.0.0 -> 1.0.1)
 */
export function bumpVersion(version: string): string {
    const parts = version.split(".").map((p) => parseInt(p, 10) || 0);
    if (parts.length < 3) {
        parts.push(0, 0);
    }
    parts[2] = (parts[2] ?? 0) + 1;
    return parts.slice(0, 3).join(".");
}

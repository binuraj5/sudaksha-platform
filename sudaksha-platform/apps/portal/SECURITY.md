# Security Model — Sudaksha Portal

## Multi-Tenant Isolation

The platform uses **application-level tenant isolation** enforced in every Prisma query.
PostgreSQL Row-Level Security (RLS) is not enabled on any table; isolation is the responsibility of the API layer.

### How it works

Every authenticated API route obtains the caller's `tenantId` (clientId) from the session
and passes it as a Prisma `where` filter. No cross-tenant data is ever returned.

```
Session → tenantId
  ↓
Prisma query: db.someModel.findMany({ where: { tenantId, ...otherFilters } })
```

### Role boundaries

| Role | Scope |
|---|---|
| `SUPER_ADMIN` | No tenantId filter — sees all tenants |
| `TENANT_ADMIN` | Filtered to `session.user.tenantId` |
| `DEPARTMENT_HEAD` | Filtered to tenant + their orgUnit |
| `TEAM_LEAD` | Filtered to tenant + their team |
| `EMPLOYEE / STUDENT / INDIVIDUAL` | Filtered to tenant + their own records |

### Accepted trade-offs vs. DB-level RLS

| Property | DB-level RLS | Current (app-level) |
|---|---|---|
| Enforced at | PostgreSQL engine | Next.js API handlers |
| Risk of bypass | None | A missing `tenantId` filter leaks data |
| Migration cost | High — all 98 tables, Prisma connection mode changes | Zero |
| SUPER_ADMIN support | Requires SET LOCAL or bypass policies | Native (no filter applied) |

**Decision (2026-03-05):** Application-level filtering is accepted as the security model.
DB-level RLS is parked as a future hardening item once the platform reaches production scale.

## Checklist — required patterns per route

Every API route that accesses tenant-scoped data MUST:

- [ ] Call `getApiSession()` and return 401 if no session
- [ ] Read `session.user.tenantId` (or `clientId` from URL params validated against session)
- [ ] Include `tenantId` in every Prisma `where` clause for multi-tenant tables
- [ ] Never trust client-supplied `tenantId` without verifying it matches `session.user.tenantId`
  (exception: `SUPER_ADMIN` may supply any `clientId` via URL)

## Tables that are NOT tenant-scoped (global/shared)

- `Competency` — global library, read-only for tenants
- `CompetencyIndicator` — global
- `Role` (admin-side) — global via `/api/admin/roles`
- `User` (SSO DB) — scoped by SSO, not by tenantId

## Known gaps (to address in future sprint)

1. **RLS absent** — all 98 tables have `rowsecurity = false`. If Prisma middleware is bypassed
   (e.g. raw SQL via `$queryRaw`), data can leak across tenants.
2. **`$queryRaw` usage** — audit any raw SQL calls to ensure they include tenant filters manually.
3. **URL param trust** — several routes accept `clientId` from URL path. Each must verify
   `session.user.tenantId === clientId` unless caller is `SUPER_ADMIN`.

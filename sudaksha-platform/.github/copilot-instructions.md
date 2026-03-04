# Sudaksha Platform - AI Agent Instructions

## Architecture Overview

**Monorepo Structure**: Turborepo with pnpm workspaces
- **Apps**: `portal` (assessment/portal app, port 3001) and `website` (marketing site, port 3000)
- **Packages**: `db-core` (identity/SSO schema), `db-assessments` (assessment schema), `sso-auth`, `types`, `ui` (shared components)

**Key Pattern**: Dual Prisma instances - `prismaCore` (identity, roles, users) and `prismaAssessments` (competencies, assessments, roles, questions). Use correct instance for domain-specific operations.

## Authentication & Authorization

**Multi-layered Auth**:
1. **Admin routes** (`/admin/*`): Cookie-based (`admin_session`), separate login at `/admin/login`
2. **Tenant routes** (`/assessments/org/[slug]/*`): NextAuth session with tenant isolation
3. **Personal workspace** (`/assessments/my/*`): NextAuth session required

**Token Structure**: Session contains `role`, `userType` (SUPER_ADMIN, TENANT, STUDENT, CLASS_TEACHER), `tenantSlug`, `tenantId`, `departmentId`, `teamId`

**Central Permission Authority**: `@/lib/permissions/role-competency-permissions.ts` is the **SINGLE SOURCE OF TRUTH** for all role permissions. Always use:
- `getRoleCompetencyPermissions(user)` - returns permission flags
- `buildRoleVisibilityFilter(user)` - Prisma filters for visibility
- `canUserModifyRole(user, role)` - role modification checks
- `normalizeUserRole(role)` - standardizes legacy role names (DEPT_HEAD→DEPARTMENT_HEAD, etc.)

Use `PermissionGate` component for UI gating, `hasPermission()` in API routes, `useRoleCompetencyPermissions()` hook for React components.

## Development Workflow

**Setup**:
```bash
pnpm install
pnpm dev          # Both apps (3000, 3001)
pnpm dev:portal   # Portal only
pnpm dev:website  # Website only
```

**Database**:
- `pnpm db:generate` - regenerate Prisma types
- `pnpm db:migrate` - create new migrations
- `pnpm db:studio` - visual database browser
- `pnpm db:seed` - seed data

**Key Scripts** (portal):
- `pnpm lint:fix` - fix linting issues
- `pnpm type-check` - TypeScript validation
- `pnpm test:e2e` - Playwright tests

## Code Patterns

**Next.js App Router + Server Components**: 
- Prefer server components. Use `"use client"` only for interactivity (hooks, event handlers)
- Server Actions in `app/actions/` or collocated with components
- API routes in `app/api/[resource]/route.ts`

**Data Layer**:
- Import from `@sudaksha/db-core` or `@sudaksha/db-assessments` packages
- Access via `prismaCore` or `prismaAssessments` (from app's `@/lib/prisma`)
- Use transactions for multi-step operations: `prisma.$transaction(async (tx) => {...})`

**Permission Patterns**:
- API routes: Import `getApiSession()` to get user context, pass to permission functions
- Middleware: Route guarding happens in `middleware.ts` (role/tenant checks)
- Components: Use `useSession()` hook + permission checks before rendering

**Import Path Aliases**:
- `@/*` resolves to `src/`, `app/`, `lib/`, `hooks/`, `types/` directories
- Keep imports relative in same directory, use alias for cross-module imports

## Critical Files to Know

- `middleware.ts` - Route protection (role checks, tenant isolation)
- `src/lib/auth-config.ts` - NextAuth configuration
- `src/lib/admin-auth.ts` - Admin session/login logic
- `src/lib/permissions/role-competency-permissions.ts` - **All permission logic**
- `src/lib/permissions/permissions.ts` - Basic permission type definitions
- `components/PermissionGate.tsx` - Client-side permission wrapper
- `hooks/useRoleCompetencyPermissions.ts` - Permission hook for components

## Testing & Validation

- Run `pnpm type-check` before commit to catch TypeScript errors
- Permission bugs often stem from using old role names—always normalize via `normalizeUserRole()`
- Session data changes require checking `middleware.ts` and relevant API routes
- E2E tests use Playwright: `pnpm test:e2e` or `pnpm test:e2e:ui`

## Common Gotchas

1. **Wrong Prisma instance**: Ensure you import `prismaAssessments` for assessment data, not `prismaCore`
2. **Permission logic in multiple places**: Update `role-competency-permissions.ts` ONCE and use its functions everywhere
3. **Tenant isolation**: Always include tenantSlug/tenantId filters in queries for multi-tenant safety
4. **Admin vs User Auth**: Admin routes use cookies, user routes use NextAuth—don't mix patterns
5. **Prisma types**: After schema changes, run `pnpm db:generate` to update TypeScript types

## Running Commands from Source

- Portal is `@sudaksha/portal` workspace
- Website is `@sudaksha/website` workspace
- Run root `pnpm dev` for all, or `pnpm dev --filter=@sudaksha/portal` for one app
- Turbo caches builds—use `turbo run dev --force` if cache is stale

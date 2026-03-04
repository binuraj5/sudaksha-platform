# SudAssess Platform

Monorepo for SudAssess multi-domain platform.

## Apps

- `apps/website` - Core website (sudaksha.com)
- `apps/portal` - Assessment portal (assessments.sudaksha.com)

## Packages

- `packages/db-core` - Shared Identity/SSO Prisma schema
- `packages/db-assessments` - Assessment-specific Prisma schema
- `packages/types` - Shared TypeScript types
- `packages/sso-auth` - Shared authentication logic
- `packages/ui` - Shared UI components

## Development

```bash
# Install dependencies
pnpm install

# Run both apps
pnpm dev

# Run website only
pnpm dev:website

# Run portal only
pnpm dev:portal
```

## URLs

- Website: http://localhost:3000
- Portal: http://localhost:3001

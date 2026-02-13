# Manual Migration Guide - Unified Multi-Tenant Architecture

## Overview

This guide provides step-by-step instructions to apply the unified multi-tenant architecture changes to your database.

## Prerequisites

- PostgreSQL server running (default: `localhost:5432`)
- Database `sudassessdb` exists
- Credentials configured in `.env` file

## Current Status

✅ Schema models defined in `prisma/schema.prisma`  
✅ RLS policies created in `prisma/rls_policies.sql`  
✅ Data migration script created in `prisma/migrate-to-unified-models.ts`  
⏸️ Database migration NOT yet applied (requires manual execution)

## Issue Encountered

The automated migration failed with:
- **Error**: `EPERM: operation not permitted` on Prisma Client generation
- **Likely Cause**: Dev server or another process is using Prisma Client files

## Solution Steps

### Step 1: Stop Running Processes

Stop any running development servers that might be using Prisma:

```powershell
# Stop Next.js dev server if running
# Press Ctrl+C in the terminal running `npm run dev`

# Or find and kill the process
Get-Process -Name node | Stop-Process -Force
```

### Step 2: Clean Prisma Client

Remove the existing Prisma Client to allow regeneration:

```powershell
# Navigate to project directory
cd c:\Users\Administrator\Documents\GitHub\SudakshaNWS

# Remove Prisma Client (if it exists)
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\@prisma\client -ErrorAction SilentlyContinue
```

### Step 3: Generate Prisma Client

Generate the Prisma Client with the new models:

```powershell
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client (X.X.X) to .\node_modules\@prisma\client
```

### Step 4: Create Database Migration

Create the migration file and apply it to the database:

```powershell
npx prisma migrate dev --name add_unified_multitenant_models
```

**Expected Output:**
```
✔ Prisma schema loaded from prisma\schema.prisma
✔ Datasource "db": PostgreSQL database "sudassessdb" at "localhost:5432"

The following migration(s) have been created and applied:

migrations/
  └─ 20260201XXXXXX_add_unified_multitenant_models/
    └─ migration.sql

✔ Generated Prisma Client (X.X.X) to .\node_modules\@prisma\client
```

This will:
- Create migration file in `prisma/migrations/`
- Create new tables: `Tenant`, `Member`, `OrganizationUnit`, `Activity`, etc.
- Create enums: `TenantType`, `MemberType`, `UnitType`, `ActivityType`, etc.
- Keep existing tables intact (`Client`, `User`, `Department`, `Project`)

### Step 5: Verify Database Tables

Check that the new tables were created:

```powershell
# Using psql (if installed)
psql -U postgres -d sudassessdb -c "\dt"

# Or using Prisma Studio
npx prisma studio
```

Look for these new tables:
- `Tenant`
- `TenantSettings`
- `Member`
- `OrganizationUnit`
- `Activity`
- `ActivityMember`
- `ActivityOrgUnit`
- `MemberAssessment`
- `ActivityAssessment`

### Step 6: Apply RLS Policies (Optional but Recommended)

Apply Row-Level Security policies for tenant isolation:

```powershell
# Using psql
psql -U postgres -d sudassessdb -f prisma\rls_policies.sql
```

**If psql is not installed**, you can:

1. Copy the contents of `prisma/rls_policies.sql`
2. Use a PostgreSQL client (pgAdmin, DBeaver, etc.)
3. Execute the SQL manually

**Expected Output:**
```
ALTER TABLE
ALTER TABLE
CREATE FUNCTION
CREATE POLICY
... (multiple statements)
```

### Step 7: Run Data Migration (Optional)

If you have existing data in `Client`, `User`, `Department`, and `Project` tables, migrate it:

```powershell
npx ts-node prisma/migrate-to-unified-models.ts
```

**Expected Output:**
```
🚀 Starting data migration to unified models...

📦 Step 1: Migrating Client → Tenant...
  ✅ Migrated: Company A → Tenant [xxx]
  ✅ Migrated: Company B → Tenant [yyy]

👤 Step 2: Migrating User → Member...
  ✅ Migrated: John Doe → Member [xxx]
  ✅ Migrated: Jane Smith → Member [yyy]

... (continues for all steps)

✨ MIGRATION COMPLETE!
```

### Step 8: Restart Development Server

Start your Next.js development server:

```powershell
npm run dev
```

## Troubleshooting

### Issue: "Environment variable not found: DATABASE_URL"

**Solution:**
1. Check `.env` file exists in project root
2. Verify `DATABASE_URL` is set correctly
3. Restart your shell/terminal

### Issue: "Can't reach database server at localhost:5432"

**Solution:**
1. Verify PostgreSQL is running:
   ```powershell
   Get-Service -Name postgresql*
   ```
2. Start PostgreSQL if stopped:
   ```powershell
   Start-Service postgresql-x64-15  # Adjust service name
   ```
3. Check `DATABASE_URL` in `.env` has correct credentials

### Issue: "Migration failed: relation already exists"

**Solution:**
- Tables might already exist from a previous attempt
- Run: `npx prisma migrate resolve --applied add_unified_multitenant_models`
- Or drop and recreate the tables (⚠️ will lose data)

### Issue: "EPERM: operation not permitted" persists

**Solution:**
1. Close VS Code
2. Stop all Node.js processes:
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```
3. Reopen VS Code
4. Try again

### Issue: TypeScript errors after migration

**Solution:**
1. Regenerate Prisma Client: `npx prisma generate`
2. Restart TypeScript server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
3. If errors persist, restart VS Code

## Verification

After migration, verify everything works:

### 1. Check Prisma Studio

```powershell
npx prisma studio
```

You should see:
- New models: `Tenant`, `Member`, `OrganizationUnit`, `Activity`
- Old models still present: `Client`, `User`, `Department`, `Project`

### 2. Test Creating a Tenant

Create a test file `test-tenant.ts`:

```typescript
import { PrismaClient, TenantType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Test Corporation',
      slug: 'test-corp',
      type: TenantType.CORPORATE,
      email: 'admin@testcorp.com',
      createdBy: 'system',
    },
  });
  
  console.log('Created tenant:', tenant);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```powershell
npx ts-node test-tenant.ts
```

### 3. Test RLS Policies (if applied)

```sql
-- In psql or your SQL client
SET app.current_tenant_id = 'tenant_id_here';
SELECT * FROM "Member";  -- Should only return members of that tenant
```

## Rollback Plan

If you need to rollback the migration:

```powershell
# Revert the last migration
npx prisma migrate resolve --rolled-back add_unified_multitenant_models

# Or manually drop the tables
psql -U postgres -d sudassessdb -c "DROP TABLE IF EXISTS \"Tenant\" CASCADE;"
# ... repeat for other new tables
```

## Next Steps After Migration

1. ✅ **Update API Routes**: Create endpoints for `Tenant`, `Member`, etc.
2. ✅ **Update Authentication**: Modify NextAuth to use `Member` model
3. ✅ **Update Frontend**: Adapt components to use new models
4. ✅ **Set Tenant Context**: Implement middleware to set `app.current_tenant_id`
5. ✅ **Test Multi-Tenant Isolation**: Verify RLS policies work correctly
6. ✅ **Gradual Migration**: Plan to phase out legacy `Client`, `User` models

## Support

If you encounter issues not covered here:

1. Check Prisma logs: Look for detailed error messages in terminal
2. Review schema: Run `npx prisma validate` to check for schema errors
3. Check database: Verify PostgreSQL is accessible and has correct permissions
4. Consult documentation: See `walkthrough.md` for detailed architecture info

---

**Last Updated**: 2026-02-01  
**Status**: Ready for manual execution

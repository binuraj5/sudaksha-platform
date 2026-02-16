# Row-Level Security (RLS) Application Guide

## Overview

This guide explains how to apply the Row-Level Security policies to your PostgreSQL database for tenant isolation.

## Current Status

✅ **Database Migration**: All tables created successfully  
⏸️ **RLS Policies**: Ready to apply but psql command not available in PATH

## Why Apply RLS Policies?

Row-Level Security ensures that:
- **Tenant A** can ONLY see data belonging to Tenant A
- **Tenant B** can ONLY see data belonging to Tenant B
- **Super Admins** can see all data across all tenants
- Data isolation happens automatically at the database level

## Method 1: Using pgAdmin (Recommended)

### Step 1: Open pgAdmin

1. Launch pgAdmin 4
2. Connect to your PostgreSQL server (`localhost:5432`)
3. Navigate to: **Servers** → **PostgreSQL** → **Databases** → **sudassessdb**

### Step 2: Open Query Tool

1. Right-click on **sudassessdb**
2. Select **Query Tool**

### Step 3: Execute RLS Policies

1. Open the file: `c:\Users\Administrator\Documents\GitHub\SudakshaNWS\prisma\rls_policies.sql`
2. Copy the **entire contents**
3. Paste into the pgAdmin Query Tool
4. Click **Execute** (or press F5)

### Step 4: Verify

You should see output like:
```
ALTER TABLE
ALTER TABLE
CREATE FUNCTION
CREATE POLICY
... (multiple statements)
Query returned successfully
```

## Method 2: Using psql (When Available)

If you add PostgreSQL's bin directory to your PATH:

```powershell
# Set password as environment variable
$env:PGPASSWORD='Admin@123'

# Execute the RLS policies
psql -U postgres -d sudassessdb -f prisma\rls_policies.sql
```

## Method 3: Using DBeaver or Other SQL Client

1. Connect to your database:
   - **Host**: localhost
   - **Port**: 5432
   - **Database**: sudassessdb
   - **Username**: postgres
   - **Password**: Admin@123

2. Open a new SQL Editor
3. Paste the contents of `prisma\rls_policies.sql`
4. Execute the script

## What the RLS Policies Do

The SQL script will:

### 1. Enable RLS on Tables
```sql
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationUnit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Activity" ENABLE ROW LEVEL SECURITY;
-- ... and 4 more tables
```

### 2. Create Helper Functions
```sql
-- Get current tenant ID from session
CREATE FUNCTION current_tenant_id() RETURNS TEXT ...

-- Check if user is super admin
CREATE FUNCTION is_super_admin() RETURNS BOOLEAN ...
```

### 3. Create Isolation Policies
```sql
-- Example: Members can only see other members in their tenant
CREATE POLICY member_isolation_policy ON "Member"
  FOR ALL
  USING (
    is_super_admin() OR
    tenantId = current_tenant_id()
  );
```

## Using RLS in Your Application

After applying RLS policies, use this pattern in your API routes:

```typescript
// pages/api/members.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Get tenant ID from authenticated user's session
  const tenantId = req.session.user.tenantId;
  const isSuperAdmin = req.session.user.role === 'SUPER_ADMIN';
  
  // Set tenant context at the start of the request
  await prisma.$executeRaw`SET app.current_tenant_id = ${tenantId}`;
  await prisma.$executeRaw`SET app.is_super_admin = ${isSuperAdmin}`;
  
  try {
    // This query will automatically filter by tenant!
    const members = await prisma.member.findMany();
    
    // Only members from the current tenant are returned
    res.json(members);
    
  } finally {
    // Clean up session variables
    await prisma.$executeRaw`RESET app.current_tenant_id`;
    await prisma.$executeRaw`RESET app.is_super_admin`;
  }
}
```

## Testing RLS Policies

After applying, test the isolation:

### Test 1: Create Two Tenants

```sql
INSERT INTO "Tenant" (id, name, slug, email, "createdBy") VALUES
  ('tenant-1', 'Company A', 'company-a', 'admin@company-a.com', 'system'),
  ('tenant-2', 'Company B', 'company-b', 'admin@company-b.com', 'system');
```

### Test 2: Create Members for Each Tenant

```sql
INSERT INTO "Member" (id, "tenantId", name, email, password) VALUES
  ('mem-1', 'tenant-1', 'Alice', 'alice@company-a.com', 'hash1'),
  ('mem-2', 'tenant-1', 'Bob', 'bob@company-a.com', 'hash2'),
  ('mem-3', 'tenant-2', 'Charlie', 'charlie@company-b.com', 'hash3');
```

### Test 3: Verify Isolation

```sql
-- Set context to Tenant 1
SET app.current_tenant_id = 'tenant-1';
SET app.is_super_admin = FALSE;

-- Should ONLY return Alice and Bob
SELECT * FROM "Member";

-- Reset and set context to Tenant 2
SET app.current_tenant_id = 'tenant-2';

-- Should ONLY return Charlie
SELECT * FROM "Member";

-- Reset
RESET app.current_tenant_id;
RESET app.is_super_admin;
```

## Troubleshooting

### Policy Already Exists

If you see errors like "policy already exists", it's safe to ignore - it means the policy was already applied.

### Permission Denied

If you get "permission denied" errors:
1. Ensure you're connected as the `postgres` superuser
2. Or grant yourself superuser privileges

### RLS Not Working

If data isolation isn't working:
1. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'Member';`
2. Check if policies exist: `SELECT * FROM pg_policies WHERE tablename = 'Member';`
3. Ensure you're setting `app.current_tenant_id` before each query

## Verification Checklist

After applying RLS policies, verify:

- [ ] All 8 tables have `rowsecurity = TRUE`
- [ ] Helper functions `current_tenant_id()` and `is_super_admin()` exist
- [ ] Policies exist for all tenant-scoped tables
- [ ] Test queries with different tenant contexts return filtered results
- [ ] Super admin context (`is_super_admin = TRUE`) returns all data

## Next Steps

Once RLS is applied:

1. ✅ **Update Middleware**: Add tenant context setting to all API routes
2. ✅ **Update Authentication**: Store `tenantId` in user session
3. ✅ **Test Isolation**: Verify multi-tenant data separation works
4. ✅ **Document Usage**: Add RLS usage patterns to your API documentation

---

**File Location**: `c:\Users\Administrator\Documents\GitHub\SudakshaNWS\prisma\rls_policies.sql`  
**Database**: `sudassessdb`  
**User**: `postgres`  
**Password**: `Admin@123`

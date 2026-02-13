-- ============================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant Data Isolation
-- ============================================

-- This script implements PostgreSQL Row-Level Security policies
-- to enforce tenant-based data isolation in the unified architecture.

-- ============================================
-- STEP 0: Transfer Table Ownership (if needed)
-- ============================================
-- If you get "must be owner of table" errors, uncomment these lines:
-- Replace 'your_username' with your actual database username

-- ALTER TABLE "Tenant" OWNER TO postgres;
-- ALTER TABLE "TenantSettings" OWNER TO postgres;
-- ALTER TABLE "Member" OWNER TO postgres;
-- ALTER TABLE "OrganizationUnit" OWNER TO postgres;
-- ALTER TABLE "Activity" OWNER TO postgres;
-- ALTER TABLE "ActivityMember" OWNER TO postgres;
-- ALTER TABLE "ActivityOrgUnit" OWNER TO postgres;
-- ALTER TABLE "MemberAssessment" OWNER TO postgres;
-- ALTER TABLE "ActivityAssessment" OWNER TO postgres;

-- ============================================
-- STEP 1: Enable RLS on Tenant-Scoped Tables
-- ============================================

-- Enable RLS on all tables that have tenantId
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationUnit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityOrgUnit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MemberAssessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityAssessment" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Create Helper Function
-- ============================================

-- Function to get current tenant ID from session
-- This should be set by the application at the start of each request
CREATE OR REPLACE FUNCTION current_tenant_id() 
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', TRUE), '')::TEXT;
$$ LANGUAGE SQL STABLE;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin() 
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    current_setting('app.is_super_admin', TRUE)::BOOLEAN,
    FALSE
  );
$$ LANGUAGE SQL STABLE;

-- ============================================
-- STEP 3: Tenant Table Policies
-- ============================================

-- Super admins can see all tenants
-- Tenant admins can only see their own tenant
CREATE POLICY tenant_isolation_policy ON "Tenant"
  FOR ALL
  USING (
    is_super_admin() OR 
    id = current_tenant_id()
  );

-- ============================================
-- STEP 4: Member Table Policies
-- ============================================

-- Members can only see other members in their tenant
-- B2C users (tenantId IS NULL) can only see themselves
CREATE POLICY member_isolation_policy ON "Member"
  FOR ALL
  USING (
    is_super_admin() OR
    ("tenantId" IS NOT NULL AND "tenantId" = current_tenant_id()) OR
    ("tenantId" IS NULL AND id = current_setting('app.current_user_id', TRUE)::TEXT)
  );

-- ============================================
-- STEP 5: OrganizationUnit Table Policies
-- ============================================

-- Organization units are tenant-scoped
CREATE POLICY org_unit_isolation_policy ON "OrganizationUnit"
  FOR ALL
  USING (
    is_super_admin() OR
    "tenantId" = current_tenant_id()
  );

-- ============================================
-- STEP 6: Activity Table Policies
-- ============================================

-- Activities are tenant-scoped
CREATE POLICY activity_isolation_policy ON "Activity"
  FOR ALL
  USING (
    is_super_admin() OR
    "tenantId" = current_tenant_id()
  );

-- ============================================
-- STEP 7: ActivityMember Table Policies
-- ============================================

-- Activity members are visible if:
-- - User is super admin, OR
-- - The activity belongs to the current tenant
CREATE POLICY activity_member_isolation_policy ON "ActivityMember"
  FOR ALL
  USING (
    is_super_admin() OR
    "activityId" IN (
      SELECT id FROM "Activity" WHERE "tenantId" = current_tenant_id()
    )
  );

-- ============================================
-- STEP 8: ActivityOrgUnit Table Policies
-- ============================================

CREATE POLICY activity_org_unit_isolation_policy ON "ActivityOrgUnit"
  FOR ALL
  USING (
    is_super_admin() OR
    "activityId" IN (
      SELECT id FROM "Activity" WHERE "tenantId" = current_tenant_id()
    )
  );

-- ============================================
-- STEP 9: MemberAssessment Table Policies
-- ============================================

-- Member assessments are visible if:
-- - User is super admin, OR
-- - The member belongs to the current tenant
CREATE POLICY member_assessment_isolation_policy ON "MemberAssessment"
  FOR ALL
  USING (
    is_super_admin() OR
    "memberId" IN (
      SELECT id FROM "Member" WHERE "tenantId" = current_tenant_id()
    )
  );

-- ============================================
-- STEP 10: ActivityAssessment Table Policies
-- ============================================

CREATE POLICY activity_assessment_isolation_policy ON "ActivityAssessment"
  FOR ALL
  USING (
    is_super_admin() OR
    "activityId" IN (
      SELECT id FROM "Activity" WHERE "tenantId" = current_tenant_id()
    )
  );

-- ============================================
-- STEP 11: Grant Necessary Permissions
-- ============================================

-- Grant usage on the schema to application user
-- Replace 'app_user' with your actual database user
-- GRANT USAGE ON SCHEMA public TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- ============================================
-- USAGE EXAMPLE (In Application Code)
-- ============================================

/*
// At the start of each authenticated request:
await prisma.$executeRaw`SET app.current_tenant_id = ${tenantId}`;
await prisma.$executeRaw`SET app.is_super_admin = ${isSuperAdmin}`;
await prisma.$executeRaw`SET app.current_user_id = ${userId}`;

// Now all queries will automatically filter by tenant
const members = await prisma.member.findMany(); // Only returns members in current tenant

// At the end of the request (or use transaction):
await prisma.$executeRaw`RESET app.current_tenant_id`;
await prisma.$executeRaw`RESET app.is_super_admin`;
await prisma.$executeRaw`RESET app.current_user_id`;
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

/*
-- Set tenant context (test)
SET app.current_tenant_id = 'tenant_123';
SET app.is_super_admin = FALSE;

-- This should only return members from tenant_123
SELECT * FROM "Member";

-- Reset context
RESET app.current_tenant_id;
RESET app.is_super_admin;
*/

-- ============================================
-- NOTES
-- ============================================

/*
1. RLS policies are ADDITIVE - multiple policies combine with OR logic
2. Policies apply to all operations (SELECT, INSERT, UPDATE, DELETE) unless specified
3. For USING clause: determines which rows are visible
4. For WITH CHECK clause: determines which rows can be inserted/updated
5. Super admin bypass: Set app.is_super_admin = TRUE to see all data
6. Performance: Add indexes on tenantId columns for optimal RLS performance
7. Testing: Always test RLS policies in a staging environment first
8. Migration: Apply this after running: npx prisma migrate dev
*/

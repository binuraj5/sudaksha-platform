-- Ensure MasterDepartment exists (schema has it but no prior migration created it)
CREATE TABLE IF NOT EXISTS "MasterDepartment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterDepartment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MasterDepartment_name_key" ON "MasterDepartment"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "MasterDepartment_slug_key" ON "MasterDepartment"("slug");

-- Add department and industry fields to RoleAssignmentRequest (align with schema)
ALTER TABLE "RoleAssignmentRequest" ADD COLUMN IF NOT EXISTS "roleCreatedAt" TIMESTAMP(3);
ALTER TABLE "RoleAssignmentRequest" ADD COLUMN IF NOT EXISTS "departmentId" TEXT;
ALTER TABLE "RoleAssignmentRequest" ADD COLUMN IF NOT EXISTS "departmentOtherText" TEXT;
ALTER TABLE "RoleAssignmentRequest" ADD COLUMN IF NOT EXISTS "industryId" TEXT;
ALTER TABLE "RoleAssignmentRequest" ADD COLUMN IF NOT EXISTS "industryOtherText" TEXT;

-- Foreign keys (only if constraint does not exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RoleAssignmentRequest_departmentId_fkey') THEN
    ALTER TABLE "RoleAssignmentRequest" ADD CONSTRAINT "RoleAssignmentRequest_departmentId_fkey"
      FOREIGN KEY ("departmentId") REFERENCES "MasterDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RoleAssignmentRequest_industryId_fkey') THEN
    ALTER TABLE "RoleAssignmentRequest" ADD CONSTRAINT "RoleAssignmentRequest_industryId_fkey"
      FOREIGN KEY ("industryId") REFERENCES "MasterIndustry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

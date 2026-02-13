-- AlterTable: Add enrollment_number and employee_id to Member (Enhancement #4 - Unique Identifiers)
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "enrollmentNumber" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "employeeId" TEXT;

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Member_enrollmentNumber_key" ON "Member"("enrollmentNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Member_employeeId_key" ON "Member"("employeeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Member_enrollmentNumber_idx" ON "Member"("enrollmentNumber");
CREATE INDEX IF NOT EXISTS "Member_employeeId_idx" ON "Member"("employeeId");

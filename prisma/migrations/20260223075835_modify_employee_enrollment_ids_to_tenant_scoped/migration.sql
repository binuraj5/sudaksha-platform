/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,enrollmentNumber]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,employeeId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Member_employeeId_key";

-- DropIndex
DROP INDEX "Member_enrollmentNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "Member_tenantId_enrollmentNumber_key" ON "Member"("tenantId", "enrollmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Member_tenantId_employeeId_key" ON "Member"("tenantId", "employeeId");

/*
  Warnings:

  - A unique constraint covering the columns `[enrollmentNumber]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Member_enrollmentNumber_key" ON "Member"("enrollmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Member_employeeId_key" ON "Member"("employeeId");

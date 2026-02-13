-- CreateTable
CREATE TABLE "RoleAssignmentRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requestedRoleName" TEXT NOT NULL,
    "description" TEXT,
    "totalExperienceYears" INTEGER NOT NULL,
    "context" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedRoleId" TEXT,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleAssignmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoleAssignmentRequest_memberId_idx" ON "RoleAssignmentRequest"("memberId");

-- CreateIndex
CREATE INDEX "RoleAssignmentRequest_tenantId_idx" ON "RoleAssignmentRequest"("tenantId");

-- CreateIndex
CREATE INDEX "RoleAssignmentRequest_status_idx" ON "RoleAssignmentRequest"("status");

-- AddForeignKey
ALTER TABLE "RoleAssignmentRequest" ADD CONSTRAINT "RoleAssignmentRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignmentRequest" ADD CONSTRAINT "RoleAssignmentRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignmentRequest" ADD CONSTRAINT "RoleAssignmentRequest_assignedRoleId_fkey" FOREIGN KEY ("assignedRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "aspirationalRoleId" TEXT,
ADD COLUMN     "careerFormData" JSONB,
ADD COLUMN     "currentRoleId" TEXT,
ADD COLUMN     "previousRoles" JSONB,
ADD COLUMN     "selfAssignedCompetencies" JSONB;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_currentRoleId_fkey" FOREIGN KEY ("currentRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_aspirationalRoleId_fkey" FOREIGN KEY ("aspirationalRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

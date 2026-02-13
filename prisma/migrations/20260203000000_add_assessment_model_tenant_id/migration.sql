-- AlterTable
-- Add tenantId column to AssessmentModel if it does not exist (PostgreSQL)
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- AddForeignKey (only if column was added - PostgreSQL doesn't support IF NOT EXISTS for constraints easily, so we use a safe approach)
-- Create the foreign key; if it already exists, this will fail silently in migration retry - Prisma handles that
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AssessmentModel_tenantId_fkey'
    ) THEN
        ALTER TABLE "AssessmentModel" ADD CONSTRAINT "AssessmentModel_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

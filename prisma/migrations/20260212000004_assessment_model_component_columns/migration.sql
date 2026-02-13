-- Add missing AssessmentModelComponent columns to align with Prisma schema
-- DB has componentId/weightage; Prisma schema uses competencyId/weight/indicatorIds

-- competencyId (nullable - for role-based creation flow)
ALTER TABLE "AssessmentModelComponent" ADD COLUMN IF NOT EXISTS "competencyId" TEXT;

-- indicatorIds (array of UUIDs)
ALTER TABLE "AssessmentModelComponent" ADD COLUMN IF NOT EXISTS "indicatorIds" TEXT[] DEFAULT '{}';

-- targetLevel
ALTER TABLE "AssessmentModelComponent" ADD COLUMN IF NOT EXISTS "targetLevel" "ProficiencyLevel";

-- weight (alias for weightage when using competency-based flow)
ALTER TABLE "AssessmentModelComponent" ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION DEFAULT 1.0;

-- Make componentId nullable (for competency-based creation without AssessmentComponent)
ALTER TABLE "AssessmentModelComponent" ALTER COLUMN "componentId" DROP NOT NULL;

-- Add FK for competencyId if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AssessmentModelComponent_competencyId_fkey'
  ) THEN
    ALTER TABLE "AssessmentModelComponent" ADD CONSTRAINT "AssessmentModelComponent_competencyId_fkey"
      FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Index for competencyId
CREATE INDEX IF NOT EXISTS "AssessmentModelComponent_competencyId_idx" ON "AssessmentModelComponent"("competencyId");

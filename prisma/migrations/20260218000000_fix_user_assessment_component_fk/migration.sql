-- Fix UserAssessmentComponent_componentId_fkey to reference AssessmentModelComponent (not AssessmentComponent).
-- Some databases may still have the FK pointing at AssessmentComponent, causing P2003 when starting a section.

-- Remove orphaned rows whose componentId does not exist in AssessmentModelComponent (e.g. old AssessmentComponent ids)
DELETE FROM "UserAssessmentComponent"
WHERE "componentId" NOT IN (SELECT "id" FROM "AssessmentModelComponent");

-- Drop existing FK if present (may reference AssessmentComponent or already AssessmentModelComponent)
ALTER TABLE "UserAssessmentComponent" DROP CONSTRAINT IF EXISTS "UserAssessmentComponent_componentId_fkey";

-- Add FK to AssessmentModelComponent so runner start succeeds
ALTER TABLE "UserAssessmentComponent" ADD CONSTRAINT "UserAssessmentComponent_componentId_fkey"
  FOREIGN KEY ("componentId") REFERENCES "AssessmentModelComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Fix ComponentQuestion FK: reference AssessmentModelComponent instead of AssessmentComponent
-- The wizard creates AssessmentModelComponent records; ComponentQuestion must reference them.
-- Old FK: ComponentQuestion.componentId -> AssessmentComponent.id
-- New FK: ComponentQuestion.componentId -> AssessmentModelComponent.id

-- Drop the old foreign key
ALTER TABLE "ComponentQuestion" DROP CONSTRAINT IF EXISTS "ComponentQuestion_componentId_fkey";

-- Remove any ComponentQuestion rows whose componentId does not exist in AssessmentModelComponent
-- (these would reference AssessmentComponent and violate the new FK)
DELETE FROM "ComponentQuestion"
WHERE "componentId" NOT IN (SELECT "id" FROM "AssessmentModelComponent");

-- Add the new foreign key referencing AssessmentModelComponent
ALTER TABLE "ComponentQuestion" ADD CONSTRAINT "ComponentQuestion_componentId_fkey"
  FOREIGN KEY ("componentId") REFERENCES "AssessmentModelComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

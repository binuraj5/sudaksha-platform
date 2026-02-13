-- Add code column to AssessmentModel (required for Create Assessment flow)
-- The column was in Prisma schema but missing from the database

-- Add column as nullable first (for existing rows)
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "code" TEXT;

-- Backfill existing rows with unique codes (ASM001, ASM002, ...)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, id) AS rn
  FROM "AssessmentModel"
)
UPDATE "AssessmentModel" m
SET "code" = 'ASM' || LPAD(n.rn::text, 3, '0')
FROM numbered n
WHERE m.id = n.id
  AND (m."code" IS NULL OR m."code" = '');

-- Ensure no nulls remain (for empty table)
UPDATE "AssessmentModel" SET "code" = 'ASM001' WHERE "code" IS NULL OR "code" = '';

-- Make NOT NULL
ALTER TABLE "AssessmentModel" ALTER COLUMN "code" SET NOT NULL;

-- Add unique constraint
DROP INDEX IF EXISTS "AssessmentModel_code_key";
CREATE UNIQUE INDEX "AssessmentModel_code_key" ON "AssessmentModel"("code");

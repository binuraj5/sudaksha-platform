-- Alter AssessmentModel.visibility from ModelVisibility enum to TEXT
-- to match Prisma schema (String) and support PRIVATE | ORGANIZATION | GLOBAL values
ALTER TABLE "AssessmentModel" ALTER COLUMN "visibility" TYPE TEXT USING "visibility"::text;
ALTER TABLE "AssessmentModel" ALTER COLUMN "visibility" SET DEFAULT 'PRIVATE';
ALTER TABLE "AssessmentModel" ALTER COLUMN "visibility" SET NOT NULL;

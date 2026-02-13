-- Add defaults for legacy AssessmentModel columns (NOT NULL, no default)
-- Prisma schema uses new columns; DB still has legacy columns

-- totalDuration: default 60 (minutes) - legacy column, required on insert
ALTER TABLE "AssessmentModel" ALTER COLUMN "totalDuration" SET DEFAULT 60;

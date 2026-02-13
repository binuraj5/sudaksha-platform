-- Add missing AssessmentModel columns to align with Prisma schema
-- Schema evolved but migrations were not applied
-- Enum values (DRAFT, PUBLISHED, etc.) added in previous migration

-- passingScore (0-100 percentage)
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "passingScore" INTEGER DEFAULT 60;

-- durationMinutes
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "durationMinutes" INTEGER;

-- maxAttempts
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "maxAttempts" INTEGER NOT NULL DEFAULT 3;

-- randomizeQuestions
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false;

-- showResultsImmediately
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "showResultsImmediately" BOOLEAN NOT NULL DEFAULT true;

-- status (AssessmentStatus: DRAFT, PUBLISHED, etc.)
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "status" "AssessmentStatus" DEFAULT 'DRAFT';

-- isTemplate
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "isTemplate" BOOLEAN NOT NULL DEFAULT false;

-- metadata (JSON)
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- publishedAt
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);

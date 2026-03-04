-- Add level field to CompetencyDevelopmentRequest
ALTER TABLE "CompetencyDevelopmentRequest" ADD COLUMN IF NOT EXISTS "level" TEXT DEFAULT 'JUNIOR';

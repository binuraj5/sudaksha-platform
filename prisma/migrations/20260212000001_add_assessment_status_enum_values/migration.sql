-- Add DRAFT, PUBLISHED, ARCHIVED, ACTIVE to AssessmentStatus enum
-- Must be in separate migration so values are committed before use
ALTER TYPE "AssessmentStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "AssessmentStatus" ADD VALUE IF NOT EXISTS 'PUBLISHED';
ALTER TYPE "AssessmentStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';
ALTER TYPE "AssessmentStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';

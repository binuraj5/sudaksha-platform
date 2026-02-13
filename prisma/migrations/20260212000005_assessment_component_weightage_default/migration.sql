-- Add default for weightage (legacy column, NOT NULL, no default)
ALTER TABLE "AssessmentModelComponent" ALTER COLUMN "weightage" SET DEFAULT 1.0;

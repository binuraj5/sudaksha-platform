-- Add linkedIndicators and explanation to ComponentQuestion (align with Prisma schema)
ALTER TABLE "ComponentQuestion" ADD COLUMN IF NOT EXISTS "linkedIndicators" TEXT[] DEFAULT '{}';
ALTER TABLE "ComponentQuestion" ADD COLUMN IF NOT EXISTS "explanation" TEXT;

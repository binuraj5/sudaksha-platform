-- Add metadata column to ComponentQuestion (align with Prisma schema)
ALTER TABLE "ComponentQuestion" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

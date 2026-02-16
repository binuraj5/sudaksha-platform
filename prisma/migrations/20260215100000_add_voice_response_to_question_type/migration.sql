-- Add VOICE_RESPONSE to QuestionType enum (present in Prisma schema, missing from DB)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'QuestionType' AND e.enumlabel = 'VOICE_RESPONSE'
    ) THEN
        ALTER TYPE "QuestionType" ADD VALUE 'VOICE_RESPONSE';
    END IF;
END
$$;

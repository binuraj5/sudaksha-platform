-- Add facultyType to Member for institution faculty (permanent, adjunct, visiting)
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "facultyType" TEXT;

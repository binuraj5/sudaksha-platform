-- AlterTable: Add has_graduated and graduation_date to Member (Enhancement #2 - Student Level Restrictions)
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "hasGraduated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "graduationDate" DATE;

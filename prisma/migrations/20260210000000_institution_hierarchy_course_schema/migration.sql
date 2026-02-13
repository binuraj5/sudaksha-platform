-- Institution Hierarchy Phase 1: Course entity and ActivityOrgUnit relationship
-- Add COURSE to ActivityType enum
ALTER TYPE "ActivityType" ADD VALUE 'COURSE';

-- CreateEnum CourseDivision
CREATE TYPE "CourseDivision" AS ENUM ('SEMESTER', 'YEAR', 'BOTH');

-- Add course-specific and soft-delete fields to Activity
ALTER TABLE "Activity" ADD COLUMN "yearBegin" INTEGER;
ALTER TABLE "Activity" ADD COLUMN "yearEnd" INTEGER;
ALTER TABLE "Activity" ADD COLUMN "division" "CourseDivision";
ALTER TABLE "Activity" ADD COLUMN "semesterCount" INTEGER;
ALTER TABLE "Activity" ADD COLUMN "yearCount" INTEGER;
ALTER TABLE "Activity" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Activity" ADD COLUMN "deletedBy" TEXT;

-- Add relationship column to ActivityOrgUnit
ALTER TABLE "ActivityOrgUnit" ADD COLUMN "relationship" TEXT;

-- Add CLASS_TEACHER to MemberRole enum
ALTER TYPE "MemberRole" ADD VALUE 'CLASS_TEACHER';

-- Index for ActivityOrgUnit relationship queries
CREATE INDEX "ActivityOrgUnit_activityId_relationship_idx" ON "ActivityOrgUnit"("activityId", "relationship");

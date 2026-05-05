-- SEPL/INT/2026/IMPL-STEPS-01 Steps 3-5
-- Additive-only migration: CREATE tables + ALTER ADD COLUMN only.
-- No DROP statements. Safe to apply against shared database.

-- AlterTable: MemberAssessment — add isBaseline and baselineSessionId
ALTER TABLE "MemberAssessment" ADD COLUMN IF NOT EXISTS "baselineSessionId" TEXT;
ALTER TABLE "MemberAssessment" ADD COLUMN IF NOT EXISTS "isBaseline" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: CompetencyDevelopmentRequest — add level and competencyId
ALTER TABLE "CompetencyDevelopmentRequest" ADD COLUMN IF NOT EXISTS "competencyId" TEXT;
ALTER TABLE "CompetencyDevelopmentRequest" ADD COLUMN IF NOT EXISTS "level" TEXT NOT NULL DEFAULT 'JUNIOR';

-- CreateTable: CompetencyScore
CREATE TABLE IF NOT EXISTS "CompetencyScore" (
    "id" TEXT NOT NULL,
    "memberAssessmentId" TEXT NOT NULL,
    "competencyCode" TEXT NOT NULL,
    "competencyId" TEXT,
    "assessmentType" TEXT NOT NULL DEFAULT 'RBCA',
    "layerScores" JSONB NOT NULL DEFAULT '{}',
    "compositeRawScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "normalisedScore" DOUBLE PRECISION,
    "proficiencyLevel" INTEGER NOT NULL DEFAULT 1,
    "percentileRank" INTEGER,
    "biasFlag" TEXT,
    "cohortType" TEXT NOT NULL DEFAULT 'PROFESSIONAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AssessmentDelta
CREATE TABLE IF NOT EXISTS "AssessmentDelta" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "baselineAssessmentId" TEXT NOT NULL,
    "followupAssessmentId" TEXT NOT NULL,
    "deltaScores" JSONB NOT NULL DEFAULT '{}',
    "overallDelta" DOUBLE PRECISION,
    "attributedActivityId" TEXT,
    "assessmentType" TEXT NOT NULL DEFAULT 'RBCA',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentDelta_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CareerFitScore
CREATE TABLE IF NOT EXISTS "CareerFitScore" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "memberAssessmentId" TEXT NOT NULL,
    "fitScore" DOUBLE PRECISION NOT NULL,
    "gapAnalysis" JSONB NOT NULL DEFAULT '{}',
    "instrumentsUsed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rank" INTEGER,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerFitScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: CompetencyScore
CREATE INDEX IF NOT EXISTS "CompetencyScore_memberAssessmentId_idx" ON "CompetencyScore"("memberAssessmentId");
CREATE INDEX IF NOT EXISTS "CompetencyScore_competencyCode_idx" ON "CompetencyScore"("competencyCode");
CREATE INDEX IF NOT EXISTS "CompetencyScore_assessmentType_idx" ON "CompetencyScore"("assessmentType");
CREATE UNIQUE INDEX IF NOT EXISTS "CompetencyScore_memberAssessmentId_competencyCode_assessmen_key" ON "CompetencyScore"("memberAssessmentId", "competencyCode", "assessmentType");

-- CreateIndex: AssessmentDelta
CREATE INDEX IF NOT EXISTS "AssessmentDelta_memberId_idx" ON "AssessmentDelta"("memberId");
CREATE INDEX IF NOT EXISTS "AssessmentDelta_baselineAssessmentId_idx" ON "AssessmentDelta"("baselineAssessmentId");

-- CreateIndex: CareerFitScore
CREATE INDEX IF NOT EXISTS "CareerFitScore_memberId_idx" ON "CareerFitScore"("memberId");
CREATE INDEX IF NOT EXISTS "CareerFitScore_fitScore_idx" ON "CareerFitScore"("fitScore");
CREATE UNIQUE INDEX IF NOT EXISTS "CareerFitScore_memberId_roleId_memberAssessmentId_key" ON "CareerFitScore"("memberId", "roleId", "memberAssessmentId");

-- AddForeignKey: CompetencyScore -> MemberAssessment
ALTER TABLE "CompetencyScore" DROP CONSTRAINT IF EXISTS "CompetencyScore_memberAssessmentId_fkey";
ALTER TABLE "CompetencyScore" ADD CONSTRAINT "CompetencyScore_memberAssessmentId_fkey"
    FOREIGN KEY ("memberAssessmentId") REFERENCES "MemberAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: AssessmentDelta -> Member
ALTER TABLE "AssessmentDelta" DROP CONSTRAINT IF EXISTS "AssessmentDelta_memberId_fkey";
ALTER TABLE "AssessmentDelta" ADD CONSTRAINT "AssessmentDelta_memberId_fkey"
    FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: AssessmentDelta -> MemberAssessment (baseline)
ALTER TABLE "AssessmentDelta" DROP CONSTRAINT IF EXISTS "AssessmentDelta_baselineAssessmentId_fkey";
ALTER TABLE "AssessmentDelta" ADD CONSTRAINT "AssessmentDelta_baselineAssessmentId_fkey"
    FOREIGN KEY ("baselineAssessmentId") REFERENCES "MemberAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: AssessmentDelta -> MemberAssessment (followup)
ALTER TABLE "AssessmentDelta" DROP CONSTRAINT IF EXISTS "AssessmentDelta_followupAssessmentId_fkey";
ALTER TABLE "AssessmentDelta" ADD CONSTRAINT "AssessmentDelta_followupAssessmentId_fkey"
    FOREIGN KEY ("followupAssessmentId") REFERENCES "MemberAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: CareerFitScore -> Member
ALTER TABLE "CareerFitScore" DROP CONSTRAINT IF EXISTS "CareerFitScore_memberId_fkey";
ALTER TABLE "CareerFitScore" ADD CONSTRAINT "CareerFitScore_memberId_fkey"
    FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CareerFitScore -> Role
ALTER TABLE "CareerFitScore" DROP CONSTRAINT IF EXISTS "CareerFitScore_roleId_fkey";
ALTER TABLE "CareerFitScore" ADD CONSTRAINT "CareerFitScore_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: CareerFitScore -> MemberAssessment
ALTER TABLE "CareerFitScore" DROP CONSTRAINT IF EXISTS "CareerFitScore_memberAssessmentId_fkey";
ALTER TABLE "CareerFitScore" ADD CONSTRAINT "CareerFitScore_memberAssessmentId_fkey"
    FOREIGN KEY ("memberAssessmentId") REFERENCES "MemberAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

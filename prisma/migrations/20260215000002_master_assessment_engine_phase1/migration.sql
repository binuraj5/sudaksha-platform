-- Phase 1 Day 1: Master Assessment Engine - Database & Core Architecture
-- Per MASTER_ASSESSMENT_ENGINE_IMPLEMENTATION.md

-- ============================================
-- PART 1: ASSESSMENT MODEL & COMPONENT FIELDS
-- ============================================

-- AssessmentModel: target_level (VARCHAR for JUNIOR|MIDDLE|SENIOR|EXPERT) - already has targetLevel as enum
-- Add config JSONB to AssessmentModelComponent for component-specific config
ALTER TABLE "AssessmentModelComponent" ADD COLUMN IF NOT EXISTS "config" JSONB;

-- ============================================
-- PART 2: ADAPTIVE AI COMPONENTS
-- ============================================

-- Adaptive Component Library (reusable configs)
CREATE TABLE IF NOT EXISTS "AdaptiveComponentLibrary" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "competencyId" TEXT NOT NULL,
    "targetLevel" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdaptiveComponentLibrary_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AdaptiveComponentLibrary_competencyId_idx" ON "AdaptiveComponentLibrary"("competencyId");
CREATE INDEX IF NOT EXISTS "AdaptiveComponentLibrary_tenantId_idx" ON "AdaptiveComponentLibrary"("tenantId");

-- Adaptive Assessment Runtime Sessions (links to MemberAssessment = assessment submission)
CREATE TABLE IF NOT EXISTS "AdaptiveSession" (
    "id" TEXT NOT NULL,
    "memberAssessmentId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "currentAbility" DECIMAL(4,2) NOT NULL,
    "initialAbility" DECIMAL(4,2) NOT NULL,
    "targetLevel" TEXT NOT NULL,
    "questionsAsked" INTEGER NOT NULL DEFAULT 0,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "config" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "finalScore" DECIMAL(5,2),
    "abilityEstimate" DECIMAL(4,2),

    CONSTRAINT "AdaptiveSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AdaptiveSession_memberAssessmentId_idx" ON "AdaptiveSession"("memberAssessmentId");
CREATE INDEX IF NOT EXISTS "AdaptiveSession_status_idx" ON "AdaptiveSession"("status");
CREATE INDEX IF NOT EXISTS "AdaptiveSession_componentId_idx" ON "AdaptiveSession"("componentId");

-- Runtime Generated Questions for Adaptive
CREATE TABLE IF NOT EXISTS "AdaptiveQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT,
    "explanation" TEXT,
    "difficulty" DECIMAL(4,2) NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "generationPrompt" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "timeTakenSeconds" INTEGER,
    "answeredAt" TIMESTAMP(3),
    "pointsAwarded" DECIMAL(5,2),
    "maxPoints" DECIMAL(5,2),

    CONSTRAINT "AdaptiveQuestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AdaptiveQuestion_sessionId_idx" ON "AdaptiveQuestion"("sessionId");
CREATE INDEX IF NOT EXISTS "AdaptiveQuestion_sessionId_sequenceNumber_idx" ON "AdaptiveQuestion"("sessionId", "sequenceNumber");

-- ============================================
-- PART 3: PANEL INTERVIEW - CREATE IF NOT EXISTS
-- ============================================

-- Panel tables may not exist in older DBs - create them
CREATE TABLE IF NOT EXISTS "Panel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Panel_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Panel_tenantId_idx" ON "Panel"("tenantId");

CREATE TABLE IF NOT EXISTS "PanelMember" (
    "id" TEXT NOT NULL,
    "panelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PanelMember_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PanelMember_panelId_idx" ON "PanelMember"("panelId");

CREATE TABLE IF NOT EXISTS "PanelInterview" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT,
    "panelId" TEXT NOT NULL,
    "memberAssessmentId" TEXT,
    "componentId" TEXT,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "meetingLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "PanelInterview_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PanelInterview_panelId_idx" ON "PanelInterview"("panelId");
CREATE INDEX IF NOT EXISTS "PanelInterview_candidateId_idx" ON "PanelInterview"("candidateId");
CREATE INDEX IF NOT EXISTS "PanelInterview_status_idx" ON "PanelInterview"("status");
CREATE INDEX IF NOT EXISTS "PanelInterview_memberAssessmentId_idx" ON "PanelInterview"("memberAssessmentId");
CREATE INDEX IF NOT EXISTS "PanelInterview_componentId_idx" ON "PanelInterview"("componentId");

CREATE TABLE IF NOT EXISTS "PanelEvaluation" (
    "id" TEXT NOT NULL,
    "panelInterviewId" TEXT NOT NULL,
    "panelistId" TEXT NOT NULL,
    "panelMemberId" TEXT,
    "scores" JSONB,
    "feedback" TEXT,
    "recommendation" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PanelEvaluation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PanelEvaluation_panelInterviewId_idx" ON "PanelEvaluation"("panelInterviewId");

-- Add columns to existing Panel tables (for DBs that already have them)
ALTER TABLE "PanelInterview" ADD COLUMN IF NOT EXISTS "memberAssessmentId" TEXT;
ALTER TABLE "PanelInterview" ADD COLUMN IF NOT EXISTS "componentId" TEXT;
ALTER TABLE "PanelInterview" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "PanelEvaluation" ADD COLUMN IF NOT EXISTS "panelMemberId" TEXT;

-- Panel table FKs (if tables were just created)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Panel_tenantId_fkey') THEN
    ALTER TABLE "Panel" ADD CONSTRAINT "Panel_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PanelMember_panelId_fkey') THEN
    ALTER TABLE "PanelMember" ADD CONSTRAINT "PanelMember_panelId_fkey"
      FOREIGN KEY ("panelId") REFERENCES "Panel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PanelMember_userId_fkey') THEN
    ALTER TABLE "PanelMember" ADD CONSTRAINT "PanelMember_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PanelInterview_panelId_fkey') THEN
    ALTER TABLE "PanelInterview" ADD CONSTRAINT "PanelInterview_panelId_fkey"
      FOREIGN KEY ("panelId") REFERENCES "Panel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PanelEvaluation_panelInterviewId_fkey') THEN
    ALTER TABLE "PanelEvaluation" ADD CONSTRAINT "PanelEvaluation_panelInterviewId_fkey"
      FOREIGN KEY ("panelInterviewId") REFERENCES "PanelInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================
-- PART 4: FOREIGN KEYS
-- ============================================

-- AdaptiveComponentLibrary
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AdaptiveComponentLibrary_tenantId_fkey') THEN
    ALTER TABLE "AdaptiveComponentLibrary" ADD CONSTRAINT "AdaptiveComponentLibrary_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AdaptiveComponentLibrary_createdBy_fkey') THEN
    ALTER TABLE "AdaptiveComponentLibrary" ADD CONSTRAINT "AdaptiveComponentLibrary_createdBy_fkey"
      FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AdaptiveComponentLibrary_competencyId_fkey') THEN
    ALTER TABLE "AdaptiveComponentLibrary" ADD CONSTRAINT "AdaptiveComponentLibrary_competencyId_fkey"
      FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AdaptiveSession
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AdaptiveSession_memberAssessmentId_fkey') THEN
    ALTER TABLE "AdaptiveSession" ADD CONSTRAINT "AdaptiveSession_memberAssessmentId_fkey"
      FOREIGN KEY ("memberAssessmentId") REFERENCES "MemberAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AdaptiveSession_componentId_fkey') THEN
    ALTER TABLE "AdaptiveSession" ADD CONSTRAINT "AdaptiveSession_componentId_fkey"
      FOREIGN KEY ("componentId") REFERENCES "AssessmentModelComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AdaptiveSession_memberId_fkey') THEN
    ALTER TABLE "AdaptiveSession" ADD CONSTRAINT "AdaptiveSession_memberId_fkey"
      FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AdaptiveSession_competencyId_fkey') THEN
    ALTER TABLE "AdaptiveSession" ADD CONSTRAINT "AdaptiveSession_competencyId_fkey"
      FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AdaptiveQuestion
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AdaptiveQuestion_sessionId_fkey') THEN
    ALTER TABLE "AdaptiveQuestion" ADD CONSTRAINT "AdaptiveQuestion_sessionId_fkey"
      FOREIGN KEY ("sessionId") REFERENCES "AdaptiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- PanelInterview - assessment links
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PanelInterview_memberAssessmentId_fkey') THEN
    ALTER TABLE "PanelInterview" ADD CONSTRAINT "PanelInterview_memberAssessmentId_fkey"
      FOREIGN KEY ("memberAssessmentId") REFERENCES "MemberAssessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PanelInterview_componentId_fkey') THEN
    ALTER TABLE "PanelInterview" ADD CONSTRAINT "PanelInterview_componentId_fkey"
      FOREIGN KEY ("componentId") REFERENCES "AssessmentModelComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- PanelEvaluation - panelMemberId
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PanelEvaluation_panelMemberId_fkey') THEN
    ALTER TABLE "PanelEvaluation" ADD CONSTRAINT "PanelEvaluation_panelMemberId_fkey"
      FOREIGN KEY ("panelMemberId") REFERENCES "PanelMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

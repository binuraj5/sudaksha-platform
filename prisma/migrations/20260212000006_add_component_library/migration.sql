-- Phase 1: Add Component Library and related fields
-- REUSE-FIRST: Only ADDING new columns and tables, not modifying existing

-- AssessmentModel: visibility and publishing fields
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "visibility" TEXT DEFAULT 'PRIVATE';
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "publishedToGlobal" BOOLEAN DEFAULT false;
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "globalPublishStatus" TEXT;
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "globalPublishRequestedBy" TEXT;
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "globalPublishRequestedAt" TIMESTAMP(3);
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "globalPublishApprovedBy" TEXT;
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "globalPublishApprovedAt" TIMESTAMP(3);
ALTER TABLE "AssessmentModel" ADD COLUMN IF NOT EXISTS "completionPercentage" INTEGER DEFAULT 0;

-- AssessmentModelComponent: library and metadata fields
ALTER TABLE "AssessmentModelComponent" ADD COLUMN IF NOT EXISTS "isFromLibrary" BOOLEAN DEFAULT false;
ALTER TABLE "AssessmentModelComponent" ADD COLUMN IF NOT EXISTS "libraryComponentId" TEXT;
ALTER TABLE "AssessmentModelComponent" ADD COLUMN IF NOT EXISTS "componentType" TEXT DEFAULT 'QUESTIONNAIRE';
ALTER TABLE "AssessmentModelComponent" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'DRAFT';
ALTER TABLE "AssessmentModelComponent" ADD COLUMN IF NOT EXISTS "completionPercentage" INTEGER DEFAULT 0;
ALTER TABLE "AssessmentModelComponent" ADD COLUMN IF NOT EXISTS "estimatedDuration" INTEGER;

-- ComponentLibrary table
CREATE TABLE IF NOT EXISTS "ComponentLibrary" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "componentType" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "targetLevel" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2),
    "questions" JSONB NOT NULL,
    "metadata" JSONB,
    "publishedToGlobal" BOOLEAN NOT NULL DEFAULT false,
    "globalPublishApprovedBy" TEXT,
    "globalPublishApprovedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentLibrary_pkey" PRIMARY KEY ("id")
);

-- ComponentSuggestion table
CREATE TABLE IF NOT EXISTS "ComponentSuggestion" (
    "id" TEXT NOT NULL,
    "competencyCategory" TEXT NOT NULL,
    "targetLevel" TEXT NOT NULL,
    "suggestedType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComponentSuggestion_pkey" PRIMARY KEY ("id")
);

-- GlobalPublishRequest table
CREATE TABLE IF NOT EXISTS "GlobalPublishRequest" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewComments" TEXT,

    CONSTRAINT "GlobalPublishRequest_pkey" PRIMARY KEY ("id")
);

-- Indexes for ComponentLibrary
CREATE INDEX IF NOT EXISTS "ComponentLibrary_tenantId_idx" ON "ComponentLibrary"("tenantId");
CREATE INDEX IF NOT EXISTS "ComponentLibrary_competencyId_idx" ON "ComponentLibrary"("competencyId");
CREATE INDEX IF NOT EXISTS "ComponentLibrary_componentType_idx" ON "ComponentLibrary"("componentType");
CREATE INDEX IF NOT EXISTS "ComponentLibrary_targetLevel_idx" ON "ComponentLibrary"("targetLevel");
CREATE INDEX IF NOT EXISTS "ComponentLibrary_visibility_idx" ON "ComponentLibrary"("visibility");

-- Indexes for ComponentSuggestion
CREATE INDEX IF NOT EXISTS "ComponentSuggestion_competencyCategory_targetLevel_idx" ON "ComponentSuggestion"("competencyCategory", "targetLevel");

-- Indexes for GlobalPublishRequest
CREATE INDEX IF NOT EXISTS "GlobalPublishRequest_status_idx" ON "GlobalPublishRequest"("status");
CREATE INDEX IF NOT EXISTS "GlobalPublishRequest_entityType_entityId_idx" ON "GlobalPublishRequest"("entityType", "entityId");

-- Index for AssessmentModelComponent libraryComponentId
CREATE INDEX IF NOT EXISTS "AssessmentModelComponent_libraryComponentId_idx" ON "AssessmentModelComponent"("libraryComponentId");

-- Foreign keys for ComponentLibrary
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ComponentLibrary_tenantId_fkey') THEN
    ALTER TABLE "ComponentLibrary" ADD CONSTRAINT "ComponentLibrary_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ComponentLibrary_createdBy_fkey') THEN
    ALTER TABLE "ComponentLibrary" ADD CONSTRAINT "ComponentLibrary_createdBy_fkey"
      FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ComponentLibrary_competencyId_fkey') THEN
    ALTER TABLE "ComponentLibrary" ADD CONSTRAINT "ComponentLibrary_competencyId_fkey"
      FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- Foreign keys for GlobalPublishRequest
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GlobalPublishRequest_requestedBy_fkey') THEN
    ALTER TABLE "GlobalPublishRequest" ADD CONSTRAINT "GlobalPublishRequest_requestedBy_fkey"
      FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GlobalPublishRequest_reviewedBy_fkey') THEN
    ALTER TABLE "GlobalPublishRequest" ADD CONSTRAINT "GlobalPublishRequest_reviewedBy_fkey"
      FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Foreign key for AssessmentModelComponent libraryComponentId
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AssessmentModelComponent_libraryComponentId_fkey') THEN
    ALTER TABLE "AssessmentModelComponent" ADD CONSTRAINT "AssessmentModelComponent_libraryComponentId_fkey"
      FOREIGN KEY ("libraryComponentId") REFERENCES "ComponentLibrary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

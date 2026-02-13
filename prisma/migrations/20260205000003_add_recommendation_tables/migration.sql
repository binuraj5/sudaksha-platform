-- CreateTable: Enhancement #5 - Intelligent Recommendations (Phase 4)
CREATE TABLE IF NOT EXISTS "RecommendationRule" (
    "id" TEXT NOT NULL,
    "category" TEXT,
    "triggerContext" JSONB,
    "recommendationText" TEXT,
    "rationale" TEXT,
    "autoApplyValues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RecommendationRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RecommendationUsage" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "userId" TEXT,
    "context" JSONB,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RecommendationRule_category_idx" ON "RecommendationRule"("category");
CREATE INDEX IF NOT EXISTS "RecommendationUsage_ruleId_idx" ON "RecommendationUsage"("ruleId");
CREATE INDEX IF NOT EXISTS "RecommendationUsage_userId_idx" ON "RecommendationUsage"("userId");

ALTER TABLE "RecommendationUsage" ADD CONSTRAINT "RecommendationUsage_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "RecommendationRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

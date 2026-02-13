-- CreateTable: Enhancement #1 - Approval audit trail (Phase 3)
CREATE TABLE IF NOT EXISTS "ApprovalHistory" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "approverRole" TEXT NOT NULL,
    "approverUserId" TEXT,
    "action" TEXT NOT NULL,
    "actionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comments" TEXT,
    "iterationNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ApprovalHistory_entityType_entityId_idx" ON "ApprovalHistory"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "ApprovalHistory_entityId_iterationNumber_idx" ON "ApprovalHistory"("entityId", "iterationNumber");

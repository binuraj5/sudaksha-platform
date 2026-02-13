-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "entityName" TEXT,
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'INFO',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SUCCESS',
ADD COLUMN     "userName" TEXT;

-- AlterTable
ALTER TABLE "Communication" ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "recipients" JSONB,
ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stats" JSONB,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "prerequisites" TEXT;

-- CreateTable
CREATE TABLE "CommunicationTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "recipientsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CTAEvent" (
    "id" TEXT NOT NULL,
    "ctaId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "pageUrl" TEXT,
    "formName" TEXT,
    "buttonName" TEXT,
    "eventData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CTAEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunicationTemplate_type_idx" ON "CommunicationTemplate"("type");

-- CreateIndex
CREATE INDEX "CommunicationCampaign_status_idx" ON "CommunicationCampaign"("status");

-- CreateIndex
CREATE INDEX "CTAEvent_ctaId_idx" ON "CTAEvent"("ctaId");

-- CreateIndex
CREATE INDEX "CTAEvent_eventType_idx" ON "CTAEvent"("eventType");

-- CreateIndex
CREATE INDEX "CTAEvent_createdAt_idx" ON "CTAEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");

-- CreateIndex
CREATE INDEX "Communication_campaignId_idx" ON "Communication"("campaignId");

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CommunicationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

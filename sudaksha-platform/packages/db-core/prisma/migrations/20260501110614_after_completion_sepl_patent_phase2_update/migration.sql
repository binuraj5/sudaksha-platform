-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT,
    "trainerId" TEXT,
    "moduleTitle" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "sessionNumber" INTEGER NOT NULL DEFAULT 1,
    "totalParticipants" INTEGER NOT NULL DEFAULT 0,
    "questionCount" INTEGER NOT NULL DEFAULT 10,
    "durationMinutes" INTEGER NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "randomSeed" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSessionQuestion" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "options" JSONB NOT NULL DEFAULT '[]',
    "correctOptionId" TEXT,
    "competencyCode" TEXT,
    "difficultyLevel" INTEGER NOT NULL DEFAULT 2,
    "targetCohort" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSessionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSessionResponse" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "shortAnswerText" TEXT,
    "isCorrect" BOOLEAN,
    "pointsAwarded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseTimeMs" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSessionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSessionResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "rawScore" DOUBLE PRECISION NOT NULL,
    "normalisedScore" DOUBLE PRECISION,
    "proficiencyLevel" INTEGER,
    "percentileRank" INTEGER,
    "biasFlags" JSONB NOT NULL DEFAULT '[]',
    "deltaFromLastSession" DOUBLE PRECISION,
    "competencyScoreIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSessionResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingSession_activityId_idx" ON "TrainingSession"("activityId");

-- CreateIndex
CREATE INDEX "TrainingSession_tenantId_idx" ON "TrainingSession"("tenantId");

-- CreateIndex
CREATE INDEX "TrainingSession_trainerId_idx" ON "TrainingSession"("trainerId");

-- CreateIndex
CREATE INDEX "TrainingSession_sessionDate_idx" ON "TrainingSession"("sessionDate");

-- CreateIndex
CREATE INDEX "TrainingSession_status_idx" ON "TrainingSession"("status");

-- CreateIndex
CREATE INDEX "TrainingSessionQuestion_activityId_idx" ON "TrainingSessionQuestion"("activityId");

-- CreateIndex
CREATE INDEX "TrainingSessionQuestion_competencyCode_idx" ON "TrainingSessionQuestion"("competencyCode");

-- CreateIndex
CREATE INDEX "TrainingSessionQuestion_isActive_idx" ON "TrainingSessionQuestion"("isActive");

-- CreateIndex
CREATE INDEX "TrainingSessionResponse_sessionId_idx" ON "TrainingSessionResponse"("sessionId");

-- CreateIndex
CREATE INDEX "TrainingSessionResponse_memberId_idx" ON "TrainingSessionResponse"("memberId");

-- CreateIndex
CREATE INDEX "TrainingSessionResponse_questionId_idx" ON "TrainingSessionResponse"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSessionResponse_sessionId_questionId_memberId_key" ON "TrainingSessionResponse"("sessionId", "questionId", "memberId");

-- CreateIndex
CREATE INDEX "TrainingSessionResult_sessionId_idx" ON "TrainingSessionResult"("sessionId");

-- CreateIndex
CREATE INDEX "TrainingSessionResult_memberId_idx" ON "TrainingSessionResult"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSessionResult_sessionId_memberId_key" ON "TrainingSessionResult"("sessionId", "memberId");

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionQuestion" ADD CONSTRAINT "TrainingSessionQuestion_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionResponse" ADD CONSTRAINT "TrainingSessionResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionResponse" ADD CONSTRAINT "TrainingSessionResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TrainingSessionQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionResponse" ADD CONSTRAINT "TrainingSessionResponse_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionResult" ADD CONSTRAINT "TrainingSessionResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionResult" ADD CONSTRAINT "TrainingSessionResult_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

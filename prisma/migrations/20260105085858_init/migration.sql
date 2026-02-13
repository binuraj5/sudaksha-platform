-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('SOFTWARE_DEVELOPMENT', 'DATA_ANALYTICS', 'CLOUD_DEVOPS', 'AI_ML', 'CYBERSECURITY', 'BUSINESS_ANALYSIS', 'PROJECT_MANAGEMENT', 'DIGITAL_MARKETING', 'COMMUNICATION', 'LEADERSHIP');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AudienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');

-- CreateEnum
CREATE TYPE "TrainerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BatchMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('IT', 'NON_IT');

-- CreateEnum
CREATE TYPE "TargetLevel" AS ENUM ('JUNIOR', 'MIDDLE', 'SENIOR', 'MANAGEMENT', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('TECHNOLOGY', 'IT', 'FUNCTIONAL', 'PROCESS', 'BEHAVIORAL', 'PERSONAL');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('CONTACT_FORM', 'ENROLLMENT_INQUIRY', 'LIVE_CHAT', 'NEWSLETTER', 'OTHER');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('PENDING', 'READ', 'RESPONDED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "expertise" JSONB NOT NULL,
    "experience" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "linkedinUrl" TEXT,
    "status" "TrainerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "CourseCategory" NOT NULL,
    "deliveryMode" "BatchMode" NOT NULL DEFAULT 'ONLINE',
    "categoryType" "CategoryType" NOT NULL,
    "industry" TEXT NOT NULL DEFAULT 'Generic/All Industries',
    "targetLevel" "TargetLevel" NOT NULL,
    "courseType" "CourseType" NOT NULL,
    "isSelfPaced" BOOLEAN NOT NULL DEFAULT false,
    "enrollmentUrl" TEXT,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "audienceLevel" "AudienceLevel" NOT NULL,
    "skillTags" JSONB NOT NULL,
    "learningObjectives" JSONB NOT NULL,
    "moduleBreakdown" JSONB NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "maxStudents" INTEGER,
    "certification" BOOLEAN NOT NULL DEFAULT false,
    "trainerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinishingSchool" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryType" "CategoryType" NOT NULL,
    "industry" TEXT NOT NULL DEFAULT 'Generic/All Industries',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinishingSchool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseLesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "videoUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "moduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseBatch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "schedule" TEXT NOT NULL,
    "mode" "BatchMode" NOT NULL DEFAULT 'ONLINE',
    "maxStudents" INTEGER NOT NULL,
    "currentStudents" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION,
    "status" "BatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "location" TEXT,
    "meetingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseReview" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Communication" (
    "id" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "CommunicationStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "idEntity" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("idEntity")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_category_status_idx" ON "Course"("category", "status");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX "Course_audienceLevel_idx" ON "Course"("audienceLevel");

-- CreateIndex
CREATE INDEX "Course_rating_idx" ON "Course"("rating");

-- CreateIndex
CREATE INDEX "Course_price_idx" ON "Course"("price");

-- CreateIndex
CREATE INDEX "Course_trainerId_idx" ON "Course"("trainerId");

-- CreateIndex
CREATE INDEX "Course_categoryType_idx" ON "Course"("categoryType");

-- CreateIndex
CREATE INDEX "Course_industry_idx" ON "Course"("industry");

-- CreateIndex
CREATE INDEX "Course_targetLevel_idx" ON "Course"("targetLevel");

-- CreateIndex
CREATE INDEX "Course_courseType_idx" ON "Course"("courseType");

-- CreateIndex
CREATE INDEX "Course_deliveryMode_idx" ON "Course"("deliveryMode");

-- CreateIndex
CREATE INDEX "FinishingSchool_categoryType_idx" ON "FinishingSchool"("categoryType");

-- CreateIndex
CREATE INDEX "FinishingSchool_industry_idx" ON "FinishingSchool"("industry");

-- CreateIndex
CREATE INDEX "CourseModule_courseId_idx" ON "CourseModule"("courseId");

-- CreateIndex
CREATE INDEX "CourseModule_order_idx" ON "CourseModule"("order");

-- CreateIndex
CREATE INDEX "CourseLesson_moduleId_idx" ON "CourseLesson"("moduleId");

-- CreateIndex
CREATE INDEX "CourseLesson_order_idx" ON "CourseLesson"("order");

-- CreateIndex
CREATE INDEX "CourseBatch_courseId_idx" ON "CourseBatch"("courseId");

-- CreateIndex
CREATE INDEX "CourseBatch_trainerId_idx" ON "CourseBatch"("trainerId");

-- CreateIndex
CREATE INDEX "CourseBatch_startDate_status_idx" ON "CourseBatch"("startDate", "status");

-- CreateIndex
CREATE INDEX "CourseBatch_status_idx" ON "CourseBatch"("status");

-- CreateIndex
CREATE INDEX "CourseBatch_startDate_idx" ON "CourseBatch"("startDate");

-- CreateIndex
CREATE INDEX "CourseReview_courseId_idx" ON "CourseReview"("courseId");

-- CreateIndex
CREATE INDEX "CourseReview_rating_idx" ON "CourseReview"("rating");

-- CreateIndex
CREATE INDEX "CourseReview_createdAt_idx" ON "CourseReview"("createdAt");

-- CreateIndex
CREATE INDEX "Communication_type_idx" ON "Communication"("type");

-- CreateIndex
CREATE INDEX "Communication_status_idx" ON "Communication"("status");

-- CreateIndex
CREATE INDEX "Communication_email_idx" ON "Communication"("email");

-- CreateIndex
CREATE INDEX "Communication_createdAt_idx" ON "Communication"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBatch" ADD CONSTRAINT "CourseBatch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBatch" ADD CONSTRAINT "CourseBatch_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

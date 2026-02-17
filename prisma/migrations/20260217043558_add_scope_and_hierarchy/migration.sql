/*
  Warnings:

  - The values [NOT_STARTED,IN_PROGRESS] on the enum `AssessmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [HYBRID] on the enum `ModelSourceType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `reviewedBy` on the `ApprovalRequest` table. All the data in the column will be lost.
  - You are about to drop the column `createdByType` on the `AssessmentModel` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `AssessmentModel` table. All the data in the column will be lost.
  - You are about to drop the column `passingCriteria` on the `AssessmentModel` table. All the data in the column will be lost.
  - You are about to drop the column `totalDuration` on the `AssessmentModel` table. All the data in the column will be lost.
  - You are about to drop the column `componentId` on the `AssessmentModelComponent` table. All the data in the column will be lost.
  - You are about to drop the column `weightage` on the `AssessmentModelComponent` table. All the data in the column will be lost.
  - You are about to drop the column `aiGradingRubric` on the `ComponentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `evaluationCriteria` on the `ComponentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `isAIGradable` on the `ComponentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `mediaUrls` on the `ComponentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `programmingLanguage` on the `ComponentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `starterCode` on the `ComponentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `testCases` on the `ComponentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `wordLimit` on the `ComponentQuestion` table. All the data in the column will be lost.
  - You are about to alter the column `points` on the `ComponentQuestion` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `userId` on the `Member` table. All the data in the column will be lost.
  - The `status` column on the `Member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `subscriptionTier` column on the `Tenant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userType` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AssessmentComponent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompetencyComponentMapping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ComponentIndicatorLink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ComponentPrerequisite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RuntimeGenerationConfig` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[courseCode]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[batchCode]` on the table `CourseBatch` will be added. If there are existing duplicate values, this will fail.
  - Made the column `isActive` on table `AdminUser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `AdminUser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `AdminUser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `AssessmentModel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `publishedToGlobal` on table `AssessmentModel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `completionPercentage` on table `AssessmentModel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weight` on table `AssessmentModelComponent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isFromLibrary` on table `AssessmentModelComponent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `componentType` on table `AssessmentModelComponent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `AssessmentModelComponent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `completionPercentage` on table `AssessmentModelComponent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssessmentStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'SUBMITTED', 'UNDER_REVIEW', 'REVIEWED', 'EXPIRED');
ALTER TABLE "public"."AssessmentModel" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."MemberAssessment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."ProjectUserAssessment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."UserAssessmentComponent" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."UserAssessmentModel" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AssessmentModel" ALTER COLUMN "status" TYPE "AssessmentStatus_new" USING ("status"::text::"AssessmentStatus_new");
ALTER TABLE "UserAssessmentModel" ALTER COLUMN "status" TYPE "AssessmentStatus_new" USING ("status"::text::"AssessmentStatus_new");
ALTER TABLE "ProjectUserAssessment" ALTER COLUMN "status" TYPE "AssessmentStatus_new" USING ("status"::text::"AssessmentStatus_new");
ALTER TABLE "UserAssessmentComponent" ALTER COLUMN "status" TYPE "AssessmentStatus_new" USING ("status"::text::"AssessmentStatus_new");
ALTER TABLE "MemberAssessment" ALTER COLUMN "status" TYPE "AssessmentStatus_new" USING ("status"::text::"AssessmentStatus_new");
ALTER TYPE "AssessmentStatus" RENAME TO "AssessmentStatus_old";
ALTER TYPE "AssessmentStatus_new" RENAME TO "AssessmentStatus";
DROP TYPE "public"."AssessmentStatus_old";
ALTER TABLE "AssessmentModel" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "MemberAssessment" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "ProjectUserAssessment" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "UserAssessmentComponent" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "UserAssessmentModel" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ModelSourceType_new" AS ENUM ('ROLE_BASED', 'COMPETENCY_BASED', 'CUSTOM', 'TEMPLATE');
ALTER TABLE "public"."AssessmentModel" ALTER COLUMN "sourceType" DROP DEFAULT;
ALTER TABLE "AssessmentModel" ALTER COLUMN "sourceType" TYPE "ModelSourceType_new" USING ("sourceType"::text::"ModelSourceType_new");
ALTER TYPE "ModelSourceType" RENAME TO "ModelSourceType_old";
ALTER TYPE "ModelSourceType_new" RENAME TO "ModelSourceType";
DROP TYPE "public"."ModelSourceType_old";
ALTER TABLE "AssessmentModel" ALTER COLUMN "sourceType" SET DEFAULT 'ROLE_BASED';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SurveyQuestionType" ADD VALUE 'NPS';
ALTER TYPE "SurveyQuestionType" ADD VALUE 'SLIDER';
ALTER TYPE "SurveyQuestionType" ADD VALUE 'DATE';
ALTER TYPE "SurveyQuestionType" ADD VALUE 'YES_NO';

-- DropForeignKey
ALTER TABLE "AssessmentComponent" DROP CONSTRAINT "AssessmentComponent_sourceCompetencyId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentModelComponent" DROP CONSTRAINT "AssessmentModelComponent_componentId_fkey";

-- DropForeignKey
ALTER TABLE "CompetencyComponentMapping" DROP CONSTRAINT "CompetencyComponentMapping_competencyId_fkey";

-- DropForeignKey
ALTER TABLE "CompetencyComponentMapping" DROP CONSTRAINT "CompetencyComponentMapping_componentId_fkey";

-- DropForeignKey
ALTER TABLE "ComponentIndicatorLink" DROP CONSTRAINT "ComponentIndicatorLink_componentId_fkey";

-- DropForeignKey
ALTER TABLE "ComponentIndicatorLink" DROP CONSTRAINT "ComponentIndicatorLink_indicatorId_fkey";

-- DropForeignKey
ALTER TABLE "ComponentPrerequisite" DROP CONSTRAINT "ComponentPrerequisite_componentId_fkey";

-- DropForeignKey
ALTER TABLE "ComponentPrerequisite" DROP CONSTRAINT "ComponentPrerequisite_prerequisiteId_fkey";

-- DropForeignKey
ALTER TABLE "Panel" DROP CONSTRAINT "Panel_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PanelMember" DROP CONSTRAINT "PanelMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "RuntimeGenerationConfig" DROP CONSTRAINT "RuntimeGenerationConfig_componentId_fkey";

-- DropForeignKey
ALTER TABLE "UserAssessmentComponent" DROP CONSTRAINT "UserAssessmentComponent_componentId_fkey";

-- DropIndex
DROP INDEX "AssessmentModelComponent_componentId_idx";

-- DropIndex
DROP INDEX "AssessmentModelComponent_modelId_componentId_key";

-- AlterTable
ALTER TABLE "AdaptiveComponentLibrary" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AdminUser" ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "lastLoginAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ApprovalRequest" DROP COLUMN "reviewedBy",
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "requesterId" TEXT,
ADD COLUMN     "reviewerId" TEXT;

-- AlterTable
ALTER TABLE "AssessmentModel" DROP COLUMN "createdByType",
DROP COLUMN "isPublished",
DROP COLUMN "passingCriteria",
DROP COLUMN "totalDuration",
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "targetLevel" DROP NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "publishedToGlobal" SET NOT NULL,
ALTER COLUMN "completionPercentage" SET NOT NULL;

-- AlterTable
ALTER TABLE "AssessmentModelComponent" DROP COLUMN "componentId",
DROP COLUMN "weightage",
ALTER COLUMN "order" SET DEFAULT 0,
ALTER COLUMN "indicatorIds" DROP DEFAULT,
ALTER COLUMN "weight" SET NOT NULL,
ALTER COLUMN "isFromLibrary" SET NOT NULL,
ALTER COLUMN "componentType" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "completionPercentage" SET NOT NULL;

-- AlterTable
ALTER TABLE "Competency" ADD COLUMN     "allowedLevels" TEXT[] DEFAULT ARRAY['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT']::TEXT[],
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "globalApprovedAt" TIMESTAMP(3),
ADD COLUMN     "globalApprovedBy" TEXT,
ADD COLUMN     "globalRejectionReason" TEXT,
ADD COLUMN     "globalSubmissionStatus" TEXT,
ADD COLUMN     "globalSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "globalSubmittedBy" TEXT,
ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'GLOBAL',
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "ComponentQuestion" DROP COLUMN "aiGradingRubric",
DROP COLUMN "evaluationCriteria",
DROP COLUMN "isAIGradable",
DROP COLUMN "mediaUrls",
DROP COLUMN "programmingLanguage",
DROP COLUMN "starterCode",
DROP COLUMN "testCases",
DROP COLUMN "wordLimit",
ALTER COLUMN "points" SET DEFAULT 1,
ALTER COLUMN "points" SET DATA TYPE INTEGER,
ALTER COLUMN "order" SET DEFAULT 0,
ALTER COLUMN "linkedIndicators" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "assessmentsJson" JSONB,
ADD COLUMN     "averagePlacementRate" DECIMAL(65,30),
ADD COLUMN     "averageSalaryHikePercent" DECIMAL(65,30),
ADD COLUMN     "averageSalaryMax" DECIMAL(65,30),
ADD COLUMN     "averageSalaryMin" DECIMAL(65,30),
ADD COLUMN     "basePrice" DECIMAL(65,30),
ADD COLUMN     "batchType" "BatchTypeDisplay",
ADD COLUMN     "capstoneProjectDescription" TEXT,
ADD COLUMN     "capstoneProjectDurationHours" INTEGER,
ADD COLUMN     "capstoneProjectTitle" TEXT,
ADD COLUMN     "careerPaths" JSONB,
ADD COLUMN     "categoryPrimary" "CategoryPrimary",
ADD COLUMN     "categorySecondary" TEXT,
ADD COLUMN     "certificationName" TEXT,
ADD COLUMN     "classDurationMinutes" INTEGER,
ADD COLUMN     "courseCode" TEXT,
ADD COLUMN     "courseTypeDisplay" "CourseTypeDisplay",
ADD COLUMN     "currency" TEXT DEFAULT 'INR',
ADD COLUMN     "currentBatchEnrolled" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryModeJson" JSONB,
ADD COLUMN     "discountedPrice" DECIMAL(65,30),
ADD COLUMN     "earlyBirdDiscount" DECIMAL(65,30),
ADD COLUMN     "emiAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emiOptions" JSONB,
ADD COLUMN     "experienceRequired" TEXT,
ADD COLUMN     "featuredOrder" INTEGER,
ADD COLUMN     "finishingSchoolProgram" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "groupDiscount" DECIMAL(65,30),
ADD COLUMN     "hoursPerWeek" INTEGER,
ADD COLUMN     "industrySpecific" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "industryVertical" JSONB,
ADD COLUMN     "isCorporateOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isIndividualAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTrending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lmsCourseId" TEXT,
ADD COLUMN     "lmsLastSyncAt" TIMESTAMP(3),
ADD COLUMN     "longDescription" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaKeywords" JSONB,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "miniProjects" JSONB,
ADD COLUMN     "miniProjectsCount" INTEGER,
ADD COLUMN     "ogImageUrl" TEXT,
ADD COLUMN     "overallRating" DECIMAL(65,30),
ADD COLUMN     "placementSupport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prerequisiteSkills" JSONB,
ADD COLUMN     "primaryTrainerId" TEXT,
ADD COLUMN     "ratingDistribution" JSONB,
ADD COLUMN     "scheduleDetails" JSONB,
ADD COLUMN     "skillsGained" JSONB,
ADD COLUMN     "statusDisplay" "CourseStatusDisplay",
ADD COLUMN     "targetAudienceDisplay" "TargetAudienceDisplay",
ADD COLUMN     "technologyDomain" TEXT,
ADD COLUMN     "toolsCovered" JSONB,
ADD COLUMN     "topHiringCompanies" JSONB,
ADD COLUMN     "totalClasses" INTEGER,
ADD COLUMN     "totalDurationWeeks" INTEGER,
ADD COLUMN     "totalHours" INTEGER,
ADD COLUMN     "totalLessons" INTEGER,
ADD COLUMN     "totalModules" INTEGER,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalStudentsTrained" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trainerExperienceRequired" TEXT,
ADD COLUMN     "trainerPool" JSONB;

-- AlterTable
ALTER TABLE "CourseBatch" ADD COLUMN     "assignedTrainerId" TEXT,
ADD COLUMN     "batchCode" TEXT,
ADD COLUMN     "batchType" "BatchTypeDisplay",
ADD COLUMN     "classroomLocation" TEXT,
ADD COLUMN     "deliveryMode" "BatchDeliveryMode",
ADD COLUMN     "enrolledStudents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "onlinePlatform" TEXT,
ADD COLUMN     "scheduleDetails" JSONB,
ADD COLUMN     "timezone" TEXT DEFAULT 'IST',
ADD COLUMN     "waitlistCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CourseLesson" ADD COLUMN     "lessonDescription" TEXT,
ADD COLUMN     "lessonDurationMinutes" INTEGER,
ADD COLUMN     "lessonNumber" INTEGER,
ADD COLUMN     "lessonTitle" TEXT,
ADD COLUMN     "lessonType" "LessonType",
ADD COLUMN     "resources" JSONB;

-- AlterTable
ALTER TABLE "CourseModule" ADD COLUMN     "handsOnLabs" JSONB,
ADD COLUMN     "learningObjectives" JSONB,
ADD COLUMN     "moduleDescription" TEXT,
ADD COLUMN     "moduleDurationHours" INTEGER,
ADD COLUMN     "moduleNumber" INTEGER,
ADD COLUMN     "moduleTitle" TEXT,
ADD COLUMN     "topicsCovered" JSONB;

-- AlterTable
ALTER TABLE "CourseReview" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "cons" TEXT,
ADD COLUMN     "contentQualityRating" INTEGER,
ADD COLUMN     "courseCompletedDate" TIMESTAMP(3),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "placementSupportRating" INTEGER,
ADD COLUMN     "pros" TEXT,
ADD COLUMN     "reviewDate" TIMESTAMP(3),
ADD COLUMN     "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "reviewText" TEXT,
ADD COLUMN     "reviewTitle" TEXT,
ADD COLUMN     "studentCompany" TEXT,
ADD COLUMN     "studentDesignation" TEXT,
ADD COLUMN     "studentId" TEXT,
ADD COLUMN     "studentPhotoUrl" TEXT,
ADD COLUMN     "supportRating" INTEGER,
ADD COLUMN     "trainerRating" INTEGER,
ADD COLUMN     "valueForMoneyRating" INTEGER;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "userId",
ALTER COLUMN "invitationAcceptedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "invitationSentAt" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "MemberAssessment" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Panel" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PanelEvaluation" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PanelInterview" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProjectUserAssessment" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "allowedLevels" TEXT[] DEFAULT ARRAY['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT']::TEXT[],
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "globalApprovedAt" TIMESTAMP(3),
ADD COLUMN     "globalApprovedBy" TEXT,
ADD COLUMN     "globalRejectionReason" TEXT,
ADD COLUMN     "globalSubmissionStatus" TEXT,
ADD COLUMN     "globalSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "globalSubmittedBy" TEXT,
ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'GLOBAL',
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "subscriptionTier",
ADD COLUMN     "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'STARTER';

-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN     "availableForCourses" JSONB,
ADD COLUMN     "certifications" JSONB,
ADD COLUMN     "currentCompany" TEXT,
ADD COLUMN     "currentDesignation" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "industriesWorked" JSONB,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "preferredBatchTypes" JSONB,
ADD COLUMN     "primaryExpertise" JSONB,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "secondaryExpertise" JSONB,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "totalIndustryExperienceYears" INTEGER,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalStudentsTaught" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalTeachingExperienceYears" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userType",
ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'TENANT';

-- AlterTable
ALTER TABLE "UserAssessmentComponent" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "UserAssessmentModel" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "AssessmentComponent";

-- DropTable
DROP TABLE "CompetencyComponentMapping";

-- DropTable
DROP TABLE "ComponentIndicatorLink";

-- DropTable
DROP TABLE "ComponentPrerequisite";

-- DropTable
DROP TABLE "RuntimeGenerationConfig";

-- CreateTable
CREATE TABLE "CoursePrerequisite" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "prerequisiteType" "PrerequisiteType" NOT NULL,
    "prerequisiteTitle" TEXT,
    "prerequisiteDescription" TEXT,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseFaq" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "sortOrder" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMedia" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "mediaType" "CourseMediaType" NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "mediaTitle" TEXT,
    "mediaDescription" TEXT,
    "thumbnailUrl" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseOutcome" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "batchId" TEXT,
    "totalStudents" INTEGER,
    "studentsPlaced" INTEGER,
    "placementRate" DECIMAL(65,30),
    "averageSalary" DECIMAL(65,30),
    "minSalary" DECIMAL(65,30),
    "maxSalary" DECIMAL(65,30),
    "placementCompanies" JSONB,
    "averagePreAssessmentScore" DECIMAL(65,30),
    "averagePostAssessmentScore" DECIMAL(65,30),
    "skillImprovementPercent" DECIMAL(65,30),
    "completionRate" DECIMAL(65,30),
    "projectSubmissionRate" DECIMAL(65,30),
    "dataPeriod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustrySpecificCourse" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "industryVertical" "IndustryVertical" NOT NULL,
    "industryChallengesAddressed" JSONB,
    "complianceCertifications" JSONB,
    "technologyStackFocus" JSONB,
    "domainKnowledgeIncluded" TEXT,
    "industryCaseStudies" JSONB,
    "sampleProjects" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustrySpecificCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planType" "SubscriptionTier" NOT NULL,
    "userCount" INTEGER NOT NULL,
    "billingPeriod" "BillingPeriod" NOT NULL,
    "features" JSONB NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "addonsPrice" DECIMAL(10,2) NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "assessmentsUsedThisPeriod" INTEGER NOT NULL DEFAULT 0,
    "assessmentsIncluded" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amountDue" DECIMAL(10,2) NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "InvoiceStatus" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "stripeInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "lineItems" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billedAt" TIMESTAMP(3),

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureActivation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FeatureActivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalApprovalRequest" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "entitySnapshot" JSONB NOT NULL,

    CONSTRAINT "GlobalApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoursePrerequisite_courseId_sortOrder_idx" ON "CoursePrerequisite"("courseId", "sortOrder");

-- CreateIndex
CREATE INDEX "CourseFaq_courseId_sortOrder_idx" ON "CourseFaq"("courseId", "sortOrder");

-- CreateIndex
CREATE INDEX "CourseMedia_courseId_mediaType_idx" ON "CourseMedia"("courseId", "mediaType");

-- CreateIndex
CREATE INDEX "CourseOutcome_courseId_idx" ON "CourseOutcome"("courseId");

-- CreateIndex
CREATE INDEX "IndustrySpecificCourse_industryVertical_idx" ON "IndustrySpecificCourse"("industryVertical");

-- CreateIndex
CREATE INDEX "Subscription_tenantId_idx" ON "Subscription"("tenantId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_subscriptionId_idx" ON "Invoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_idx" ON "Invoice"("tenantId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "UsageRecord_subscriptionId_idx" ON "UsageRecord"("subscriptionId");

-- CreateIndex
CREATE INDEX "UsageRecord_tenantId_idx" ON "UsageRecord"("tenantId");

-- CreateIndex
CREATE INDEX "UsageRecord_resourceType_idx" ON "UsageRecord"("resourceType");

-- CreateIndex
CREATE INDEX "FeatureActivation_tenantId_idx" ON "FeatureActivation"("tenantId");

-- CreateIndex
CREATE INDEX "FeatureActivation_featureKey_idx" ON "FeatureActivation"("featureKey");

-- CreateIndex
CREATE INDEX "GlobalApprovalRequest_status_idx" ON "GlobalApprovalRequest"("status");

-- CreateIndex
CREATE INDEX "GlobalApprovalRequest_tenantId_idx" ON "GlobalApprovalRequest"("tenantId");

-- CreateIndex
CREATE INDEX "GlobalApprovalRequest_entityType_entityId_idx" ON "GlobalApprovalRequest"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ApprovalRequest_requesterId_idx" ON "ApprovalRequest"("requesterId");

-- CreateIndex
CREATE INDEX "ApprovalRequest_reviewerId_idx" ON "ApprovalRequest"("reviewerId");

-- CreateIndex
CREATE INDEX "Competency_scope_idx" ON "Competency"("scope");

-- CreateIndex
CREATE INDEX "Competency_tenantId_idx" ON "Competency"("tenantId");

-- CreateIndex
CREATE INDEX "Competency_globalSubmissionStatus_idx" ON "Competency"("globalSubmissionStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseCode_key" ON "Course"("courseCode");

-- CreateIndex
CREATE INDEX "Course_categoryPrimary_idx" ON "Course"("categoryPrimary");

-- CreateIndex
CREATE INDEX "Course_technologyDomain_idx" ON "Course"("technologyDomain");

-- CreateIndex
CREATE INDEX "Course_targetAudienceDisplay_idx" ON "Course"("targetAudienceDisplay");

-- CreateIndex
CREATE INDEX "Course_statusDisplay_idx" ON "Course"("statusDisplay");

-- CreateIndex
CREATE INDEX "Course_isFeatured_featuredOrder_idx" ON "Course"("isFeatured", "featuredOrder");

-- CreateIndex
CREATE INDEX "Course_overallRating_idx" ON "Course"("overallRating");

-- CreateIndex
CREATE UNIQUE INDEX "CourseBatch_batchCode_key" ON "CourseBatch"("batchCode");

-- CreateIndex
CREATE INDEX "CourseBatch_courseId_status_idx" ON "CourseBatch"("courseId", "status");

-- CreateIndex
CREATE INDEX "CourseLesson_moduleId_lessonNumber_idx" ON "CourseLesson"("moduleId", "lessonNumber");

-- CreateIndex
CREATE INDEX "CourseModule_courseId_moduleNumber_idx" ON "CourseModule"("courseId", "moduleNumber");

-- CreateIndex
CREATE INDEX "CourseReview_courseId_reviewStatus_idx" ON "CourseReview"("courseId", "reviewStatus");

-- CreateIndex
CREATE INDEX "CourseReview_isFeatured_rating_idx" ON "CourseReview"("isFeatured", "rating");

-- CreateIndex
CREATE INDEX "Role_scope_idx" ON "Role"("scope");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "Role"("tenantId");

-- CreateIndex
CREATE INDEX "Role_globalSubmissionStatus_idx" ON "Role"("globalSubmissionStatus");

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "CourseBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFaq" ADD CONSTRAINT "CourseFaq_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMedia" ADD CONSTRAINT "CourseMedia_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOutcome" ADD CONSTRAINT "CourseOutcome_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrySpecificCourse" ADD CONSTRAINT "IndustrySpecificCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessmentComponent" ADD CONSTRAINT "UserAssessmentComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentModelComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureActivation" ADD CONSTRAINT "FeatureActivation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalApprovalRequest" ADD CONSTRAINT "GlobalApprovalRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalApprovalRequest" ADD CONSTRAINT "GlobalApprovalRequest_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalApprovalRequest" ADD CONSTRAINT "GlobalApprovalRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

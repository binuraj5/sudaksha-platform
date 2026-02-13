/*
  Warnings:

  - Changed the type of `category` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categoryType` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `targetLevel` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `courseType` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categoryType` on the `FinishingSchool` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'CLIENT_ADMIN', 'CLIENT_USER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'CLIENT_ADMIN', 'PROJECT_MANAGER', 'MANAGER', 'ASSESSOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "IndicatorUsageType" AS ENUM ('ASSESSMENT_CRITERIA', 'COACHING_HINT', 'FEEDBACK_ELEMENT');

-- CreateEnum
CREATE TYPE "ComponentCategory" AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'DOMAIN_SPECIFIC', 'COGNITIVE', 'SITUATIONAL', 'LANGUAGE', 'SOFT_SKILLS');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('INFORMATION_TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'MANUFACTURING', 'EDUCATION', 'RETAIL', 'TELECOMMUNICATIONS', 'GOVERNMENT', 'ENERGY', 'TRANSPORTATION', 'HOSPITALITY', 'REAL_ESTATE', 'AGRICULTURE', 'MEDIA', 'GENERIC');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXPERT_LEVEL', 'ALL_LEVELS');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'CODING_CHALLENGE', 'ESSAY', 'SCENARIO_BASED', 'VIDEO_RESPONSE', 'FILE_UPLOAD', 'DRAG_DROP', 'MATCHING', 'FILL_IN_BLANK');

-- CreateEnum
CREATE TYPE "ModelSourceType" AS ENUM ('ROLE_BASED', 'CUSTOM', 'HYBRID');

-- CreateEnum
CREATE TYPE "ModelVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CreatorType" AS ENUM ('SYSTEM', 'CLIENT_ADMIN', 'AI_GENERATED');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('SELF_SELECTED', 'RECOMMENDED', 'ASSIGNED');

-- CreateEnum
CREATE TYPE "AssignmentLevel" AS ENUM ('PROJECT', 'DEPARTMENT', 'MANAGER', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'SUBMITTED', 'UNDER_REVIEW', 'REVIEWED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('CORPORATE', 'INSTITUTION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('EMPLOYEE', 'STUDENT', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'ASSESSOR');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('DEPARTMENT', 'TEAM', 'COLLEGE', 'COURSE_UNIT', 'CLASS', 'DIVISION');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PROJECT', 'CURRICULUM', 'BOOTCAMP', 'INITIATIVE');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ClientPlan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ManagerRole" AS ENUM ('PROJECT_MANAGER', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT');

-- CreateEnum
CREATE TYPE "CompetencyCategory" AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'COGNITIVE', 'DOMAIN_SPECIFIC');

-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('POSITIVE', 'NEGATIVE');

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL,
DROP COLUMN "categoryType",
ADD COLUMN     "categoryType" TEXT NOT NULL,
DROP COLUMN "targetLevel",
ADD COLUMN     "targetLevel" TEXT NOT NULL,
DROP COLUMN "courseType",
ADD COLUMN     "courseType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FinishingSchool" DROP COLUMN "categoryType",
ADD COLUMN     "categoryType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ASSESSOR',
    "clientId" TEXT,
    "employeeId" TEXT,
    "department" TEXT,
    "departmentId" TEXT,
    "projectId" TEXT,
    "accountType" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedRoleId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "departmentUnit" TEXT NOT NULL,
    "currentDesignation" TEXT NOT NULL,
    "reportingManager" TEXT NOT NULL,
    "dateOfJoining" TIMESTAMP(3) NOT NULL,
    "yearsInCurrentRole" DOUBLE PRECISION NOT NULL,
    "educationalQual" TEXT NOT NULL,
    "professionalCerts" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentComponent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceCompetencyId" TEXT,
    "category" "ComponentCategory" NOT NULL,
    "duration" INTEGER NOT NULL,
    "difficultyLevel" "DifficultyLevel" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentIndicatorLink" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "selectionReason" TEXT,
    "usageType" "IndicatorUsageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComponentIndicatorLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyComponentMapping" (
    "id" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "targetLevels" "ProficiencyLevel"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyComponentMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentQuestion" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "timeLimit" INTEGER,
    "order" INTEGER NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT,
    "programmingLanguage" TEXT,
    "starterCode" TEXT,
    "testCases" JSONB,
    "wordLimit" INTEGER,
    "evaluationCriteria" JSONB,
    "isAIGradable" BOOLEAN NOT NULL DEFAULT false,
    "aiGradingRubric" JSONB,
    "mediaUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentPrerequisite" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComponentPrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceType" "ModelSourceType" NOT NULL DEFAULT 'ROLE_BASED',
    "roleId" TEXT,
    "targetLevel" "ProficiencyLevel" NOT NULL DEFAULT 'JUNIOR',
    "totalDuration" INTEGER NOT NULL,
    "passingCriteria" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "visibility" "ModelVisibility" NOT NULL DEFAULT 'PUBLIC',
    "clientId" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdByType" "CreatorType" NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentModelComponent" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isTimed" BOOLEAN NOT NULL DEFAULT true,
    "customDuration" INTEGER,
    "difficultyAdaptation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentModelComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAssessmentModel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "assignmentType" "AssignmentType" NOT NULL DEFAULT 'SELF_SELECTED',
    "assignedBy" TEXT,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentComponentId" TEXT,
    "overallScore" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "certificateUrl" TEXT,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "maxAttemptsAllowed" INTEGER NOT NULL DEFAULT 3,
    "totalTimeSpent" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAssessmentModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAssessmentModel" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "assignmentLevel" "AssignmentLevel" NOT NULL,
    "departmentId" TEXT,
    "managerId" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "allowRetake" BOOLEAN NOT NULL DEFAULT false,
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "notifyUsers" BOOLEAN NOT NULL DEFAULT true,
    "totalAssigned" INTEGER NOT NULL DEFAULT 0,
    "totalCompleted" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAssessmentModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectUserAssessment" (
    "id" TEXT NOT NULL,
    "projectAssignmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notifiedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentComponentId" TEXT,
    "overallScore" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "totalTimeSpent" INTEGER,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "managerComments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectUserAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAssessmentComponent" (
    "id" TEXT NOT NULL,
    "userAssessmentModelId" TEXT,
    "projectUserAssessmentId" TEXT,
    "componentId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "timeSpent" INTEGER,
    "timeLimitUsed" INTEGER,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "aiEvaluationResults" JSONB,
    "aiConfidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAssessmentComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentQuestionResponse" (
    "id" TEXT NOT NULL,
    "userComponentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "responseData" JSONB NOT NULL,
    "isCorrect" BOOLEAN,
    "pointsAwardded" DOUBLE PRECISION,
    "maxPoints" DOUBLE PRECISION NOT NULL,
    "aiEvaluation" JSONB,
    "aiScore" DOUBLE PRECISION,
    "aiFinished" BOOLEAN,
    "humanReviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "humanReviewed" BOOLEAN NOT NULL DEFAULT false,
    "humanReviewedBy" TEXT,
    "humanReviewedAt" TIMESTAMP(3),
    "humanFeedback" TEXT,
    "timeSpent" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentQuestionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "TenantType" NOT NULL DEFAULT 'CORPORATE',
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "logo" TEXT,
    "brandColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "plan" "TenantPlan" NOT NULL DEFAULT 'STARTER',
    "subscriptionStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionEnd" TIMESTAMP(3),
    "maxMembers" INTEGER NOT NULL DEFAULT 100,
    "maxActivities" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "customDomain" TEXT,
    "enableOrgUnits" BOOLEAN NOT NULL DEFAULT true,
    "enableManagers" BOOLEAN NOT NULL DEFAULT true,
    "enableCustomTemplates" BOOLEAN NOT NULL DEFAULT false,
    "emailFromName" TEXT,
    "emailFromAddress" TEXT,
    "smtpConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "type" "MemberType" NOT NULL DEFAULT 'EMPLOYEE',
    "role" "MemberRole" NOT NULL DEFAULT 'ASSESSOR',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" TEXT,
    "orgUnitId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" TIMESTAMP(3),
    "phone" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationUnit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "UnitType" NOT NULL DEFAULT 'DEPARTMENT',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL DEFAULT 'PROJECT',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "ActivityStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityMember" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "ActivityMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityOrgUnit" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "orgUnitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityOrgUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberAssessment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "activityId" TEXT,
    "assessmentModelId" TEXT NOT NULL,
    "assignmentType" "AssignmentType" NOT NULL DEFAULT 'SELF_SELECTED',
    "assignedBy" TEXT,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overallScore" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAssessment" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "assessmentModelId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "logo" TEXT,
    "brandColor" TEXT,
    "plan" "ClientPlan" NOT NULL DEFAULT 'STARTER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionStart" TIMESTAMP(3) NOT NULL,
    "subscriptionEnd" TIMESTAMP(3),
    "maxProjects" INTEGER NOT NULL DEFAULT 5,
    "maxUsers" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSettings" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "customDomain" TEXT,
    "enableDepartments" BOOLEAN NOT NULL DEFAULT true,
    "enableManagers" BOOLEAN NOT NULL DEFAULT true,
    "enableCustomTemplates" BOOLEAN NOT NULL DEFAULT false,
    "emailFromName" TEXT,
    "emailFromAddress" TEXT,
    "smtpConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "headOfDepartment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectManager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" "ManagerRole" NOT NULL DEFAULT 'TEAM_LEAD',
    "canApprove" BOOLEAN NOT NULL DEFAULT true,
    "canViewReports" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentManager" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartmentManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuntimeGenerationConfig" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "totalQuestions" INTEGER NOT NULL DEFAULT 10,
    "adaptiveLevel" TEXT NOT NULL DEFAULT 'moderate',
    "initialContext" TEXT NOT NULL,
    "competencyAreas" TEXT[],
    "questionTypeDistribution" JSONB NOT NULL,
    "startingDifficulty" TEXT NOT NULL DEFAULT 'intermediate',
    "increaseDifficultyAfter" INTEGER NOT NULL DEFAULT 3,
    "decreaseDifficultyAfter" INTEGER NOT NULL DEFAULT 2,
    "aiModel" TEXT NOT NULL DEFAULT 'claude-3-5-sonnet',
    "aiProvider" TEXT NOT NULL DEFAULT 'ANTHROPIC',
    "storeGeneratedQuestions" BOOLEAN NOT NULL DEFAULT true,
    "provideRealTimeFeedback" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuntimeGenerationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuntimeGeneratedQuestion" (
    "id" TEXT NOT NULL,
    "assessmentSessionId" TEXT NOT NULL,
    "respondentId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "competencyArea" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "presentedAt" TIMESTAMP(3),
    "answeredAt" TIMESTAMP(3),
    "userResponse" TEXT,
    "isCorrect" BOOLEAN,
    "score" DOUBLE PRECISION,
    "aiJustification" TEXT,
    "feedback" TEXT,
    "adaptiveContext" JSONB NOT NULL,

    CONSTRAINT "RuntimeGeneratedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT NOT NULL,
    "overallLevel" "ProficiencyLevel" NOT NULL DEFAULT 'JUNIOR',
    "department" TEXT,
    "industries" "Industry"[],
    "keyResponsibilities" TEXT,
    "requiredExperience" TEXT,
    "educationRequired" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "CompetencyCategory" NOT NULL DEFAULT 'TECHNICAL',
    "industries" "Industry"[],
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "tenantId" TEXT,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyIndicator" (
    "id" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "level" "ProficiencyLevel" NOT NULL,
    "type" "IndicatorType" NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleCompetency" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "requiredLevel" "ProficiencyLevel" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_employeeId_idx" ON "User"("employeeId");

-- CreateIndex
CREATE INDEX "User_clientId_idx" ON "User"("clientId");

-- CreateIndex
CREATE INDEX "User_accountType_idx" ON "User"("accountType");

-- CreateIndex
CREATE UNIQUE INDEX "AssessorProfile_userId_key" ON "AssessorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentComponent_slug_key" ON "AssessmentComponent"("slug");

-- CreateIndex
CREATE INDEX "ComponentIndicatorLink_componentId_idx" ON "ComponentIndicatorLink"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentIndicatorLink_componentId_indicatorId_key" ON "ComponentIndicatorLink"("componentId", "indicatorId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyComponentMapping_competencyId_componentId_key" ON "CompetencyComponentMapping"("competencyId", "componentId");

-- CreateIndex
CREATE INDEX "ComponentQuestion_componentId_idx" ON "ComponentQuestion"("componentId");

-- CreateIndex
CREATE INDEX "ComponentPrerequisite_componentId_idx" ON "ComponentPrerequisite"("componentId");

-- CreateIndex
CREATE INDEX "ComponentPrerequisite_prerequisiteId_idx" ON "ComponentPrerequisite"("prerequisiteId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentPrerequisite_componentId_prerequisiteId_key" ON "ComponentPrerequisite"("componentId", "prerequisiteId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentModel_slug_key" ON "AssessmentModel"("slug");

-- CreateIndex
CREATE INDEX "AssessmentModelComponent_modelId_idx" ON "AssessmentModelComponent"("modelId");

-- CreateIndex
CREATE INDEX "AssessmentModelComponent_componentId_idx" ON "AssessmentModelComponent"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentModelComponent_modelId_componentId_key" ON "AssessmentModelComponent"("modelId", "componentId");

-- CreateIndex
CREATE INDEX "UserAssessmentModel_userId_idx" ON "UserAssessmentModel"("userId");

-- CreateIndex
CREATE INDEX "UserAssessmentModel_modelId_idx" ON "UserAssessmentModel"("modelId");

-- CreateIndex
CREATE INDEX "UserAssessmentModel_status_idx" ON "UserAssessmentModel"("status");

-- CreateIndex
CREATE INDEX "UserAssessmentModel_assignmentType_idx" ON "UserAssessmentModel"("assignmentType");

-- CreateIndex
CREATE INDEX "ProjectAssessmentModel_projectId_idx" ON "ProjectAssessmentModel"("projectId");

-- CreateIndex
CREATE INDEX "ProjectAssessmentModel_modelId_idx" ON "ProjectAssessmentModel"("modelId");

-- CreateIndex
CREATE INDEX "ProjectAssessmentModel_assignmentLevel_idx" ON "ProjectAssessmentModel"("assignmentLevel");

-- CreateIndex
CREATE INDEX "ProjectAssessmentModel_departmentId_idx" ON "ProjectAssessmentModel"("departmentId");

-- CreateIndex
CREATE INDEX "ProjectAssessmentModel_managerId_idx" ON "ProjectAssessmentModel"("managerId");

-- CreateIndex
CREATE INDEX "ProjectUserAssessment_projectAssignmentId_idx" ON "ProjectUserAssessment"("projectAssignmentId");

-- CreateIndex
CREATE INDEX "ProjectUserAssessment_userId_idx" ON "ProjectUserAssessment"("userId");

-- CreateIndex
CREATE INDEX "ProjectUserAssessment_status_idx" ON "ProjectUserAssessment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectUserAssessment_projectAssignmentId_userId_attemptNum_key" ON "ProjectUserAssessment"("projectAssignmentId", "userId", "attemptNumber");

-- CreateIndex
CREATE INDEX "UserAssessmentComponent_componentId_idx" ON "UserAssessmentComponent"("componentId");

-- CreateIndex
CREATE INDEX "UserAssessmentComponent_userAssessmentModelId_idx" ON "UserAssessmentComponent"("userAssessmentModelId");

-- CreateIndex
CREATE INDEX "UserAssessmentComponent_projectUserAssessmentId_idx" ON "UserAssessmentComponent"("projectUserAssessmentId");

-- CreateIndex
CREATE INDEX "UserAssessmentComponent_status_idx" ON "UserAssessmentComponent"("status");

-- CreateIndex
CREATE INDEX "ComponentQuestionResponse_userComponentId_idx" ON "ComponentQuestionResponse"("userComponentId");

-- CreateIndex
CREATE INDEX "ComponentQuestionResponse_questionId_idx" ON "ComponentQuestionResponse"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_email_key" ON "Tenant"("email");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_type_idx" ON "Tenant"("type");

-- CreateIndex
CREATE INDEX "Tenant_isActive_idx" ON "Tenant"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSettings_tenantId_key" ON "TenantSettings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_tenantId_idx" ON "Member"("tenantId");

-- CreateIndex
CREATE INDEX "Member_type_idx" ON "Member"("type");

-- CreateIndex
CREATE INDEX "Member_role_idx" ON "Member"("role");

-- CreateIndex
CREATE INDEX "Member_orgUnitId_idx" ON "Member"("orgUnitId");

-- CreateIndex
CREATE INDEX "Member_email_idx" ON "Member"("email");

-- CreateIndex
CREATE INDEX "OrganizationUnit_tenantId_idx" ON "OrganizationUnit"("tenantId");

-- CreateIndex
CREATE INDEX "OrganizationUnit_type_idx" ON "OrganizationUnit"("type");

-- CreateIndex
CREATE INDEX "OrganizationUnit_parentId_idx" ON "OrganizationUnit"("parentId");

-- CreateIndex
CREATE INDEX "OrganizationUnit_managerId_idx" ON "OrganizationUnit"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationUnit_tenantId_code_key" ON "OrganizationUnit"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Activity_tenantId_idx" ON "Activity"("tenantId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_status_idx" ON "Activity"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_tenantId_slug_key" ON "Activity"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "ActivityMember_activityId_idx" ON "ActivityMember"("activityId");

-- CreateIndex
CREATE INDEX "ActivityMember_memberId_idx" ON "ActivityMember"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityMember_activityId_memberId_key" ON "ActivityMember"("activityId", "memberId");

-- CreateIndex
CREATE INDEX "ActivityOrgUnit_activityId_idx" ON "ActivityOrgUnit"("activityId");

-- CreateIndex
CREATE INDEX "ActivityOrgUnit_orgUnitId_idx" ON "ActivityOrgUnit"("orgUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityOrgUnit_activityId_orgUnitId_key" ON "ActivityOrgUnit"("activityId", "orgUnitId");

-- CreateIndex
CREATE INDEX "MemberAssessment_memberId_idx" ON "MemberAssessment"("memberId");

-- CreateIndex
CREATE INDEX "MemberAssessment_activityId_idx" ON "MemberAssessment"("activityId");

-- CreateIndex
CREATE INDEX "MemberAssessment_status_idx" ON "MemberAssessment"("status");

-- CreateIndex
CREATE INDEX "ActivityAssessment_activityId_idx" ON "ActivityAssessment"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_slug_idx" ON "Client"("slug");

-- CreateIndex
CREATE INDEX "Client_isActive_idx" ON "Client"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ClientSettings_clientId_key" ON "ClientSettings"("clientId");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Project_clientId_slug_key" ON "Project"("clientId", "slug");

-- CreateIndex
CREATE INDEX "Department_projectId_idx" ON "Department"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_projectId_code_key" ON "Department"("projectId", "code");

-- CreateIndex
CREATE INDEX "ProjectManager_projectId_idx" ON "ProjectManager"("projectId");

-- CreateIndex
CREATE INDEX "ProjectManager_userId_idx" ON "ProjectManager"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectManager_userId_projectId_key" ON "ProjectManager"("userId", "projectId");

-- CreateIndex
CREATE INDEX "DepartmentManager_managerId_idx" ON "DepartmentManager"("managerId");

-- CreateIndex
CREATE INDEX "DepartmentManager_departmentId_idx" ON "DepartmentManager"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentManager_managerId_departmentId_key" ON "DepartmentManager"("managerId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "RuntimeGenerationConfig_componentId_key" ON "RuntimeGenerationConfig"("componentId");

-- CreateIndex
CREATE INDEX "RuntimeGeneratedQuestion_assessmentSessionId_idx" ON "RuntimeGeneratedQuestion"("assessmentSessionId");

-- CreateIndex
CREATE INDEX "RuntimeGeneratedQuestion_respondentId_idx" ON "RuntimeGeneratedQuestion"("respondentId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_name_key" ON "Competency"("name");

-- CreateIndex
CREATE INDEX "CompetencyIndicator_competencyId_level_type_idx" ON "CompetencyIndicator"("competencyId", "level", "type");

-- CreateIndex
CREATE INDEX "CompetencyIndicator_competencyId_level_idx" ON "CompetencyIndicator"("competencyId", "level");

-- CreateIndex
CREATE INDEX "RoleCompetency_roleId_idx" ON "RoleCompetency"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleCompetency_roleId_competencyId_key" ON "RoleCompetency"("roleId", "competencyId");

-- CreateIndex
CREATE INDEX "Course_category_status_idx" ON "Course"("category", "status");

-- CreateIndex
CREATE INDEX "Course_categoryType_idx" ON "Course"("categoryType");

-- CreateIndex
CREATE INDEX "Course_targetLevel_idx" ON "Course"("targetLevel");

-- CreateIndex
CREATE INDEX "Course_courseType_idx" ON "Course"("courseType");

-- CreateIndex
CREATE INDEX "FinishingSchool_categoryType_idx" ON "FinishingSchool"("categoryType");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assignedRoleId_fkey" FOREIGN KEY ("assignedRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessorProfile" ADD CONSTRAINT "AssessorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentComponent" ADD CONSTRAINT "AssessmentComponent_sourceCompetencyId_fkey" FOREIGN KEY ("sourceCompetencyId") REFERENCES "Competency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentIndicatorLink" ADD CONSTRAINT "ComponentIndicatorLink_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentIndicatorLink" ADD CONSTRAINT "ComponentIndicatorLink_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "CompetencyIndicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyComponentMapping" ADD CONSTRAINT "CompetencyComponentMapping_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyComponentMapping" ADD CONSTRAINT "CompetencyComponentMapping_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentQuestion" ADD CONSTRAINT "ComponentQuestion_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentPrerequisite" ADD CONSTRAINT "ComponentPrerequisite_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentPrerequisite" ADD CONSTRAINT "ComponentPrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "AssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModel" ADD CONSTRAINT "AssessmentModel_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModel" ADD CONSTRAINT "AssessmentModel_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModelComponent" ADD CONSTRAINT "AssessmentModelComponent_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModelComponent" ADD CONSTRAINT "AssessmentModelComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessmentModel" ADD CONSTRAINT "UserAssessmentModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessmentModel" ADD CONSTRAINT "UserAssessmentModel_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssessmentModel" ADD CONSTRAINT "ProjectAssessmentModel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssessmentModel" ADD CONSTRAINT "ProjectAssessmentModel_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssessmentModel" ADD CONSTRAINT "ProjectAssessmentModel_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssessmentModel" ADD CONSTRAINT "ProjectAssessmentModel_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "ProjectManager"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUserAssessment" ADD CONSTRAINT "ProjectUserAssessment_projectAssignmentId_fkey" FOREIGN KEY ("projectAssignmentId") REFERENCES "ProjectAssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUserAssessment" ADD CONSTRAINT "ProjectUserAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessmentComponent" ADD CONSTRAINT "UserAssessmentComponent_userAssessmentModelId_fkey" FOREIGN KEY ("userAssessmentModelId") REFERENCES "UserAssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessmentComponent" ADD CONSTRAINT "UserAssessmentComponent_projectUserAssessmentId_fkey" FOREIGN KEY ("projectUserAssessmentId") REFERENCES "ProjectUserAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessmentComponent" ADD CONSTRAINT "UserAssessmentComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentQuestionResponse" ADD CONSTRAINT "ComponentQuestionResponse_userComponentId_fkey" FOREIGN KEY ("userComponentId") REFERENCES "UserAssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentQuestionResponse" ADD CONSTRAINT "ComponentQuestionResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ComponentQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityMember" ADD CONSTRAINT "ActivityMember_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityMember" ADD CONSTRAINT "ActivityMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityOrgUnit" ADD CONSTRAINT "ActivityOrgUnit_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityOrgUnit" ADD CONSTRAINT "ActivityOrgUnit_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAssessment" ADD CONSTRAINT "MemberAssessment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAssessment" ADD CONSTRAINT "MemberAssessment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAssessment" ADD CONSTRAINT "ActivityAssessment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSettings" ADD CONSTRAINT "ClientSettings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectManager" ADD CONSTRAINT "ProjectManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectManager" ADD CONSTRAINT "ProjectManager_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentManager" ADD CONSTRAINT "DepartmentManager_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "ProjectManager"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentManager" ADD CONSTRAINT "DepartmentManager_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuntimeGenerationConfig" ADD CONSTRAINT "RuntimeGenerationConfig_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyIndicator" ADD CONSTRAINT "CompetencyIndicator_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCompetency" ADD CONSTRAINT "RoleCompetency_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCompetency" ADD CONSTRAINT "RoleCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

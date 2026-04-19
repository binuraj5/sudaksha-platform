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
CREATE TYPE "DeliveryMode" AS ENUM ('ONLINE_LIVE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "CategoryPrimary" AS ENUM ('IT', 'NON_IT', 'FUNCTIONAL', 'PERSONAL_DEVELOPMENT', 'INDUSTRY_SPECIFIC');

-- CreateEnum
CREATE TYPE "TargetAudienceDisplay" AS ENUM ('FRESHERS', 'JUNIOR', 'MID', 'SENIOR', 'LEADERSHIP', 'CAREER_SWITCHER', 'ALL_LEVELS');

-- CreateEnum
CREATE TYPE "CourseTypeDisplay" AS ENUM ('PREMADE', 'CURATED', 'CUSTOM', 'FINISHING_SCHOOL');

-- CreateEnum
CREATE TYPE "BatchTypeDisplay" AS ENUM ('WEEKDAY', 'WEEKEND', 'INTENSIVE', 'FLEXIBLE', 'SELF_PACED');

-- CreateEnum
CREATE TYPE "CourseStatusDisplay" AS ENUM ('ACTIVE', 'INACTIVE', 'COMING_SOON', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('THEORY', 'HANDS_ON', 'PROJECT', 'ASSESSMENT', 'LIVE_DEMO');

-- CreateEnum
CREATE TYPE "PrerequisiteType" AS ENUM ('MANDATORY', 'RECOMMENDED', 'GOOD_TO_HAVE');

-- CreateEnum
CREATE TYPE "IndustryVertical" AS ENUM ('FINTECH', 'ECOMMERCE', 'HEALTHCARE', 'PHARMA', 'LOGISTICS', 'EDTECH', 'GOVERNMENT', 'DEFENCE', 'AVIATION', 'TRAVEL', 'RETAIL', 'REAL_ESTATE');

-- CreateEnum
CREATE TYPE "CourseMediaType" AS ENUM ('IMAGE', 'VIDEO', 'BROCHURE', 'SAMPLE_PROJECT', 'CURRICULUM_PDF');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BatchDeliveryMode" AS ENUM ('LIVE_ONLINE', 'CLASSROOM', 'HYBRID');

-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('DELIVERY', 'MATERIALS', 'SUPPORT', 'ACCESS', 'CERTIFICATION', 'EXTRAS');

-- CreateEnum
CREATE TYPE "DeliverableType" AS ENUM ('PROJECT', 'CASE_STUDY', 'PROCESS_DOCUMENT', 'DEVELOPMENT_PLAN', 'ASSESSMENT', 'TOOLKIT', 'FRAMEWORK');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('PREREQUISITE', 'NEXT_STEP', 'COMPLEMENTARY', 'ALTERNATIVE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('CONFIRMED', 'WAITLIST', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('CONTACT_FORM', 'ENROLLMENT_INQUIRY', 'LIVE_CHAT', 'NEWSLETTER', 'OTHER');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('PENDING', 'READ', 'RESPONDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WebinarStatus" AS ENUM ('UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'CLIENT_ADMIN', 'CLIENT_USER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'CLIENT_ADMIN', 'PROJECT_MANAGER', 'MANAGER', 'ASSESSOR', 'ADMIN', 'DEPT_HEAD', 'TEAM_LEAD', 'EMPLOYEE', 'INDIVIDUAL');

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
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'CODING_CHALLENGE', 'ESSAY', 'SCENARIO_BASED', 'VIDEO_RESPONSE', 'FILE_UPLOAD', 'DRAG_DROP', 'MATCHING', 'FILL_IN_BLANK', 'VOICE_RESPONSE');

-- CreateEnum
CREATE TYPE "ModelSourceType" AS ENUM ('ROLE_BASED', 'COMPETENCY_BASED', 'CUSTOM', 'TEMPLATE');

-- CreateEnum
CREATE TYPE "ModelVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RoleVisibility" AS ENUM ('UNIVERSAL', 'TENANT_SPECIFIC');

-- CreateEnum
CREATE TYPE "CreatorType" AS ENUM ('SYSTEM', 'CLIENT_ADMIN', 'AI_GENERATED');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('SELF_SELECTED', 'RECOMMENDED', 'ASSIGNED');

-- CreateEnum
CREATE TYPE "AssignmentLevel" AS ENUM ('PROJECT', 'DEPARTMENT', 'MANAGER', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'SUBMITTED', 'UNDER_REVIEW', 'REVIEWED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('CORPORATE', 'INSTITUTION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('EMPLOYEE', 'STUDENT', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'ASSESSOR', 'DEPT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER', 'EMPLOYEE', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('DEPARTMENT', 'TEAM', 'COLLEGE', 'COURSE_UNIT', 'CLASS', 'DIVISION');

-- CreateEnum
CREATE TYPE "CurriculumType" AS ENUM ('PROGRAM', 'DEGREE', 'SEMESTER', 'DEPARTMENT', 'SUBJECT', 'TOPIC');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PROJECT', 'CURRICULUM', 'BOOTCAMP', 'INITIATIVE', 'COURSE');

-- CreateEnum
CREATE TYPE "CourseDivision" AS ENUM ('SEMESTER', 'YEAR', 'BOTH');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED', 'PLANNED', 'ON_HOLD');

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

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('ROLE', 'COMPETENCY', 'ASSESSMENT_REQUEST');

-- CreateEnum
CREATE TYPE "SurveyQuestionType" AS ENUM ('LIKERT', 'MCQ', 'MSQ', 'RATING', 'TEXT', 'NPS', 'SLIDER', 'DATE', 'YES_NO');

-- CreateEnum
CREATE TYPE "SurveyTargetType" AS ENUM ('ALL', 'DEPARTMENT', 'TEAM', 'ROLE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('STARTER', 'GROWTH', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('SUPER_ADMIN', 'TENANT', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'INVITED');

-- CreateEnum
CREATE TYPE "HeroBgType" AS ENUM ('COLOR', 'IMAGE', 'GRADIENT');

-- CreateEnum
CREATE TYPE "HeroTextTheme" AS ENUM ('LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('INFO', 'PROMOTIONAL', 'URGENT', 'SUCCESS');

-- CreateEnum
CREATE TYPE "OfflineDeliveryMode" AS ENUM ('ONSITE', 'OFFSITE', 'HYBRID');

-- CreateEnum
CREATE TYPE "OfflineBatchStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('STARTUP', 'SME', 'ENTERPRISE', 'GOVERNMENT');

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
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "availableForCourses" JSONB,
    "certifications" JSONB,
    "currentCompany" TEXT,
    "currentDesignation" TEXT,
    "firstName" TEXT,
    "industriesWorked" JSONB,
    "lastName" TEXT,
    "preferredBatchTypes" JSONB,
    "primaryExpertise" JSONB,
    "profileImageUrl" TEXT,
    "secondaryExpertise" JSONB,
    "title" TEXT,
    "totalIndustryExperienceYears" INTEGER,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "totalStudentsTaught" INTEGER NOT NULL DEFAULT 0,
    "totalTeachingExperienceYears" INTEGER,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deliveryMode" "BatchMode" NOT NULL DEFAULT 'ONLINE',
    "industry" TEXT NOT NULL DEFAULT 'Generic/All Industries',
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
    "trainerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "prerequisites" TEXT,
    "certificateProvider" TEXT,
    "certificateType" TEXT,
    "corporateAvailable" BOOLEAN NOT NULL DEFAULT false,
    "cpeCredits" DECIMAL(65,30),
    "customizationAvailable" BOOLEAN NOT NULL DEFAULT false,
    "durationDays" INTEGER,
    "durationHours" DECIMAL(65,30),
    "durationWeeks" INTEGER,
    "hasCaseStudies" BOOLEAN NOT NULL DEFAULT false,
    "hasPersonalActivities" BOOLEAN NOT NULL DEFAULT false,
    "hasProcessFrameworks" BOOLEAN NOT NULL DEFAULT false,
    "hasProjects" BOOLEAN NOT NULL DEFAULT false,
    "industryRecognition" TEXT,
    "maxBatchSize" INTEGER,
    "minBatchSize" INTEGER,
    "newDeliveryModes" "DeliveryMode"[],
    "onsiteAvailable" BOOLEAN NOT NULL DEFAULT false,
    "prerequisiteText" TEXT,
    "publishedAt" TIMESTAMP(3),
    "requiredExperience" TEXT,
    "sessionsPerWeek" INTEGER,
    "subCategory" TEXT,
    "targetAudience" TEXT,
    "targetRoles" TEXT[],
    "technicalRequirements" TEXT,
    "title" TEXT,
    "category" TEXT NOT NULL,
    "categoryType" TEXT NOT NULL,
    "targetLevel" TEXT NOT NULL,
    "courseType" TEXT NOT NULL,
    "assessmentsJson" JSONB,
    "averagePlacementRate" DECIMAL(65,30),
    "averageSalaryHikePercent" DECIMAL(65,30),
    "averageSalaryMax" DECIMAL(65,30),
    "averageSalaryMin" DECIMAL(65,30),
    "basePrice" DECIMAL(65,30),
    "batchType" "BatchTypeDisplay",
    "capstoneProjectDescription" TEXT,
    "capstoneProjectDurationHours" INTEGER,
    "capstoneProjectTitle" TEXT,
    "careerPaths" JSONB,
    "categoryPrimary" "CategoryPrimary",
    "categorySecondary" TEXT,
    "certificationName" TEXT,
    "classDurationMinutes" INTEGER,
    "courseCode" TEXT,
    "courseTypeDisplay" "CourseTypeDisplay",
    "currency" TEXT DEFAULT 'INR',
    "currentBatchEnrolled" INTEGER NOT NULL DEFAULT 0,
    "deliveryModeJson" JSONB,
    "discountedPrice" DECIMAL(65,30),
    "earlyBirdDiscount" DECIMAL(65,30),
    "emiAvailable" BOOLEAN NOT NULL DEFAULT false,
    "emiOptions" JSONB,
    "experienceRequired" TEXT,
    "featuredOrder" INTEGER,
    "finishingSchoolProgram" BOOLEAN NOT NULL DEFAULT false,
    "groupDiscount" DECIMAL(65,30),
    "hoursPerWeek" INTEGER,
    "industrySpecific" BOOLEAN NOT NULL DEFAULT false,
    "industryVertical" JSONB,
    "isCorporateOnly" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isIndividualAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "lmsCourseId" TEXT,
    "lmsLastSyncAt" TIMESTAMP(3),
    "longDescription" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" JSONB,
    "metaTitle" TEXT,
    "miniProjects" JSONB,
    "miniProjectsCount" INTEGER,
    "ogImageUrl" TEXT,
    "overallRating" DECIMAL(65,30),
    "placementSupport" BOOLEAN NOT NULL DEFAULT false,
    "prerequisiteSkills" JSONB,
    "primaryTrainerId" TEXT,
    "ratingDistribution" JSONB,
    "scheduleDetails" JSONB,
    "skillsGained" JSONB,
    "statusDisplay" "CourseStatusDisplay",
    "targetAudienceDisplay" "TargetAudienceDisplay",
    "technologyDomain" TEXT,
    "toolsCovered" JSONB,
    "topHiringCompanies" JSONB,
    "totalClasses" INTEGER,
    "totalDurationWeeks" INTEGER,
    "totalHours" INTEGER,
    "totalLessons" INTEGER,
    "totalModules" INTEGER,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "totalStudentsTrained" INTEGER NOT NULL DEFAULT 0,
    "trainerExperienceRequired" TEXT,
    "trainerPool" JSONB,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinishingSchool" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "industry" TEXT NOT NULL DEFAULT 'Generic/All Industries',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryType" TEXT NOT NULL,

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
    "handsOnLabs" JSONB,
    "learningObjectives" JSONB,
    "moduleDescription" TEXT,
    "moduleDurationHours" INTEGER,
    "moduleNumber" INTEGER,
    "moduleTitle" TEXT,
    "topicsCovered" JSONB,

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
    "lessonDescription" TEXT,
    "lessonDurationMinutes" INTEGER,
    "lessonNumber" INTEGER,
    "lessonTitle" TEXT,
    "lessonType" "LessonType",
    "resources" JSONB,

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
    "assignedTrainerId" TEXT,
    "batchCode" TEXT,
    "batchType" "BatchTypeDisplay",
    "classroomLocation" TEXT,
    "deliveryMode" "BatchDeliveryMode",
    "enrolledStudents" INTEGER NOT NULL DEFAULT 0,
    "onlinePlatform" TEXT,
    "scheduleDetails" JSONB,
    "timezone" TEXT DEFAULT 'IST',
    "waitlistCount" INTEGER NOT NULL DEFAULT 0,

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
    "batchId" TEXT,
    "cons" TEXT,
    "contentQualityRating" INTEGER,
    "courseCompletedDate" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "placementSupportRating" INTEGER,
    "pros" TEXT,
    "reviewDate" TIMESTAMP(3),
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewText" TEXT,
    "reviewTitle" TEXT,
    "studentCompany" TEXT,
    "studentDesignation" TEXT,
    "studentId" TEXT,
    "studentPhotoUrl" TEXT,
    "supportRating" INTEGER,
    "trainerRating" INTEGER,
    "valueForMoneyRating" INTEGER,

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Communication" (
    "id" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "CommunicationStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT,
    "recipients" JSONB,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stats" JSONB,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

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
    "entityName" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "userName" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("idEntity")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorImage" TEXT,
    "category" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "imageUrl" TEXT,
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "readTime" INTEGER NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webinar" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "speakerBio" TEXT,
    "speakerImage" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'IST',
    "imageUrl" TEXT,
    "meetingUrl" TEXT,
    "recordingUrl" TEXT,
    "status" "WebinarStatus" NOT NULL DEFAULT 'UPCOMING',
    "maxAttendees" INTEGER,
    "registeredCount" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "tags" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webinar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebinarRegistration" (
    "id" TEXT NOT NULL,
    "webinarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebinarRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "formName" TEXT,
    "pageUrl" TEXT NOT NULL,
    "pageName" TEXT,
    "formData" JSONB NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "sessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningOutcome" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "batchName" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "sessionTimings" TEXT,
    "platform" TEXT,
    "recordingAccess" INTEGER,
    "timezone" TEXT,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "facilities" TEXT[],
    "availableSeats" INTEGER NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "registrationDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseInstructor" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "yearsExperience" INTEGER,
    "industryExperience" TEXT[],
    "expertise" TEXT[],
    "certifications" TEXT[],
    "education" TEXT,
    "companiesWorked" TEXT[],
    "linkedinUrl" TEXT,
    "websiteUrl" TEXT,
    "totalStudentsTaught" INTEGER,
    "totalCoursesDelivered" INTEGER,
    "averageRating" DECIMAL(65,30),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseInstructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseFeature" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL,
    "category" "FeatureCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "DeliverableType" NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatedCourse" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "relatedCourseId" TEXT NOT NULL,
    "relationType" "RelationType" NOT NULL,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelatedCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "amountPaid" DECIMAL(65,30),
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterIndustry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterIndustry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterDepartment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterCourseType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterCourseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterDomain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterDomain_pkey" PRIMARY KEY ("id")
);

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
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockoutUntil" TIMESTAMP(3),
    "userType" "UserType" NOT NULL DEFAULT 'TENANT',

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
CREATE TABLE "ComponentQuestion" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "timeLimit" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "correctAnswer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "linkedIndicators" TEXT[],
    "explanation" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ComponentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sourceType" "ModelSourceType" NOT NULL DEFAULT 'ROLE_BASED',
    "roleId" TEXT,
    "targetLevel" "ProficiencyLevel" DEFAULT 'JUNIOR',
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "clientId" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "code" TEXT NOT NULL,
    "passingScore" INTEGER DEFAULT 60,
    "durationMinutes" INTEGER,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false,
    "showResultsImmediately" BOOLEAN NOT NULL DEFAULT true,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "publishedAt" TIMESTAMP(3),
    "publishedToGlobal" BOOLEAN NOT NULL DEFAULT false,
    "globalPublishStatus" TEXT,
    "globalPublishRequestedBy" TEXT,
    "globalPublishRequestedAt" TIMESTAMP(3),
    "globalPublishApprovedBy" TEXT,
    "globalPublishApprovedAt" TIMESTAMP(3),
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AssessmentModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentModelComponent" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isTimed" BOOLEAN NOT NULL DEFAULT true,
    "customDuration" INTEGER,
    "difficultyAdaptation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "competencyId" TEXT,
    "indicatorIds" TEXT[],
    "targetLevel" "ProficiencyLevel",
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isFromLibrary" BOOLEAN NOT NULL DEFAULT false,
    "libraryComponentId" TEXT,
    "componentType" TEXT NOT NULL DEFAULT 'QUESTIONNAIRE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "estimatedDuration" INTEGER,
    "config" JSONB,

    CONSTRAINT "AssessmentModelComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAssessmentModel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "assignmentType" "AssignmentType" NOT NULL DEFAULT 'SELF_SELECTED',
    "assignedBy" TEXT,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
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
    "lastActivityAt" TIMESTAMP(3),
    "sessionToken" TEXT,
    "checkpointData" JSONB,
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
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
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
    "metadata" JSONB,
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
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
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
    "sectionIndex" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "sectionError" TEXT,
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
    "features" JSONB,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'STARTER',

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
    "city" TEXT,
    "country" TEXT,
    "description" TEXT,
    "district" TEXT,
    "lineOfBusiness" TEXT,
    "phone" TEXT,
    "state" TEXT,
    "timezone" TEXT,
    "website" TEXT,

    CONSTRAINT "TenantSettings_pkey" PRIMARY KEY ("id")
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
    "profileType" TEXT NOT NULL DEFAULT 'FULL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aspirationalRoleId" TEXT,
    "careerFormData" JSONB,
    "currentRoleId" TEXT,
    "previousRoles" JSONB,
    "selfAssignedCompetencies" JSONB,
    "enrollmentNumber" TEXT,
    "employeeId" TEXT,
    "hasGraduated" BOOLEAN NOT NULL DEFAULT false,
    "graduationDate" DATE,
    "facultyType" TEXT,
    "designation" TEXT,
    "developmentPlan" JSONB,
    "firstName" TEXT,
    "invitationAcceptedAt" TIMESTAMP(3),
    "invitationSentAt" TIMESTAMP(3),
    "invitationToken" TEXT,
    "joiningDate" TIMESTAMP(3),
    "lastName" TEXT,
    "memberCode" TEXT,
    "metadata" JSONB,
    "reportingToId" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDING',

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
    "isActive" BOOLEAN NOT NULL DEFAULT true,

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
    "yearBegin" INTEGER,
    "yearEnd" INTEGER,
    "division" "CourseDivision",
    "semesterCount" INTEGER,
    "yearCount" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "code" TEXT NOT NULL DEFAULT 'PROJ001',
    "metadata" JSONB,
    "ownerId" TEXT,

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
    "relationship" TEXT,

    CONSTRAINT "ActivityOrgUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumNode" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "CurriculumType" NOT NULL DEFAULT 'SUBJECT',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityCurriculum" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "curriculumNodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityCurriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberAssessment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "activityId" TEXT,
    "assessmentModelId" TEXT NOT NULL,
    "assignmentType" "AssignmentType" NOT NULL DEFAULT 'SELF_SELECTED',
    "assignedBy" TEXT,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
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
    "status" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectionReason" TEXT,
    "visibility" "RoleVisibility" NOT NULL DEFAULT 'TENANT_SPECIFIC',
    "allowedLevels" TEXT[] DEFAULT ARRAY['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT']::TEXT[],
    "createdByUserId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "departmentId" TEXT,
    "globalApprovedAt" TIMESTAMP(3),
    "globalApprovedBy" TEXT,
    "globalRejectionReason" TEXT,
    "globalSubmissionStatus" TEXT,
    "globalSubmittedAt" TIMESTAMP(3),
    "globalSubmittedBy" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'GLOBAL',
    "teamId" TEXT,

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
    "status" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
    "allowedLevels" TEXT[] DEFAULT ARRAY['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT']::TEXT[],
    "createdByUserId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "departmentId" TEXT,
    "globalApprovedAt" TIMESTAMP(3),
    "globalApprovedBy" TEXT,
    "globalRejectionReason" TEXT,
    "globalSubmissionStatus" TEXT,
    "globalSubmittedAt" TIMESTAMP(3),
    "globalSubmittedBy" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'GLOBAL',
    "teamId" TEXT,

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

-- CreateTable
CREATE TABLE "ComponentLibrary" (
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

-- CreateTable
CREATE TABLE "ComponentSuggestion" (
    "id" TEXT NOT NULL,
    "competencyCategory" TEXT NOT NULL,
    "targetLevel" TEXT NOT NULL,
    "suggestedType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComponentSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Panel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanelMember" (
    "id" TEXT NOT NULL,
    "panelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PanelMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanelInterview" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PanelInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanelEvaluation" (
    "id" TEXT NOT NULL,
    "panelInterviewId" TEXT NOT NULL,
    "panelistId" TEXT NOT NULL,
    "panelMemberId" TEXT,
    "scores" JSONB,
    "feedback" TEXT,
    "recommendation" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PanelEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdaptiveComponentLibrary" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdaptiveComponentLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdaptiveSession" (
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

-- CreateTable
CREATE TABLE "AdaptiveQuestion" (
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

-- CreateTable
CREATE TABLE "GlobalPublishRequest" (
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

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "ApprovalType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modificationNotes" TEXT,
    "modifiedData" JSONB,
    "originalData" JSONB,
    "rejectionReason" TEXT,
    "requesterId" TEXT,
    "reviewerId" TEXT,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleAssignmentRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requestedRoleName" TEXT NOT NULL,
    "description" TEXT,
    "totalExperienceYears" INTEGER NOT NULL,
    "context" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedRoleId" TEXT,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roleCreatedAt" TIMESTAMP(3),
    "departmentId" TEXT,
    "departmentOtherText" TEXT,
    "industryId" TEXT,
    "industryOtherText" TEXT,

    CONSTRAINT "RoleAssignmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyDevelopmentRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "CompetencyDevelopmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalHistory" (
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

-- CreateTable
CREATE TABLE "RecommendationRule" (
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

-- CreateTable
CREATE TABLE "RecommendationUsage" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "userId" TEXT,
    "context" JSONB,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "purpose" TEXT,
    "targetAudience" TEXT,
    "scoringEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scoringMethod" TEXT DEFAULT 'AVERAGE',
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "SurveyStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyQuestion" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "SurveyQuestionType" NOT NULL,
    "options" JSONB,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "points" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyAssignment" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "targetType" "SurveyTargetType" NOT NULL,
    "targetId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "reminderSettings" JSONB,

    CONSTRAINT "SurveyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "memberId" TEXT,
    "score" DOUBLE PRECISION,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyAnswer" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerData" JSONB NOT NULL,
    "points" DOUBLE PRECISION,

    CONSTRAINT "SurveyAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeSubmission" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "config" JSONB NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "memberId" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSchedule" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "recipients" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "twoFactorSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "HomepageHero" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "headline" TEXT NOT NULL,
    "subHeadline" TEXT,
    "badgeText" TEXT,
    "primaryCtaLabel" TEXT NOT NULL,
    "primaryCtaUrl" TEXT NOT NULL,
    "secondaryCtaLabel" TEXT,
    "secondaryCtaUrl" TEXT,
    "backgroundType" "HeroBgType" NOT NULL DEFAULT 'COLOR',
    "backgroundValue" TEXT,
    "overlayOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "textTheme" "HeroTextTheme" NOT NULL DEFAULT 'LIGHT',
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "type" "AnnouncementType" NOT NULL DEFAULT 'INFO',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfflineBatch" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "programTitle" TEXT NOT NULL,
    "programDescription" TEXT NOT NULL,
    "outcomes" TEXT,
    "skillsCovered" TEXT[],
    "durationDays" INTEGER,
    "durationHours" INTEGER,
    "clientName" TEXT,
    "clientCompanyDescription" TEXT,
    "clientIndustry" TEXT NOT NULL,
    "clientSize" "CompanySize",
    "clientLogoUrl" TEXT,
    "showClientName" BOOLEAN NOT NULL DEFAULT true,
    "clientContactName" TEXT,
    "clientContactEmail" TEXT,
    "clientContactPhone" TEXT,
    "participantCount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "deliveryMode" "OfflineDeliveryMode" NOT NULL DEFAULT 'ONSITE',
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "completionRate" INTEGER,
    "satisfactionScore" DECIMAL(65,30),
    "certificationIssued" BOOLEAN NOT NULL DEFAULT false,
    "participantTestimonial" TEXT,
    "testimonialAuthor" TEXT,
    "testimonialDesig" TEXT,
    "status" "OfflineBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "featuredOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfflineBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseCode_key" ON "Course"("courseCode");

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
CREATE INDEX "FinishingSchool_categoryType_idx" ON "FinishingSchool"("categoryType");

-- CreateIndex
CREATE INDEX "FinishingSchool_industry_idx" ON "FinishingSchool"("industry");

-- CreateIndex
CREATE INDEX "CourseModule_courseId_idx" ON "CourseModule"("courseId");

-- CreateIndex
CREATE INDEX "CourseModule_order_idx" ON "CourseModule"("order");

-- CreateIndex
CREATE INDEX "CourseModule_courseId_moduleNumber_idx" ON "CourseModule"("courseId", "moduleNumber");

-- CreateIndex
CREATE INDEX "CourseLesson_moduleId_idx" ON "CourseLesson"("moduleId");

-- CreateIndex
CREATE INDEX "CourseLesson_order_idx" ON "CourseLesson"("order");

-- CreateIndex
CREATE INDEX "CourseLesson_moduleId_lessonNumber_idx" ON "CourseLesson"("moduleId", "lessonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CourseBatch_batchCode_key" ON "CourseBatch"("batchCode");

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
CREATE INDEX "CourseBatch_courseId_status_idx" ON "CourseBatch"("courseId", "status");

-- CreateIndex
CREATE INDEX "CourseReview_courseId_idx" ON "CourseReview"("courseId");

-- CreateIndex
CREATE INDEX "CourseReview_rating_idx" ON "CourseReview"("rating");

-- CreateIndex
CREATE INDEX "CourseReview_createdAt_idx" ON "CourseReview"("createdAt");

-- CreateIndex
CREATE INDEX "CourseReview_courseId_reviewStatus_idx" ON "CourseReview"("courseId", "reviewStatus");

-- CreateIndex
CREATE INDEX "CourseReview_isFeatured_rating_idx" ON "CourseReview"("isFeatured", "rating");

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
CREATE INDEX "Communication_type_idx" ON "Communication"("type");

-- CreateIndex
CREATE INDEX "Communication_status_idx" ON "Communication"("status");

-- CreateIndex
CREATE INDEX "Communication_email_idx" ON "Communication"("email");

-- CreateIndex
CREATE INDEX "Communication_createdAt_idx" ON "Communication"("createdAt");

-- CreateIndex
CREATE INDEX "Communication_campaignId_idx" ON "Communication"("campaignId");

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
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_status_publishedAt_idx" ON "Blog"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Blog_category_idx" ON "Blog"("category");

-- CreateIndex
CREATE INDEX "Blog_featured_idx" ON "Blog"("featured");

-- CreateIndex
CREATE INDEX "Blog_slug_idx" ON "Blog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Webinar_slug_key" ON "Webinar"("slug");

-- CreateIndex
CREATE INDEX "Webinar_status_date_idx" ON "Webinar"("status", "date");

-- CreateIndex
CREATE INDEX "Webinar_featured_idx" ON "Webinar"("featured");

-- CreateIndex
CREATE INDEX "Webinar_slug_idx" ON "Webinar"("slug");

-- CreateIndex
CREATE INDEX "Webinar_date_idx" ON "Webinar"("date");

-- CreateIndex
CREATE INDEX "WebinarRegistration_webinarId_idx" ON "WebinarRegistration"("webinarId");

-- CreateIndex
CREATE INDEX "WebinarRegistration_email_idx" ON "WebinarRegistration"("email");

-- CreateIndex
CREATE INDEX "WebinarRegistration_createdAt_idx" ON "WebinarRegistration"("createdAt");

-- CreateIndex
CREATE INDEX "FormSubmission_formType_idx" ON "FormSubmission"("formType");

-- CreateIndex
CREATE INDEX "FormSubmission_status_idx" ON "FormSubmission"("status");

-- CreateIndex
CREATE INDEX "FormSubmission_createdAt_idx" ON "FormSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "FormSubmission_pageUrl_idx" ON "FormSubmission"("pageUrl");

-- CreateIndex
CREATE INDEX "LearningOutcome_courseId_idx" ON "LearningOutcome"("courseId");

-- CreateIndex
CREATE INDEX "Batch_courseId_idx" ON "Batch"("courseId");

-- CreateIndex
CREATE INDEX "Batch_startDate_idx" ON "Batch"("startDate");

-- CreateIndex
CREATE INDEX "CourseInstructor_courseId_idx" ON "CourseInstructor"("courseId");

-- CreateIndex
CREATE INDEX "CourseFeature_courseId_idx" ON "CourseFeature"("courseId");

-- CreateIndex
CREATE INDEX "Deliverable_courseId_idx" ON "Deliverable"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "RelatedCourse_courseId_relatedCourseId_key" ON "RelatedCourse"("courseId", "relatedCourseId");

-- CreateIndex
CREATE INDEX "Enrollment_batchId_idx" ON "Enrollment"("batchId");

-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterCategory_name_key" ON "MasterCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterCategory_slug_key" ON "MasterCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MasterIndustry_name_key" ON "MasterIndustry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterIndustry_slug_key" ON "MasterIndustry"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MasterDepartment_name_key" ON "MasterDepartment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterDepartment_slug_key" ON "MasterDepartment"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MasterCourseType_name_key" ON "MasterCourseType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterCourseType_slug_key" ON "MasterCourseType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MasterLevel_name_key" ON "MasterLevel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterLevel_slug_key" ON "MasterLevel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MasterDomain_name_key" ON "MasterDomain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterDomain_slug_key" ON "MasterDomain"("slug");

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
CREATE INDEX "ComponentQuestion_componentId_idx" ON "ComponentQuestion"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentModel_slug_key" ON "AssessmentModel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentModel_code_key" ON "AssessmentModel"("code");

-- CreateIndex
CREATE INDEX "AssessmentModelComponent_modelId_idx" ON "AssessmentModelComponent"("modelId");

-- CreateIndex
CREATE INDEX "AssessmentModelComponent_competencyId_idx" ON "AssessmentModelComponent"("competencyId");

-- CreateIndex
CREATE INDEX "AssessmentModelComponent_libraryComponentId_idx" ON "AssessmentModelComponent"("libraryComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAssessmentModel_sessionToken_key" ON "UserAssessmentModel"("sessionToken");

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
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_enrollmentNumber_key" ON "Member"("enrollmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Member_employeeId_key" ON "Member"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_invitationToken_key" ON "Member"("invitationToken");

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
CREATE INDEX "Member_enrollmentNumber_idx" ON "Member"("enrollmentNumber");

-- CreateIndex
CREATE INDEX "Member_employeeId_idx" ON "Member"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_tenantId_enrollmentNumber_key" ON "Member"("tenantId", "enrollmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Member_tenantId_employeeId_key" ON "Member"("tenantId", "employeeId");

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
CREATE INDEX "ActivityOrgUnit_activityId_relationship_idx" ON "ActivityOrgUnit"("activityId", "relationship");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityOrgUnit_activityId_orgUnitId_key" ON "ActivityOrgUnit"("activityId", "orgUnitId");

-- CreateIndex
CREATE INDEX "CurriculumNode_tenantId_idx" ON "CurriculumNode"("tenantId");

-- CreateIndex
CREATE INDEX "CurriculumNode_parentId_idx" ON "CurriculumNode"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumNode_tenantId_code_key" ON "CurriculumNode"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityCurriculum_activityId_curriculumNodeId_key" ON "ActivityCurriculum"("activityId", "curriculumNodeId");

-- CreateIndex
CREATE INDEX "MemberAssessment_memberId_idx" ON "MemberAssessment"("memberId");

-- CreateIndex
CREATE INDEX "MemberAssessment_activityId_idx" ON "MemberAssessment"("activityId");

-- CreateIndex
CREATE INDEX "MemberAssessment_assessmentModelId_idx" ON "MemberAssessment"("assessmentModelId");

-- CreateIndex
CREATE INDEX "MemberAssessment_status_idx" ON "MemberAssessment"("status");

-- CreateIndex
CREATE INDEX "ActivityAssessment_activityId_idx" ON "ActivityAssessment"("activityId");

-- CreateIndex
CREATE INDEX "ActivityAssessment_assessmentModelId_idx" ON "ActivityAssessment"("assessmentModelId");

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
CREATE INDEX "RuntimeGeneratedQuestion_assessmentSessionId_idx" ON "RuntimeGeneratedQuestion"("assessmentSessionId");

-- CreateIndex
CREATE INDEX "RuntimeGeneratedQuestion_respondentId_idx" ON "RuntimeGeneratedQuestion"("respondentId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE INDEX "Role_scope_idx" ON "Role"("scope");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "Role"("tenantId");

-- CreateIndex
CREATE INDEX "Role_globalSubmissionStatus_idx" ON "Role"("globalSubmissionStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_name_key" ON "Competency"("name");

-- CreateIndex
CREATE INDEX "Competency_scope_idx" ON "Competency"("scope");

-- CreateIndex
CREATE INDEX "Competency_tenantId_idx" ON "Competency"("tenantId");

-- CreateIndex
CREATE INDEX "Competency_globalSubmissionStatus_idx" ON "Competency"("globalSubmissionStatus");

-- CreateIndex
CREATE INDEX "CompetencyIndicator_competencyId_level_type_idx" ON "CompetencyIndicator"("competencyId", "level", "type");

-- CreateIndex
CREATE INDEX "CompetencyIndicator_competencyId_level_idx" ON "CompetencyIndicator"("competencyId", "level");

-- CreateIndex
CREATE INDEX "RoleCompetency_roleId_idx" ON "RoleCompetency"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleCompetency_roleId_competencyId_key" ON "RoleCompetency"("roleId", "competencyId");

-- CreateIndex
CREATE INDEX "ComponentLibrary_tenantId_idx" ON "ComponentLibrary"("tenantId");

-- CreateIndex
CREATE INDEX "ComponentLibrary_competencyId_idx" ON "ComponentLibrary"("competencyId");

-- CreateIndex
CREATE INDEX "ComponentLibrary_componentType_idx" ON "ComponentLibrary"("componentType");

-- CreateIndex
CREATE INDEX "ComponentLibrary_targetLevel_idx" ON "ComponentLibrary"("targetLevel");

-- CreateIndex
CREATE INDEX "ComponentLibrary_visibility_idx" ON "ComponentLibrary"("visibility");

-- CreateIndex
CREATE INDEX "ComponentSuggestion_competencyCategory_targetLevel_idx" ON "ComponentSuggestion"("competencyCategory", "targetLevel");

-- CreateIndex
CREATE INDEX "Panel_tenantId_idx" ON "Panel"("tenantId");

-- CreateIndex
CREATE INDEX "PanelMember_panelId_idx" ON "PanelMember"("panelId");

-- CreateIndex
CREATE INDEX "PanelInterview_panelId_idx" ON "PanelInterview"("panelId");

-- CreateIndex
CREATE INDEX "PanelInterview_candidateId_idx" ON "PanelInterview"("candidateId");

-- CreateIndex
CREATE INDEX "PanelInterview_status_idx" ON "PanelInterview"("status");

-- CreateIndex
CREATE INDEX "PanelInterview_memberAssessmentId_idx" ON "PanelInterview"("memberAssessmentId");

-- CreateIndex
CREATE INDEX "PanelInterview_componentId_idx" ON "PanelInterview"("componentId");

-- CreateIndex
CREATE INDEX "PanelEvaluation_panelInterviewId_idx" ON "PanelEvaluation"("panelInterviewId");

-- CreateIndex
CREATE INDEX "AdaptiveComponentLibrary_tenantId_idx" ON "AdaptiveComponentLibrary"("tenantId");

-- CreateIndex
CREATE INDEX "AdaptiveComponentLibrary_competencyId_idx" ON "AdaptiveComponentLibrary"("competencyId");

-- CreateIndex
CREATE INDEX "AdaptiveSession_memberAssessmentId_idx" ON "AdaptiveSession"("memberAssessmentId");

-- CreateIndex
CREATE INDEX "AdaptiveSession_componentId_idx" ON "AdaptiveSession"("componentId");

-- CreateIndex
CREATE INDEX "AdaptiveSession_status_idx" ON "AdaptiveSession"("status");

-- CreateIndex
CREATE INDEX "AdaptiveQuestion_sessionId_idx" ON "AdaptiveQuestion"("sessionId");

-- CreateIndex
CREATE INDEX "AdaptiveQuestion_sessionId_sequenceNumber_idx" ON "AdaptiveQuestion"("sessionId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "GlobalPublishRequest_status_idx" ON "GlobalPublishRequest"("status");

-- CreateIndex
CREATE INDEX "GlobalPublishRequest_entityType_entityId_idx" ON "GlobalPublishRequest"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ApprovalRequest_tenantId_idx" ON "ApprovalRequest"("tenantId");

-- CreateIndex
CREATE INDEX "ApprovalRequest_status_idx" ON "ApprovalRequest"("status");

-- CreateIndex
CREATE INDEX "ApprovalRequest_type_idx" ON "ApprovalRequest"("type");

-- CreateIndex
CREATE INDEX "ApprovalRequest_requesterId_idx" ON "ApprovalRequest"("requesterId");

-- CreateIndex
CREATE INDEX "ApprovalRequest_reviewerId_idx" ON "ApprovalRequest"("reviewerId");

-- CreateIndex
CREATE INDEX "RoleAssignmentRequest_memberId_idx" ON "RoleAssignmentRequest"("memberId");

-- CreateIndex
CREATE INDEX "RoleAssignmentRequest_tenantId_idx" ON "RoleAssignmentRequest"("tenantId");

-- CreateIndex
CREATE INDEX "RoleAssignmentRequest_status_idx" ON "RoleAssignmentRequest"("status");

-- CreateIndex
CREATE INDEX "CompetencyDevelopmentRequest_userId_idx" ON "CompetencyDevelopmentRequest"("userId");

-- CreateIndex
CREATE INDEX "CompetencyDevelopmentRequest_tenantId_idx" ON "CompetencyDevelopmentRequest"("tenantId");

-- CreateIndex
CREATE INDEX "CompetencyDevelopmentRequest_status_idx" ON "CompetencyDevelopmentRequest"("status");

-- CreateIndex
CREATE INDEX "ApprovalHistory_entityType_entityId_idx" ON "ApprovalHistory"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ApprovalHistory_entityId_iterationNumber_idx" ON "ApprovalHistory"("entityId", "iterationNumber");

-- CreateIndex
CREATE INDEX "RecommendationRule_category_idx" ON "RecommendationRule"("category");

-- CreateIndex
CREATE INDEX "RecommendationUsage_ruleId_idx" ON "RecommendationUsage"("ruleId");

-- CreateIndex
CREATE INDEX "RecommendationUsage_userId_idx" ON "RecommendationUsage"("userId");

-- CreateIndex
CREATE INDEX "Survey_tenantId_idx" ON "Survey"("tenantId");

-- CreateIndex
CREATE INDEX "SurveyQuestion_surveyId_idx" ON "SurveyQuestion"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyAssignment_surveyId_idx" ON "SurveyAssignment"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyResponse_surveyId_idx" ON "SurveyResponse"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyResponse_memberId_idx" ON "SurveyResponse"("memberId");

-- CreateIndex
CREATE INDEX "SurveyAnswer_responseId_idx" ON "SurveyAnswer"("responseId");

-- CreateIndex
CREATE INDEX "SurveyAnswer_questionId_idx" ON "SurveyAnswer"("questionId");

-- CreateIndex
CREATE INDEX "ReportTemplate_isSystem_idx" ON "ReportTemplate"("isSystem");

-- CreateIndex
CREATE INDEX "ReportTemplate_tenantId_idx" ON "ReportTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "Report_tenantId_idx" ON "Report"("tenantId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "ReportSchedule_reportId_idx" ON "ReportSchedule"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "GlobalApprovalRequest_status_idx" ON "GlobalApprovalRequest"("status");

-- CreateIndex
CREATE INDEX "GlobalApprovalRequest_tenantId_idx" ON "GlobalApprovalRequest"("tenantId");

-- CreateIndex
CREATE INDEX "GlobalApprovalRequest_entityType_entityId_idx" ON "GlobalApprovalRequest"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "OfflineBatch_slug_key" ON "OfflineBatch"("slug");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBatch" ADD CONSTRAINT "CourseBatch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBatch" ADD CONSTRAINT "CourseBatch_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "CourseBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CommunicationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebinarRegistration" ADD CONSTRAINT "WebinarRegistration_webinarId_fkey" FOREIGN KEY ("webinarId") REFERENCES "Webinar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningOutcome" ADD CONSTRAINT "LearningOutcome_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseInstructor" ADD CONSTRAINT "CourseInstructor_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFeature" ADD CONSTRAINT "CourseFeature_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedCourse" ADD CONSTRAINT "RelatedCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assignedRoleId_fkey" FOREIGN KEY ("assignedRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessorProfile" ADD CONSTRAINT "AssessorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentQuestion" ADD CONSTRAINT "ComponentQuestion_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentModelComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModel" ADD CONSTRAINT "AssessmentModel_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModel" ADD CONSTRAINT "AssessmentModel_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModel" ADD CONSTRAINT "AssessmentModel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModelComponent" ADD CONSTRAINT "AssessmentModelComponent_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModelComponent" ADD CONSTRAINT "AssessmentModelComponent_libraryComponentId_fkey" FOREIGN KEY ("libraryComponentId") REFERENCES "ComponentLibrary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModelComponent" ADD CONSTRAINT "AssessmentModelComponent_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessmentModel" ADD CONSTRAINT "UserAssessmentModel_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessmentModel" ADD CONSTRAINT "UserAssessmentModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssessmentModel" ADD CONSTRAINT "ProjectAssessmentModel_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssessmentModel" ADD CONSTRAINT "ProjectAssessmentModel_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "ProjectManager"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssessmentModel" ADD CONSTRAINT "ProjectAssessmentModel_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssessmentModel" ADD CONSTRAINT "ProjectAssessmentModel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUserAssessment" ADD CONSTRAINT "ProjectUserAssessment_projectAssignmentId_fkey" FOREIGN KEY ("projectAssignmentId") REFERENCES "ProjectAssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUserAssessment" ADD CONSTRAINT "ProjectUserAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessmentComponent" ADD CONSTRAINT "UserAssessmentComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentModelComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessmentComponent" ADD CONSTRAINT "UserAssessmentComponent_projectUserAssessmentId_fkey" FOREIGN KEY ("projectUserAssessmentId") REFERENCES "ProjectUserAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessmentComponent" ADD CONSTRAINT "UserAssessmentComponent_userAssessmentModelId_fkey" FOREIGN KEY ("userAssessmentModelId") REFERENCES "UserAssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentQuestionResponse" ADD CONSTRAINT "ComponentQuestionResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ComponentQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentQuestionResponse" ADD CONSTRAINT "ComponentQuestionResponse_userComponentId_fkey" FOREIGN KEY ("userComponentId") REFERENCES "UserAssessmentComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureActivation" ADD CONSTRAINT "FeatureActivation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_aspirationalRoleId_fkey" FOREIGN KEY ("aspirationalRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_currentRoleId_fkey" FOREIGN KEY ("currentRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_reportingToId_fkey" FOREIGN KEY ("reportingToId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "CurriculumNode" ADD CONSTRAINT "CurriculumNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CurriculumNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumNode" ADD CONSTRAINT "CurriculumNode_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityCurriculum" ADD CONSTRAINT "ActivityCurriculum_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityCurriculum" ADD CONSTRAINT "ActivityCurriculum_curriculumNodeId_fkey" FOREIGN KEY ("curriculumNodeId") REFERENCES "CurriculumNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAssessment" ADD CONSTRAINT "MemberAssessment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAssessment" ADD CONSTRAINT "MemberAssessment_assessmentModelId_fkey" FOREIGN KEY ("assessmentModelId") REFERENCES "AssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAssessment" ADD CONSTRAINT "MemberAssessment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAssessment" ADD CONSTRAINT "ActivityAssessment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAssessment" ADD CONSTRAINT "ActivityAssessment_assessmentModelId_fkey" FOREIGN KEY ("assessmentModelId") REFERENCES "AssessmentModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSettings" ADD CONSTRAINT "ClientSettings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectManager" ADD CONSTRAINT "ProjectManager_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectManager" ADD CONSTRAINT "ProjectManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentManager" ADD CONSTRAINT "DepartmentManager_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentManager" ADD CONSTRAINT "DepartmentManager_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "ProjectManager"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyIndicator" ADD CONSTRAINT "CompetencyIndicator_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCompetency" ADD CONSTRAINT "RoleCompetency_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCompetency" ADD CONSTRAINT "RoleCompetency_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentLibrary" ADD CONSTRAINT "ComponentLibrary_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentLibrary" ADD CONSTRAINT "ComponentLibrary_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentLibrary" ADD CONSTRAINT "ComponentLibrary_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelMember" ADD CONSTRAINT "PanelMember_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "Panel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelInterview" ADD CONSTRAINT "PanelInterview_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentModelComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelInterview" ADD CONSTRAINT "PanelInterview_memberAssessmentId_fkey" FOREIGN KEY ("memberAssessmentId") REFERENCES "MemberAssessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelInterview" ADD CONSTRAINT "PanelInterview_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "Panel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelEvaluation" ADD CONSTRAINT "PanelEvaluation_panelInterviewId_fkey" FOREIGN KEY ("panelInterviewId") REFERENCES "PanelInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelEvaluation" ADD CONSTRAINT "PanelEvaluation_panelMemberId_fkey" FOREIGN KEY ("panelMemberId") REFERENCES "PanelMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptiveComponentLibrary" ADD CONSTRAINT "AdaptiveComponentLibrary_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptiveComponentLibrary" ADD CONSTRAINT "AdaptiveComponentLibrary_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptiveComponentLibrary" ADD CONSTRAINT "AdaptiveComponentLibrary_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptiveSession" ADD CONSTRAINT "AdaptiveSession_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptiveSession" ADD CONSTRAINT "AdaptiveSession_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentModelComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptiveSession" ADD CONSTRAINT "AdaptiveSession_memberAssessmentId_fkey" FOREIGN KEY ("memberAssessmentId") REFERENCES "MemberAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptiveSession" ADD CONSTRAINT "AdaptiveSession_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptiveQuestion" ADD CONSTRAINT "AdaptiveQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AdaptiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalPublishRequest" ADD CONSTRAINT "GlobalPublishRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalPublishRequest" ADD CONSTRAINT "GlobalPublishRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignmentRequest" ADD CONSTRAINT "RoleAssignmentRequest_assignedRoleId_fkey" FOREIGN KEY ("assignedRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignmentRequest" ADD CONSTRAINT "RoleAssignmentRequest_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "MasterDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignmentRequest" ADD CONSTRAINT "RoleAssignmentRequest_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "MasterIndustry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignmentRequest" ADD CONSTRAINT "RoleAssignmentRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignmentRequest" ADD CONSTRAINT "RoleAssignmentRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyDevelopmentRequest" ADD CONSTRAINT "CompetencyDevelopmentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyDevelopmentRequest" ADD CONSTRAINT "CompetencyDevelopmentRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationUsage" ADD CONSTRAINT "RecommendationUsage_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "RecommendationRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyQuestion" ADD CONSTRAINT "SurveyQuestion_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAssignment" ADD CONSTRAINT "SurveyAssignment_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SurveyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTemplate" ADD CONSTRAINT "ReportTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ReportTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSchedule" ADD CONSTRAINT "ReportSchedule_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalApprovalRequest" ADD CONSTRAINT "GlobalApprovalRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalApprovalRequest" ADD CONSTRAINT "GlobalApprovalRequest_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalApprovalRequest" ADD CONSTRAINT "GlobalApprovalRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

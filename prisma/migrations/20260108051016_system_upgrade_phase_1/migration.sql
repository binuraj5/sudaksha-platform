-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('ONLINE_LIVE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('DELIVERY', 'MATERIALS', 'SUPPORT', 'ACCESS', 'CERTIFICATION', 'EXTRAS');

-- CreateEnum
CREATE TYPE "DeliverableType" AS ENUM ('PROJECT', 'CASE_STUDY', 'PROCESS_DOCUMENT', 'DEVELOPMENT_PLAN', 'ASSESSMENT', 'TOOLKIT', 'FRAMEWORK');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('PREREQUISITE', 'NEXT_STEP', 'COMPLEMENTARY', 'ALTERNATIVE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('CONFIRMED', 'WAITLIST', 'CANCELLED', 'COMPLETED');

-- AlterEnum
ALTER TYPE "CourseType" ADD VALUE 'PERSONAL_DEVELOPMENT';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "certificateProvider" TEXT,
ADD COLUMN     "certificateType" TEXT,
ADD COLUMN     "corporateAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cpeCredits" DECIMAL(65,30),
ADD COLUMN     "customizationAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "durationDays" INTEGER,
ADD COLUMN     "durationHours" DECIMAL(65,30),
ADD COLUMN     "durationWeeks" INTEGER,
ADD COLUMN     "hasCaseStudies" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPersonalActivities" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasProcessFrameworks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasProjects" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "industryRecognition" TEXT,
ADD COLUMN     "maxBatchSize" INTEGER,
ADD COLUMN     "minBatchSize" INTEGER,
ADD COLUMN     "newDeliveryModes" "DeliveryMode"[],
ADD COLUMN     "onsiteAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prerequisiteText" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "requiredExperience" TEXT,
ADD COLUMN     "sessionsPerWeek" INTEGER,
ADD COLUMN     "subCategory" TEXT,
ADD COLUMN     "targetAudience" TEXT,
ADD COLUMN     "targetRoles" TEXT[],
ADD COLUMN     "technicalRequirements" TEXT,
ADD COLUMN     "title" TEXT;

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

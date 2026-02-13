/*
  Warnings:

  - The values [PERSONAL_DEVELOPMENT] on the enum `CourseType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CourseType_new" AS ENUM ('TECHNOLOGY', 'IT', 'FUNCTIONAL', 'PROCESS', 'BEHAVIORAL', 'PERSONAL');
ALTER TABLE "Course" ALTER COLUMN "courseType" TYPE "CourseType_new" USING ("courseType"::text::"CourseType_new");
ALTER TYPE "CourseType" RENAME TO "CourseType_old";
ALTER TYPE "CourseType_new" RENAME TO "CourseType";
DROP TYPE "public"."CourseType_old";
COMMIT;

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

-- CreateIndex
CREATE UNIQUE INDEX "MasterCategory_name_key" ON "MasterCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterCategory_slug_key" ON "MasterCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MasterIndustry_name_key" ON "MasterIndustry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterIndustry_slug_key" ON "MasterIndustry"("slug");

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

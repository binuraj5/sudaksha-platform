# Comprehensive Course Schema – Prisma Mapping

This document maps the **COMPREHENSIVE COURSE DATABASE SCHEMA** (SQL) and **COURSE CARD COMPONENT** JSON to the Prisma models.

## Summary of Changes

- **New enums:** `CategoryPrimary`, `TargetAudienceDisplay`, `CourseTypeDisplay`, `BatchTypeDisplay`, `CourseStatusDisplay`, `LessonType`, `PrerequisiteType`, `IndustryVertical`, `CourseMediaType`, `ReviewStatus`, `BatchDeliveryMode`
- **Course:** Extended with 50+ optional fields (courseCode, longDescription, categoryPrimary, industryVertical, placement/rating/meta/LMS fields, etc.)
- **Trainer:** Extended with firstName, lastName, profileImageUrl, title, experience fields, expertise JSON, availableForCourses, etc.
- **CourseModule:** moduleNumber, moduleTitle, moduleDescription, moduleDurationHours, learningObjectives, topicsCovered, handsOnLabs
- **CourseLesson:** lessonNumber, lessonTitle, lessonDescription, lessonType, lessonDurationMinutes, resources
- **CourseBatch:** batchCode, batchType, scheduleDetails, timezone, enrolledStudents, waitlistCount, deliveryMode, classroomLocation, onlinePlatform
- **CourseReview:** studentId, batchId, contentQualityRating, trainerRating, supportRating, reviewTitle, reviewText, pros, cons, reviewStatus, courseCompletedDate
- **New models:** `CoursePrerequisite`, `CourseFaq`, `CourseMedia`, `CourseOutcome`, `IndustrySpecificCourse`

## Course Card JSON → Prisma

| JSON path | Prisma field / relation |
|-----------|-------------------------|
| `course_id` | `Course.courseCode` or `Course.id` |
| `course_name` | `Course.name` |
| `slug` | `Course.slug` |
| `short_description` | `Course.shortDescription` |
| `category.primary` | `Course.categoryPrimary` (enum) |
| `category.secondary` | `Course.categorySecondary` |
| `category.domain` | `Course.technologyDomain` |
| `audience.target` | `Course.targetAudienceDisplay` |
| `audience.experience` | `Course.experienceRequired` |
| `audience.is_finishing_school` | `Course.finishingSchoolProgram` |
| `course_type` | `Course.courseTypeDisplay` |
| `duration.total_hours` | `Course.totalHours` or `Course.durationHours` |
| `duration.weeks` | `Course.totalDurationWeeks` or `Course.durationWeeks` |
| `duration.classes` | `Course.totalClasses` |
| `duration.class_duration_minutes` | `Course.classDurationMinutes` |
| `duration.hours_per_week` | `Course.hoursPerWeek` |
| `delivery.modes` | `Course.deliveryModeJson` |
| `delivery.batch_types` | `Course.scheduleDetails` / `Course.batchType` |
| `structure.modules` | `Course.totalModules` or `Course.modules.length` |
| `structure.lessons` | `Course.totalLessons` |
| `structure.mini_projects` | `Course.miniProjectsCount`, `Course.miniProjects` |
| `structure.capstone_project` | `Course.capstoneProjectTitle`, `Course.capstoneProjectDurationHours` |
| `learning_objectives` | `Course.learningObjectives` (JSON) |
| `skills_gained` | `Course.skillsGained` (JSON) |
| `trainer` | `Course.trainer` (Trainer: name, title→currentDesignation, company→currentCompany, experience_years→totalIndustryExperienceYears, rating, profile_image→profileImageUrl) |
| `pricing.base_price` | `Course.basePrice` or `Course.price` |
| `pricing.discounted_price` | `Course.discountedPrice` |
| `pricing.currency` | `Course.currency` |
| `pricing.emi_available` | `Course.emiAvailable` |
| `pricing.emi_starts_from` | `Course.emiOptions` (JSON) |
| `placement.*` | `Course.placementSupport`, `Course.averagePlacementRate`, `Course.averageSalaryMin/Max`, `Course.topHiringCompanies` |
| `ratings.*` | `Course.overallRating`, `Course.totalReviews`, `Course.ratingDistribution`; breakdown from `CourseReview` aggregates |
| `enrollment.*` | `Course.totalStudentsTrained`, `Course.currentBatchEnrolled`, `Course.maxBatchSize` |
| `next_batch` | From `Course.batches` (status UPCOMING), first by startDate |
| `badges` | Derived from `Course.isFeatured`, `Course.isTrending`, `Course.finishingSchoolProgram`, placement rate, etc. |
| `meta.*` | `Course.isFeatured`, `Course.isTrending`, `Course.isNew`, `Course.featuredOrder` |

## Migrations

The schema is valid (`npx prisma validate`). To apply changes to the database:

- If you use migrations and the DB is in sync:  
  `npx prisma migrate dev --name comprehensive_course_schema`
- If there is drift: resolve it (e.g. baseline or reset) before creating a new migration.  
  **Do not** run `prisma migrate reset` unless you intend to drop all data.

After migration, run:

```bash
npx prisma generate
```

## New Tables (SQL → Prisma)

| SQL table | Prisma model |
|-----------|--------------|
| courses | Course (extended) |
| course_modules | CourseModule (extended) |
| course_lessons | CourseLesson (extended) |
| trainers | Trainer (extended) |
| course_batches | CourseBatch (extended) |
| course_reviews | CourseReview (extended) |
| course_prerequisites | CoursePrerequisite |
| course_faqs | CourseFaq |
| course_media | CourseMedia |
| course_outcomes | CourseOutcome |
| industry_specific_courses | IndustrySpecificCourse |

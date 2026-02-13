import { z } from 'zod';

// Types and Enums
export const CourseTypeEnum = z.enum(["Technology", "IT", "Functional", "Process", "Behavioral", "Personal"]);
export const DeliveryModeEnum = z.enum(["Live Online", "Offline", "Hybrid"]);
export const CourseCategoryEnum = z.enum(["Technology", "IT", "Functional", "Process", "Behavioral", "Personal"]); // Align with CourseType
export const FeatureCategoryEnum = z.enum(["DELIVERY", "MATERIALS", "SUPPORT", "ACCESS", "CERTIFICATION", "EXTRAS"]);
export const DeliverableTypeEnum = z.enum(["PROJECT", "CASE_STUDY", "PROCESS_DOCUMENT", "DEVELOPMENT_PLAN", "ASSESSMENT", "TOOLKIT", "FRAMEWORK"]);

// Sub-Schemas
export const LearningOutcomeSchema = z.object({
  outcome: z.string().min(3, "Outcome text required"),
  category: z.string().optional()
});

export const InstructorSchema = z.object({
  name: z.string().min(2, "Name required"),
  title: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  yearsExperience: z.string().optional(), // Form input as string
  linkedinUrl: z.string().optional(), // Relaxed URL check
  isPrimary: z.boolean().default(false)
});

export const DeliverableSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().optional(),
  type: DeliverableTypeEnum.default("PROJECT")
});

export const IncludedFeatureSchema = z.object({
  feature: z.string().min(3, "Feature text required"),
  icon: z.string().optional(),
  category: FeatureCategoryEnum.default("EXTRAS")
});

export const CurriculumChapterSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.number()
});

export const CurriculumModuleSchema = z.object({
  title: z.string().min(3, "Module title required"),
  description: z.string().optional(),
  duration: z.number().optional(),
  chapters: z.array(CurriculumChapterSchema).default([])
});

// Main Schema
export const CourseSchema = z.object({
  id: z.string().optional(),

  // Basic Info
  name: z.string().min(3, "Name required").max(100),
  title: z.string().optional(), // New field
  slug: z.string().optional(),

  // Categorization
  domain: z.string().min(1, "Domain required"),
  industry: z.string().min(1, "Industry required"),
  category: z.string().min(1, "Category required"),
  subCategory: z.string().optional(),

  courseType: z.string().min(1, "Course type required"),
  targetLevel: z.string().min(1, "Target level required"),
  audienceLevel: z.string().default('ALL_LEVELS'),

  // Delivery & Schedule
  deliveryMode: z.union([z.array(z.string()), z.string()]).transform(val => Array.isArray(val) ? val : [val]), // Flexible input
  durationHours: z.number().min(0).default(0),

  // Pricing & Meta
  price: z.number().min(0).default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "SUSPENDED"]).default("DRAFT"),
  description: z.string().min(1, "Description required"), // Significantly relaxed
  shortDescription: z.string().optional(),

  // Content & Relations
  prerequisites: z.string().optional(),
  skillTags: z.array(z.string()).default([]),
  specialFeatures: z.array(z.string()).default([]),

  learningObjectives: z.array(LearningOutcomeSchema).default([]),
  curriculum: z.array(CurriculumModuleSchema).default([]),
  instructors: z.array(InstructorSchema).default([]),
  deliverables: z.array(DeliverableSchema).default([]),
  includedFeatures: z.array(IncludedFeatureSchema).default([]),

  // Flags
  hasProjects: z.boolean().default(false),
  hasCaseStudies: z.boolean().default(false),
  hasProcessFrameworks: z.boolean().default(false),
  hasPersonalActivities: z.boolean().default(false),

  certification: z.boolean().default(false),

  // Media
  image: z.string().optional().or(z.literal('')), // Removed .url() validation to allow placeholders/relative paths
  videoUrl: z.string().optional().or(z.literal('')), // Removed .url() validation

  // Stats (Read only)
  rating: z.number().min(0).max(5).optional(),
  enrolledCount: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),

  // Legacy fields (optional)
  trainerId: z.string().optional(),
});

export type Course = z.infer<typeof CourseSchema>;

export const CourseFilterSchema = z.object({
  search: z.string().optional(),
  category: z.array(z.string()).optional(),
  domain: z.array(z.string()).optional(),
  industry: z.array(z.string()).optional(),
  targetLevel: z.array(z.string()).optional(),
  courseType: z.array(z.string()).optional(),
  deliveryMode: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  specialFeatures: z.array(z.string()).optional(),
  sort: z.enum(['popularity', 'newest', 'price-low', 'price-high', 'rating']).default('popularity'),
});

export type CourseFilter = z.infer<typeof CourseFilterSchema>;

export const CreateCourseSchema = CourseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  enrolledCount: true,
}).extend({
  slug: z.string().optional()
});
export type CreateCourse = z.infer<typeof CreateCourseSchema>;

export const UpdateCourseSchema = CourseSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type UpdateCourse = z.infer<typeof UpdateCourseSchema>;

// AI Generator Schema (Updated)
export const AIGenerateCourseSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  domain: z.string(),
  category: z.string().default('Software Development'),
  industry: z.string(),
  targetLevel: z.string(),
  courseType: z.string(),
  deliveryMode: DeliveryModeEnum, // Generator allows one primary mode
  durationHours: z.number().min(1).max(1000).optional(),
  price: z.number().min(0).optional(),
});

export type AIGenerateCourse = z.infer<typeof AIGenerateCourseSchema>;

import { z } from "zod";

/**
 * Admin login validation
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Course create/update form validation (aligned with Prisma Course model)
 */
export const courseFormSchema = z.object({
  name: z.string().min(2, "Name required"),
  slug: z.string().min(2, "Slug required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and hyphens only"),
  description: z.string().min(1, "Description required"),
  shortDescription: z.string().optional().default(""),
  duration: z.number().int().min(1, "Duration required"),
  price: z.number().min(0),
  trainerId: z.string().min(1, "Trainer required"),
  audienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).default("ALL_LEVELS"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "SUSPENDED"]).default("DRAFT"),
  industry: z.string().optional().default("Generic/All Industries"),
  deliveryMode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).optional().default("ONLINE"),
  category: z.string().optional().default("Technology"),
  categoryType: z.string().optional().default("TECHNOLOGY"),
  targetLevel: z.string().optional().default("ALL_LEVELS"),
  courseType: z.string().optional().default("TECHNOLOGY"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CourseFormInput = z.infer<typeof courseFormSchema>;

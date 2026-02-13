import { z } from "zod";
import { DifficultyLevelSchema, IndustrySchema, ExperienceLevelSchema } from "./assessment-component"; // Assuming these are exported or will be

// We need to ensure these schemas are exported from assessment-component.ts or duplicate/move them to a shared file.
// For now, let's redefine if not easily importable or move them.
// Actually, I can just export them from the previous file.

export const ModelVisibilitySchema = z.enum(["PUBLIC", "PRIVATE", "SYSTEM"]);

export const AssessmentModelSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    description: z.string().min(10),
    targetRoles: z.array(z.string()).min(1, "Target roles required"),
    targetIndustries: z.array(z.string()).min(1, "Target industries required"), // Using string for now, mapped to Enum
    experienceLevel: z.string(), // Enum
    passingCriteria: z.number().min(0).max(100),
    totalDuration: z.number().min(1, "Total duration must be positive"), // Often calculated, but can be overridden/set
    allowComponentSkip: z.boolean().default(false),
    randomizeOrder: z.boolean().default(false),
    visibility: ModelVisibilitySchema,
    clientId: z.string().nullable().optional(), // For private models
    tags: z.array(z.string()).optional(),
});

export const AssessmentModelComponentSchema = z.object({
    componentId: z.string(),
    order: z.number().int(),
    weightage: z.number().min(0).default(1.0),
    isRequired: z.boolean().default(true),
    isTimed: z.boolean().default(true),
    customDuration: z.number().optional(),
});

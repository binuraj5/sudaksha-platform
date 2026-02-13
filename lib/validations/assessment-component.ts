import { z } from "zod";

export const ComponentCategorySchema = z.enum([
    "TECHNICAL",
    "BEHAVIORAL",
    "DOMAIN_SPECIFIC",
    "COGNITIVE",
    "LANGUAGE",
    "SOFT_SKILLS"
]);

export const DifficultyLevelSchema = z.enum([
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "EXPERT"
]);

export const QuestionTypeSchema = z.enum([
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "CODING_CHALLENGE",
    "ESSAY",
    "SCENARIO_BASED",
    "VIDEO_RESPONSE",
    "FILE_UPLOAD",
    "DRAG_DROP",
    "MATCHING",
    "FILL_IN_BLANK"
]);

export const IndustrySchema = z.enum([
    "INFORMATION_TECHNOLOGY",
    "HEALTHCARE",
    "FINANCE",
    "MANUFACTURING",
    "EDUCATION",
    "RETAIL",
    "TELECOMMUNICATIONS",
    "GOVERNMENT",
    "ENERGY",
    "TRANSPORTATION",
    "HOSPITALITY",
    "REAL_ESTATE",
    "AGRICULTURE",
    "MEDIA",
    "GENERIC"
]);

export const ExperienceLevelSchema = z.enum([
    "ENTRY_LEVEL",
    "MID_LEVEL",
    "SENIOR_LEVEL",
    "EXPERT_LEVEL",
    "ALL_LEVELS"
]);

export const AssessmentComponentSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    description: z.string().min(10),
    instructions: z.string().nullable().optional(),
    category: ComponentCategorySchema,
    subCategory: z.string().min(2),
    industries: z.array(IndustrySchema).min(1, "Select at least one industry"),
    experienceLevel: z.array(ExperienceLevelSchema).min(1, "Select at least one experience level"),
    duration: z.number().min(1),
    difficultyLevel: DifficultyLevelSchema,
    passingScore: z.number().min(0).max(100).default(70),
    tags: z.array(z.string()).optional(),
    aiEngineConfig: z.any().optional(), // For storing selection mode and other runtime configs
});

export const ComponentQuestionSchema = z.object({
    questionText: z.string().min(5),
    questionType: QuestionTypeSchema,
    points: z.number().min(0.5).default(1),
    timeLimit: z.number().nullable().optional(),
    order: z.number().int(),
    options: z.any().optional(), // JSON for structured options
    correctAnswer: z.any().optional(), // For auto-grading (stored in options or separately)
    programmingLanguage: z.string().nullable().optional(),
    starterCode: z.string().nullable().optional(),
    testCases: z.any().optional(),
    wordLimit: z.number().nullable().optional(),
});

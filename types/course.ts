import { z } from 'zod';

export const CourseSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Name required").max(100),
  slug: z.string(),
  category: z.string().min(1, "Category required"), // Free text or dropdown - flexible
  durationHours: z.number().min(1, "Min 1 hour").max(1000),
  duration: z.number().min(1, "Min 1 hour").max(1000), // Alias for durationHours for API compatibility
  price: z.number().min(0, "Free or positive price"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  description: z.string().min(50, "Detailed description required"),
  prerequisites: z.string().optional(),
  learningObjectives: z.array(z.string()).min(3),
  curriculum: z.array(z.object({
    title: z.string(),
    description: z.string(),
    duration: z.number().optional(),
    chapters: z.array(z.object({
      title: z.string(),
      description: z.string(),
      duration: z.number().optional(),
      videoUrl: z.string().url().optional(),
      resources: z.array(z.string()).optional()
    })).optional()
  })).min(1),
  // AI Generated Fields (auto-filled):
  domain: z.enum(["IT", "Non-IT", "All"]),
  industryFocus: z.enum([
    "Technology", "Healthcare", "Finance", "Retail", "Manufacturing", 
    "Education", "Consulting", "Pharmaceutical", "Telecommunications", 
    "Automotive", "Aviation", "Defense"
  ]),
  careerLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  audienceLevel: z.enum(["Beginner", "Intermediate", "Advanced"]), // Alias for careerLevel
  courseType: z.enum(["Technology", "IT", "Functional", "Process", "Behavioral", "Personal"]),
  deliveryMode: z.enum(["Live Online", "Offline", "Hybrid"]),
  specialFeatures: z.array(z.enum(["Most Popular", "New Program", "Placement Support", "EMI Available"])).default([]),
  skillTags: z.array(z.string()).optional(), // For technology filtering
  image: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  enrolledCount: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  // Boolean flags for filtering
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isFinishingSchool: z.boolean().default(false),
  hasPlacementSupport: z.boolean().default(false),
  hasEMI: z.boolean().default(false),
  hasCorporateTraining: z.boolean().default(false),
});

export type Course = z.infer<typeof CourseSchema>;

export const CourseFilterSchema = z.object({
  search: z.string().optional(),
  category: z.array(z.string()).optional(),
  domain: z.array(z.string()).optional(),
  industryFocus: z.array(z.string()).optional(),
  careerLevel: z.array(z.string()).optional(),
  courseType: z.array(z.string()).optional(),
  deliveryMode: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  specialFeatures: z.array(z.string()).optional(),
  sort: z.enum(['popularity', 'newest', 'price-low', 'price-high', 'rating']).default('popularity'),
  page: z.number().default(1),
  pageSize: z.number().default(12),
});

export type CourseFilter = z.infer<typeof CourseFilterSchema>;

export const CreateCourseSchema = CourseSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  rating: true,
  enrolledCount: true 
}).extend({
  specialFeatures: z.array(z.enum(["Most Popular", "New Program", "Placement Support", "EMI Available"]))
});
export type CreateCourse = z.infer<typeof CreateCourseSchema>;

export const UpdateCourseSchema = CourseSchema.partial().omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type UpdateCourse = z.infer<typeof UpdateCourseSchema>;

export const AIGenerateCourseSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  domain: z.enum(["IT", "Non-IT", "All"]),
  industryFocus: z.enum([
    "Technology", "Healthcare", "Finance", "Retail", "Manufacturing", 
    "Education", "Consulting", "Pharmaceutical", "Telecommunications", 
    "Automotive", "Aviation", "Defense"
  ]),
  careerLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  courseType: z.enum(["Technology", "IT", "Functional", "Process", "Behavioral", "Personal"]),
  deliveryMode: z.enum(["Live Online", "Offline", "Hybrid"]),
  durationHours: z.number().min(1).max(1000).optional(),
  durationWeeks: z.number().min(1).max(52).optional(),
  price: z.number().min(0).optional(),
});

export type AIGenerateCourse = z.infer<typeof AIGenerateCourseSchema>;

// API Response types
export type SortOption = 'relevance' | 'popular' | 'rating' | 'price-low' | 'price-high' | 'duration' | 'newest';

export interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

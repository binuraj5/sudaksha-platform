export interface Course {
  id: string;
  name: string;
  title?: string;
  slug: string;

  // Categorization
  category: string; // Changed from enum to string to allow flexibility
  subCategory?: string;
  domain?: string; // Mapped from categoryType logic in actions
  industry: string;

  // Enums & Types
  categoryType: CategoryType;
  targetLevel: TargetLevel;
  courseType: CourseType;
  deliveryMode: string; // Legacy field, kept for compat
  newDeliveryModes?: string[]; // New array

  // Content
  description: string;
  shortDescription: string;
  prerequisites?: string;
  skillTags: string[];

  // Nested Relations (New Structure)
  learningOutcomes: LearningOutcome[];
  instructors: CourseInstructor[];
  deliverables: CourseDeliverable[];
  includedFeatures: CourseFeature[];
  curriculum: CourseModule[]; // Mapped from moduleBreakdown

  // Schedule
  batches: CourseBatch[]; // or NewBatch[]
  duration: number; // in hours
  durationHours?: number; // alias

  // Meta
  price: number;
  rating: number;
  status: CourseStatus;
  imageUrl?: string;
  videoUrl?: string;
  language: string;
  certification: boolean;

  // Stats
  enrolledCount?: number;
  createdAt: string;
  updatedAt: string;

  // Legacy / Mapped for UI Compat
  audienceLevel: AudienceLevel;
  moduleBreakdown: any; // Keep for legacy compat if needed
  benefits?: string[]; // Mapped from features

  // Legacy fields for backward compatibility
  learningObjectives?: string[];
  specialFeatures?: string[];
  levels?: string[];
  modes?: string[];

  image?: string; // Legacy alias for imageUrl
  careerLevel?: string; // Legacy alias for targetLevel

  isSelfPaced: boolean; // Kept from original
  enrollmentUrl?: string; // Kept from original
  maxStudents?: number; // Kept from original
  trainerId: string; // Kept from original
  trainer: Trainer; // Kept from original
  reviews: CourseReview[]; // Kept from original
  placementRate?: number; // Kept from original
  isPopular?: boolean; // Kept from original
  isNew?: boolean; // Kept from original
  hasPlacementSupport?: boolean; // Kept from original
  hasEMI?: boolean; // Kept from original
  hasCorporateTraining?: boolean; // Kept from original
  isFinishingSchool?: boolean; // Kept from original
  isRecorded?: boolean; // for future recorded courses // Kept from original
}

export interface LearningOutcome {
  id: string;
  outcome: string;
  category?: string;
  order?: number;
}

export interface CourseInstructor {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  photoUrl?: string;
  linkedinUrl?: string; // Optional
  isPrimary: boolean;
  yearsExperience?: number; // Added from schema
}

export interface CourseDeliverable {
  id: string;
  title: string;
  description?: string;
  type: string;
}

export interface CourseFeature {
  id: string;
  feature: string;
  icon?: string;
  category?: string;
}

export interface FinishingSchool {
  id: string;
  title: string;
  description: string;
  categoryType: CategoryType;
  industry: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  bio: string;
  expertise: string[];
  experience: number;
  rating: number;
  imageUrl?: string;
  linkedinUrl?: string;
  status: TrainerStatus;
}

export interface CourseModule {
  title: string;
  description?: string;
  duration?: number;
  chapters: CourseChapter[];
}

export interface CourseChapter {
  title: string;
  description?: string;
  duration: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isFree: boolean;
  moduleId: string;
}

export interface CourseBatch {
  id: string;
  name: string;
  courseId: string;
  trainerId: string;
  startDate: string;
  endDate?: string;
  status: BatchStatus;
  mode?: string;
  maxStudents: number;
  currentStudents: number;
  price: number;
  schedule?: string;
}

export interface CourseReview {
  id: string;
  courseId: string;
  studentName: string;
  studentEmail: string;
  rating: number;
  comment?: string;
  verified: boolean;
  createdAt: string;
}

export enum CourseCategory {
  SOFTWARE_DEVELOPMENT = 'SOFTWARE_DEVELOPMENT',
  DATA_ANALYTICS = 'DATA_ANALYTICS',
  CLOUD_DEVOPS = 'CLOUD_DEVOPS',
  AI_ML = 'AI_ML',
  CYBERSECURITY = 'CYBERSECURITY',
  BUSINESS_ANALYSIS = 'BUSINESS_ANALYSIS',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  DIGITAL_MARKETING = 'DIGITAL_MARKETING',
  COMMUNICATION = 'COMMUNICATION',
  LEADERSHIP = 'LEADERSHIP'
}

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  SUSPENDED = 'SUSPENDED'
}

export enum AudienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  ALL_LEVELS = 'ALL_LEVELS'
}

export enum TrainerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE'
}

export enum BatchStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum BatchMode {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  HYBRID = 'HYBRID'
}

export enum CategoryType {
  IT = 'IT',
  NON_IT = 'NON_IT'
}

export enum TargetLevel {
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
  MANAGEMENT = 'MANAGEMENT',
  EXECUTIVE = 'EXECUTIVE'
}

export enum CourseType {
  TECHNOLOGY = 'TECHNOLOGY',
  IT = 'IT',
  FUNCTIONAL = 'FUNCTIONAL',
  PROCESS = 'PROCESS',
  BEHAVIORAL = 'BEHAVIORAL',
  PERSONAL = 'PERSONAL'
}

export interface CourseFilters {
  categories: string[]; // Changed to string[] to match schema flexibility
  courseTypes: CourseType[];
  technologies: string[];
  targetLevels: TargetLevel[];
  industries: string[];
  deliveryModes: BatchMode[];
  categoryType?: CategoryType;
  duration: {
    min: number;
    max: number;
  };
  price: {
    min: number;
    max: number;
  };
  rating: number;
  isPopular?: boolean;
  isNew?: boolean;
  isFinishingSchool?: boolean;
  hasPlacementSupport?: boolean;
  hasEMI?: boolean;
  hasCorporateTraining?: boolean;

  // Added for UI compatibility
  status?: string[];
  search?: string;
  page?: number;
  levels?: string[];
  modes?: string[];
  domain?: string[];
  sort?: SortOption;
}

export interface FinishingSchoolFilters {
  categoryType?: CategoryType;
  industries: string[];
}

export interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type SortOption = 'relevance' | 'popular' | 'rating' | 'price-low' | 'price-high' | 'duration' | 'newest';

export type ViewMode = 'grid' | 'list';

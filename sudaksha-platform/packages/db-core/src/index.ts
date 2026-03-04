import { PrismaClient } from '@prisma/client';

const globalForPrismaCore = globalThis as unknown as {
  prismaCore: PrismaClient | undefined;
};

export const prismaCore =
  globalForPrismaCore.prismaCore ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrismaCore.prismaCore = prismaCore;
}

// Enums and Types
export {
  Prisma,
  PrismaClient,
  ApprovalStatus,
  ApprovalType,
  ProficiencyLevel,
  SubscriptionTier,
  BillingPeriod,
  SubscriptionStatus,
  AssignmentLevel,
  MemberRole,
  MemberType,
  TenantType,
  QuestionType,
  IndicatorType,
  CompetencyCategory,
  Industry,
  CourseStatus,
  BatchMode
} from '@prisma/client';

export type {
  Role,
  Competency,
  AssessmentModel,
  CourseDivision,
  Trainer
} from '@prisma/client';

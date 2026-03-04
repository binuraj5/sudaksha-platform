import { PrismaClient } from '@prisma/client';

const globalForPrismaAssessments = globalThis as unknown as {
    prismaAssessments: PrismaClient | undefined;
};

export const prismaAssessments =
    globalForPrismaAssessments.prismaAssessments ??
    new PrismaClient({
        log: ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrismaAssessments.prismaAssessments = prismaAssessments;
}

export {
    Prisma,
    PrismaClient,
    ApprovalStatus,
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
    Industry
} from '@prisma/client';

export type {
    Role,
    Competency,
    AssessmentModel,
    CourseDivision
} from '@prisma/client';

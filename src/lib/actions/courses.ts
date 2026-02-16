'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper to map string level to Enum
function mapToAudienceLevel(level: string) {
    const l = level?.toLowerCase() || '';
    if (l.includes('senior') || l.includes('advance')) return 'ADVANCED';
    if (l.includes('mid') || l.includes('intermediate')) return 'INTERMEDIATE';
    return 'BEGINNER'; // Default
}

// Create new course
export async function createCourse(courseData: any): Promise<{ success: true; courseId: string } | { success: false; error: string }> {
    console.log('🔄 Database mode: Creating course in database');
    console.log('📦 Received course data keys:', Object.keys(courseData));

    try {
        // Check if prisma is properly initialized
        if (!prisma || !('course' in prisma)) {
            return { success: false, error: 'Database not available' };
        }

        // 1. Prepare nested data arrays
        // Handle both learningObjectives (Schema) and learningOutcomes (Legacy/DB)
        const outcomesSource = courseData.learningObjectives || courseData.learningOutcomes;
        const learningOutcomes = outcomesSource?.map((outcome: any, index: number) => ({
            outcome: outcome.text || outcome.outcome,
            order: index,
            category: outcome.category
        })) || [];

        const deliverables = courseData.deliverables?.map((del: any, index: number) => ({
            title: del.title,
            description: del.description || '',
            type: del.type,
            order: index
        })) || [];

        const includedFeatures = courseData.includedFeatures?.map((feat: any, index: number) => ({
            feature: feat.text || feat.feature,
            icon: feat.icon,
            category: feat.category,
            order: index
        })) || [];

        // 2. Prepare Instructors (Handle multiple)
        const instructorsCreate = courseData.instructors?.map((inst: any, index: number) => ({
            name: inst.name,
            title: inst.title,
            bio: inst.bio,
            photoUrl: inst.photoUrl,
            yearsExperience: parseInt(inst.yearsExperience || '0'),
            isPrimary: index === 0, // Assume first is primary
            linkedinUrl: inst.linkedinUrl,
            order: index
        })) || [];

        // For backward compatibility, try to link a legacy trainer if possible
        let legacyTrainerId = courseData.trainerId;
        if (!legacyTrainerId && instructorsCreate.length > 0) {
            // Find existing legacy trainer by name to link, or leave null
            const existing = await prisma.trainer.findFirst({ where: { name: instructorsCreate[0].name } });
            if (existing) legacyTrainerId = existing.id;
        }

        // 3. Map Enums & Fields
        const rawDeliveryModes = Array.isArray(courseData.deliveryMode)
            ? courseData.deliveryMode
            : [courseData.deliveryMode];

        const deliveryModes = rawDeliveryModes
            .map((mode: string) => {
                const m = mode?.toLowerCase().trim();
                if (m === 'live online' || m === 'online_live') return 'ONLINE_LIVE';
                if (m === 'offline') return 'OFFLINE';
                if (m === 'hybrid' || m === 'blended') return 'HYBRID';
                return null;
            })
            .filter(Boolean);

        if (deliveryModes.length === 0) deliveryModes.push('ONLINE_LIVE'); // Fallback

        const courseCategory = courseData.courseCategory || 'TECHNOLOGY';

        // 4. Create Course with Deep Writes
        const newCourse = await prisma.course.create({
            data: {
                // Basic Info
                title: courseData.title || courseData.name,
                name: courseData.name, // Keep for legacy
                // FIX: Ensure slug is unique by appending timestamp
                slug: (courseData.slug || (courseData.title || courseData.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '-' + Date.now().toString().slice(-4),
                description: courseData.description,
                shortDescription: courseData.shortDescription,

                // Categorization
                industry: courseData.industryFocus || courseData.industry || 'Generic',
                // courseCategory: courseCategory, // Removed as it doesn't exist in schema
                subCategory: courseData.subCategory,

                // Mapped Fields from Form
                category: courseData.category || 'SOFTWARE_DEVELOPMENT',
                categoryType: courseData.domain || 'IT',
                courseType: courseData.courseType || 'TECHNOLOGY',
                targetLevel: courseData.careerLevel || courseData.targetLevel || 'Beginner', // REQUIRED FIELD
                audienceLevel: mapToAudienceLevel(courseData.careerLevel || courseData.targetLevel), // Map to Enum

                // Delivery & Schedule
                newDeliveryModes: deliveryModes, // New Array Enum
                deliveryMode: 'ONLINE', // Legacy single enum
                duration: parseInt(courseData.durationHours || '0'),
                durationHours: parseInt(courseData.durationHours || '0'),

                // Pricing & Meta
                price: parseFloat(courseData.price || '0'),
                status: (courseData.status || 'DRAFT'),
                imageUrl: courseData.imageUrl || courseData.image,

                // Flags
                hasProjects: courseData.hasProjects || false,
                hasCaseStudies: courseData.hasCaseStudies || false,
                hasProcessFrameworks: courseData.hasProcessFrameworks || false,
                hasPersonalActivities: courseData.hasPersonalActivities || false,

                // Content
                skillTags: courseData.skillTags || [],
                targetRoles: courseData.targetRoles || [], // Initialize list
                learningObjectives: learningOutcomes,
                moduleBreakdown: courseData.curriculum || [],

                // Nested Relations
                learningOutcomes: { create: learningOutcomes },
                deliverables: { create: deliverables },
                includedFeatures: { create: includedFeatures },
                instructors: { create: instructorsCreate },

                // Legacy Relations
                trainerId: legacyTrainerId || undefined // Optional linkage
            }
        });

        // const response = { success: true, courseId: newCourse.id };
        // console.log('📦 [Action] Returning response:', JSON.stringify(response));
        return { success: true, courseId: newCourse.id };

    } catch (error) {
        console.error('❌ Error creating course:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create course' };
    }
}

// Get all courses with optional filters
export async function getCourses(filters: any = {}) {
    console.log('🔍 getCourses called with filters:', JSON.stringify(filters));

    try {
        // Check if prisma is properly initialized
        if (!prisma || !('course' in prisma)) {
            console.warn('⚠️  Prisma not initialized - returning empty result');
            return {
                success: true,
                courses: []
            };
        }

        // Build where clause
        const where: any = {};

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { category: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        if (filters.category && filters.category.length > 0) {
            where.category = { in: Array.isArray(filters.category) ? filters.category : [filters.category] };
        }

        if (filters.categoryType && filters.categoryType.length > 0 && filters.categoryType !== 'undefined') {
            where.categoryType = { in: Array.isArray(filters.categoryType) ? filters.categoryType : [filters.categoryType] };
        }

        if (filters.industries && filters.industries.length > 0) {
            const validIndustries = Array.isArray(filters.industries) ?
                filters.industries.filter((i: string) => i && i !== 'undefined') :
                [filters.industries].filter((i: string) => i && i !== 'undefined');
            if (validIndustries.length > 0) {
                where.industry = { in: validIndustries };
            }
        }

        if (filters.industryFocus && filters.industryFocus.length > 0) {
            const validIndustries = Array.isArray(filters.industryFocus) ?
                filters.industryFocus.filter((i: string) => i && i !== 'undefined') :
                [filters.industryFocus].filter((i: string) => i && i !== 'undefined');
            if (validIndustries.length > 0) {
                where.industry = { in: validIndustries };
            }
        }

        if (filters.industry && filters.industry.length > 0) {
            const validIndustries = Array.isArray(filters.industry) ?
                filters.industry.filter((i: string) => i && i !== 'undefined') :
                [filters.industry].filter((i: string) => i && i !== 'undefined');
            if (validIndustries.length > 0) {
                where.industry = { in: validIndustries };
            }
        }

        if (filters.targetLevels && filters.targetLevels.length > 0) {
            const validLevels = Array.isArray(filters.targetLevels) ?
                filters.targetLevels.filter((l: string) => l && l !== 'undefined') :
                [filters.targetLevels].filter((l: string) => l && l !== 'undefined');
            if (validLevels.length > 0) {
                where.targetLevel = { in: validLevels };
            }
        }

        if (filters.careerLevel && filters.careerLevel.length > 0) {
            const validLevels = Array.isArray(filters.careerLevel) ?
                filters.careerLevel.filter((l: string) => l && l !== 'undefined') :
                [filters.careerLevel].filter((l: string) => l && l !== 'undefined');
            if (validLevels.length > 0) {
                where.targetLevel = { in: validLevels };
            }
        }

        if (filters.levels && filters.levels.length > 0) {
            const validLevels = Array.isArray(filters.levels) ?
                filters.levels.filter((l: string) => l && l !== 'undefined') :
                [filters.levels].filter((l: string) => l && l !== 'undefined');
            if (validLevels.length > 0) {
                where.targetLevel = { in: validLevels };
            }
        }

        if (filters.targetLevel && filters.targetLevel.length > 0) {
            const validLevels = Array.isArray(filters.targetLevel) ?
                filters.targetLevel.filter((l: string) => l && l !== 'undefined') :
                [filters.targetLevel].filter((l: string) => l && l !== 'undefined');
            if (validLevels.length > 0) {
                where.targetLevel = { in: validLevels };
            }
        }

        if (filters.courseType && filters.courseType.length > 0) {
            const validTypes = Array.isArray(filters.courseType) ?
                filters.courseType.filter((t: string) => t && t !== 'undefined') :
                [filters.courseType].filter((t: string) => t && t !== 'undefined');
            if (validTypes.length > 0) {
                where.courseType = { in: validTypes };
            }
        }

        if (filters.deliveryMode && filters.deliveryMode.length > 0) {
            const validModes = Array.isArray(filters.deliveryMode) ?
                filters.deliveryMode.filter((m: string) => m && m !== 'undefined') :
                [filters.deliveryMode].filter((m: string) => m && m !== 'undefined');
            if (validModes.length > 0) {
                where.deliveryMode = { in: validModes };
            }
        }

        if (filters.status && filters.status.length > 0) {
            const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED'];
            const statusValues = Array.isArray(filters.status) ? filters.status : [filters.status];
            const validStatusFilters = statusValues.filter((status: any) => validStatuses.includes(status));

            if (validStatusFilters.length > 0) {
                where.status = { in: validStatusFilters };
            }
        }

        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.price = {};
            if (filters.minPrice !== undefined) {
                where.price.gte = Number(filters.minPrice);
            }
            if (filters.maxPrice !== undefined) {
                where.price.lte = Number(filters.maxPrice);
            }
        }

        console.log('🔍 Executing database query with where clause:', JSON.stringify(where));

        const courses = await prisma.course.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                trainer: {
                    select: { name: true }
                }
            }
        });

        console.log('✅ Retrieved courses from database:', courses.length);

        // Map database fields to CourseSchema fields
        const mappedCourses = courses.map(course => ({
            id: course.id,
            name: course.name,
            title: course.title || course.name, // Added title
            slug: course.slug,
            shortDescription: course.shortDescription || '', // Added shortDescription
            industry: course.industry, // Added industry
            durationHours: course.duration,
            duration: course.duration,
            price: course.price,
            description: course.description,
            isSelfPaced: course.isSelfPaced ?? false, // Added isSelfPaced
            prerequisites: course.prerequisites || '',
            learningObjectives: course.learningObjectives,
            curriculum: course.moduleBreakdown,
            deliveryMode: course.deliveryMode === 'ONLINE' ? 'Live Online' :
                course.deliveryMode === 'OFFLINE' ? 'Offline' : 'Hybrid',
            careerLevel: course.targetLevel === 'JUNIOR' ? 'Beginner' :
                course.targetLevel === 'MIDDLE' ? 'Intermediate' :
                    course.targetLevel === 'SENIOR' ? 'Advanced' : 'Beginner',
            audienceLevel: course.targetLevel === 'JUNIOR' ? 'Beginner' :
                course.targetLevel === 'MIDDLE' ? 'Intermediate' :
                    course.targetLevel === 'SENIOR' ? 'Advanced' : 'Beginner',
            targetLevel: course.targetLevel as any, // Cast to any to avoid complex enum mapping if type mismatch
            categoryType: course.categoryType as any, // Added categoryType
            domain: course.categoryType === 'NON_IT' ? 'Non-IT' : course.categoryType === 'IT' ? 'IT' : 'All',
            industryFocus: course.industry,
            courseType: course.courseType as any,
            // courseType: course.courseType === 'TECHNOLOGY' || course.courseType === 'SOFTWARE_DEVELOPMENT' ? 'Technology' : // Commented out valid logic but using direct cast for now to match interface
            //     course.courseType === 'IT_INFRASTRUCTURE' ? 'IT' :
            //         course.courseType === 'FUNCTIONAL_SKILLS' || course.courseType === 'DOMAIN_SKILLS' ? 'Functional' :
            //             course.courseType === 'PROCESS_IMPROVEMENT' || course.courseType === 'PROCESS' ? 'Process' :
            //                 course.courseType === 'BEHAVIORAL_SKILLS' || course.courseType === 'SOFT_SKILLS' ? 'Behavioral' :
            //                     course.courseType === 'PERSONAL_DEVELOPMENT' ? 'Personal' : 'Technology',
            category: course.category === 'SOFTWARE_DEVELOPMENT' ? 'IT Courses' :
                course.category === 'DATA_ANALYTICS' ? 'Data Science' :
                    course.category === 'CLOUD_DEVOPS' ? 'Cloud Computing' :
                        course.category === 'CYBERSECURITY' ? 'Cybersecurity' :
                            course.category === 'AI_ML' ? 'AI & ML' :
                                course.category === 'BUSINESS_ANALYSIS' ? 'Business Analysis' :
                                    course.category === 'PROJECT_MANAGEMENT' ? 'Project Management' :
                                        course.category === 'DIGITAL_MARKETING' ? 'Digital Marketing' :
                                            course.category === 'COMMUNICATION' ? 'Communication' :
                                                course.category === 'LEADERSHIP' ? 'Leadership' : 'IT Courses',
            status: course.status,
            specialFeatures: [],
            image: course.imageUrl || undefined,
            rating: 4.5,
            enrolledCount: 0,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            isPopular: false,
            isNew: false,
            isFinishingSchool: false,
            hasPlacementSupport: false,
            hasEMI: false,
            hasCorporateTraining: false,
        }));

        return {
            success: true,
            courses: mappedCourses
        };
    } catch (error) {
        console.error('❌ Error fetching courses:', error);
        console.error('🔍 Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            errorType: typeof error,
            errorString: String(error)
        });
        return {
            success: false,
            error: 'Failed to fetch courses'
        };
    }
}

// Get single course by ID
export async function getCourseById(id: string) {
    console.log('🎯 Getting single course with id:', id);

    try {
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                trainer: { select: { name: true } },
                learningOutcomes: { orderBy: { order: 'asc' } },
                instructors: { orderBy: { order: 'asc' } },
                deliverables: { orderBy: { order: 'asc' } },
                includedFeatures: { orderBy: { order: 'asc' } },
                newBatches: { where: { status: { not: 'COMPLETED' } }, orderBy: { startDate: 'asc' } }
            }
        });

        if (course) {
            console.log('✅ Course found:', course.name);

            // Map database fields to form field names AND reverse enum mappings
            const mappedCourse = {
                ...course,
                durationHours: course.duration,
                modules: course.moduleBreakdown,
                prerequisites: course.prerequisites || '',

                // Map Relations to Form Arrays
                instructors: course.instructors.map(inst => ({
                    ...inst,
                    yearsExperience: String(inst.yearsExperience || 0) // Convert to string for form
                })),
                learningObjectives: course.learningOutcomes, // Map DB learningOutcomes to Form learningObjectives
                learningOutcomes: course.learningOutcomes, // Keep for legacy if needed
                deliverables: course.deliverables,
                includedFeatures: course.includedFeatures,

                // Reverse Enum Mappings
                deliveryMode: course.newDeliveryModes.length > 0
                    ? course.newDeliveryModes
                    : [(course.deliveryMode === 'ONLINE' ? 'Live Online' : course.deliveryMode === 'OFFLINE' ? 'Offline' : 'Hybrid')],

                domain: course.categoryType === 'NON_IT' ? 'Non-IT' : 'IT',

                // Map courseType enum back to form values
                courseType: course.courseType.charAt(0) + course.courseType.slice(1).toLowerCase().replace(/_/g, ' '),

                // Map category enum back
                category: course.category === 'SOFTWARE_DEVELOPMENT' ? 'Software Development' :
                    course.category === 'DATA_ANALYTICS' ? 'Data Science' :
                        course.category === 'CLOUD_DEVOPS' ? 'Cloud Computing' :
                            course.category === 'CYBERSECURITY' ? 'Cybersecurity' :
                                course.category === 'AI_ML' ? 'AI & ML' :
                                    course.category === 'BUSINESS_ANALYSIS' ? 'Business Analysis' :
                                        course.category === 'PROJECT_MANAGEMENT' ? 'Project Management' :
                                            course.category === 'DIGITAL_MARKETING' ? 'Digital Marketing' :
                                                course.category === 'COMMUNICATION' ? 'Communication' :
                                                    course.category === 'LEADERSHIP' ? 'Leadership' : 'Software Development',

                subCategory: course.subCategory || undefined, // Handle null

                status: course.status.toUpperCase(), // Ensure uppercase for Enum match (DRAFT, PUBLISHED)
                industryFocus: course.industry,
                curriculum: (course.moduleBreakdown as any) || [], // Map moduleBreakdown to curriculum
                price: Number(course.price) || 0, // Ensure price is number
            };

            return { success: true, course: mappedCourse };
        } else {
            return { success: false, error: 'Course not found' };
        }
    } catch (error) {
        console.error('❌ Error fetching course:', error);
        return { success: false, error: 'Failed to fetch course' };
    }
}

// Update existing course
export async function updateCourse(courseData: any): Promise<{ success: true; courseId: string } | { success: false; error: string }> {
    console.log('🔄 Database mode: Updating course in database');

    try {
        // 1. Prepare nested data arrays (same as create)
        const outcomesSource = courseData.learningObjectives || courseData.learningOutcomes;
        const learningOutcomes = outcomesSource?.map((outcome: any, index: number) => ({
            outcome: outcome.text || outcome.outcome,
            order: index,
            category: outcome.category
        })) || [];

        const deliverables = courseData.deliverables?.map((del: any, index: number) => ({
            title: del.title,
            description: del.description || '',
            type: del.type,
            order: index
        })) || [];

        const includedFeatures = courseData.includedFeatures?.map((feat: any, index: number) => ({
            feature: feat.text || feat.feature,
            icon: feat.icon,
            category: feat.category,
            order: index
        })) || [];

        const instructorsCreate = courseData.instructors?.map((inst: any, index: number) => ({
            name: inst.name,
            title: inst.title,
            bio: inst.bio,
            photoUrl: inst.photoUrl,
            yearsExperience: parseInt(inst.yearsExperience || '0'),
            isPrimary: index === 0,
            linkedinUrl: inst.linkedinUrl,
            order: index
        })) || [];

        // 2. Prepare Basic Fields Update
        const updateData: any = {
            updatedAt: new Date(),
            title: courseData.title || courseData.name,
            name: courseData.name,
            description: courseData.description,
            shortDescription: courseData.shortDescription,
            industry: courseData.industry || courseData.industryFocus || 'Generic',
            targetLevel: courseData.targetLevel || courseData.careerLevel,
            subCategory: courseData.subCategory,

            // Flags
            hasProjects: courseData.hasProjects,
            hasCaseStudies: courseData.hasCaseStudies,
            hasProcessFrameworks: courseData.hasProcessFrameworks,
            hasPersonalActivities: courseData.hasPersonalActivities,

            // Arrays (Set new value)
            newDeliveryModes: Array.isArray(courseData.deliveryMode) ? courseData.deliveryMode : undefined,

            duration: parseInt(courseData.durationHours || '0'),
            durationHours: courseData.durationHours,
            price: parseFloat(courseData.price || '0'),
            status: (courseData.status || 'DRAFT'),
            imageUrl: courseData.imageUrl || courseData.image,
        };

        // Only update if provided
        if (courseData.prerequisites !== undefined) updateData.prerequisites = courseData.prerequisites;
        if (courseData.skillTags) updateData.skillTags = courseData.skillTags;
        // Check both fields for updates
        if (courseData.learningObjectives || courseData.learningOutcomes) {
            updateData.learningObjectives = learningOutcomes; // Scalar
            updateData.learningOutcomes = { deleteMany: {}, create: learningOutcomes }; // Relation
        }
        if (courseData.instructors) updateData.instructors = { deleteMany: {}, create: instructorsCreate }; // Replace
        if (courseData.deliverables) updateData.deliverables = { deleteMany: {}, create: deliverables }; // Replace
        if (courseData.includedFeatures) updateData.includedFeatures = { deleteMany: {}, create: includedFeatures }; // Replace

        if (courseData.curriculum) updateData.moduleBreakdown = courseData.curriculum;

        console.log('📦 Updating course:', courseData.id);

        const updatedCourse = await prisma.course.update({
            where: { id: courseData.id },
            data: updateData
        });

        console.log('✅ Course updated:', updatedCourse.name);
        revalidatePath('/admin/courses');

        console.log('✅ Course updated:', updatedCourse.name);
        revalidatePath('/admin/courses');

        // FIX: Return only serializable data
        return { success: true, courseId: updatedCourse.id };
    } catch (error) {
        console.error('❌ Error updating course:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update course' };
    }
}

// Delete course
export async function deleteCourse(id: string): Promise<{ success: true; message: string } | { success: false; error: string }> {
    console.log('🗑️ Database mode: Deleting course from database');

    try {
        const deletedCourse = await prisma.course.delete({
            where: { id }
        });

        console.log('✅ Course deleted from database:', id);

        revalidatePath('/admin/courses');
        revalidatePath('/courses');

        return {
            success: true,
            message: 'Course deleted successfully'
        };
    } catch (error) {
        console.error('❌ Error deleting course:', error);
        return {
            success: false,
            error: 'Failed to delete course'
        };
    }
}

// Dashboard stats
export const getDashboardStats = async () => {
    console.log('📊 Getting dashboard stats from database');

    try {
        // Check if prisma is properly initialized
        if (!prisma || !('course' in prisma)) {
            return {
                totalCourses: 0,
                activeCourses: 0,
                totalStudents: 0,
                totalRevenue: 0,
                activeBatches: 0,
                trainerUtilization: 0,
                pendingActions: 0,
                recentActivity: []
            };
        }

        const [
            totalCourses,
            activeCourses,
            totalStudentsData,
            activeBatches,
            totalTrainers,
            recentLogs,
            pendingCommunications,
            activeBatchRevenueData
        ] = await Promise.all([
            prisma.course.count(),
            prisma.course.count({ where: { status: 'PUBLISHED' } }),
            prisma.courseBatch.aggregate({
                _sum: { currentStudents: true }
            }),
            prisma.courseBatch.count({ where: { status: 'ONGOING' } }),
            prisma.trainer.count({ where: { status: 'ACTIVE' } }),
            prisma.auditLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.communication.count({
                where: { status: 'PENDING' }
            }),
            // Fetch active batches with their students and price to estimate revenue
            prisma.courseBatch.findMany({
                where: { status: 'ONGOING' },
                select: {
                    currentStudents: true,
                    price: true,
                    course: {
                        select: { price: true }
                    }
                }
            })
        ]);

        // Calculate estimated monthly revenue from active batches
        // usage: sum( batch.currentStudents * (batch.price || batch.course.price) )
        const monthlyRevenue = activeBatchRevenueData.reduce((acc, batch) => {
            const price = batch.price ?? batch.course.price;
            return acc + (batch.currentStudents * price);
        }, 0);

        // Simple utilization calculation
        // In a real app, this would be based on scheduled hours vs available hours
        const trainerUtilization = totalTrainers > 0 ? Math.round((activeBatches / (totalTrainers * 2)) * 100) : 0;

        // Calculate trainer workload
        const trainersData = await prisma.trainer.findMany({
            where: { status: 'ACTIVE' },
            include: {
                _count: {
                    select: { batches: { where: { status: 'ONGOING' } } }
                }
            }
        });

        const trainerWorkloadData = trainersData
            .map(t => {
                const activeBatchesCount = t._count.batches;
                const workload = Math.min(Math.round((activeBatchesCount / 3) * 100), 100); // Assuming 3 batches is 100% capacity
                return {
                    name: t.name,
                    workload,
                    status: workload > 90 ? 'overloaded' : workload > 70 ? 'moderate' : 'optimal',
                    color: workload > 90 ? 'bg-red-500' : workload > 70 ? 'bg-yellow-500' : 'bg-green-500'
                };
            })
            .sort((a, b) => b.workload - a.workload) // Sort by workload descending
            .slice(0, 5);

        return {
            totalCourses,
            activeCourses,
            totalStudents: totalStudentsData._sum.currentStudents || 0,
            totalRevenue: 0, // We can't calculate total historical revenue easily without a Transaction table
            activeBatches,
            monthlyRevenue,
            trainerUtilization: Math.min(trainerUtilization, 100) || 0,
            pendingActions: pendingCommunications,
            trainerWorkload: trainerWorkloadData,
            recentActivity: recentLogs.map(log => ({
                id: log.idEntity,
                type: log.action.toLowerCase().includes('create') ? 'course_created' :
                    log.action.toLowerCase().includes('delete') ? 'trash' :
                        log.action.toLowerCase().includes('enroll') ? 'student_enrolled' : 'activity',
                message: `${log.action} ${log.entityName ? '- ' + log.entityName : ''}`,
                timestamp: log.createdAt.toISOString(),
                user: log.userId || log.userName || 'System'
            }))
        };
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        return {
            totalCourses: 0,
            activeCourses: 0,
            totalStudents: 0,
            totalRevenue: 0,
            activeBatches: 0,
            trainerUtilization: 0,
            pendingActions: 0,
            recentActivity: []
        };
    }
}

// Upcoming batches
export const getUpcomingBatches = async (limit?: number) => {
    console.log('📅 Getting upcoming batches from database');

    try {
        const batches = await prisma.courseBatch.findMany({
            where: {
                OR: [
                    { status: 'UPCOMING' },
                    { status: 'ONGOING' }
                ]
            },
            ...(limit && { take: limit }),
            include: {
                course: {
                    select: { name: true }
                },
                trainer: {
                    select: { name: true }
                }
            },
            orderBy: { startDate: 'asc' }
        });

        return batches.map(batch => ({
            ...batch,
            courseName: batch.course.name,
            trainerName: batch.trainer.name,
            status: batch.status.toLowerCase()
        }));
    } catch (error) {
        console.error('❌ Error fetching upcoming batches:', error);
        return [];
    }
}

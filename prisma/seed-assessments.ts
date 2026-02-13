
import { PrismaClient, AssessmentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding assessments...')

    // 1. Create Users
    const password = await bcrypt.hash('password123', 10)

    // Create Admins
    await prisma.user.upsert({
        where: { email: 'admin@sudaksha.com' },
        update: {},
        create: {
            email: 'admin@sudaksha.com',
            name: 'Super Admin',
            password,
            role: 'ADMIN',
            employeeId: 'ADM001',
            department: 'Management'
        }
    })

    // Create Managers
    const managers = []
    for (let i = 1; i <= 5; i++) {
        const manager = await prisma.user.upsert({
            where: { email: `manager${i}@sudaksha.com` },
            update: {},
            create: {
                email: `manager${i}@sudaksha.com`,
                name: `Manager ${i}`,
                password,
                role: 'MANAGER',
                employeeId: `MGR00${i}`,
                department: ['Engineering', 'Product', 'Sales', 'HR', 'Finance'][i - 1]
            }
        })
        managers.push(manager)
    }

    // 2. Create Models and Components (Need a model for foreign key)
    const defaultModel = await prisma.assessmentModel.findFirst();
    if (!defaultModel) {
        console.warn('No AssessmentModel found for seeding UserAssessmentModel');
    }

    // Create Assessors and Assessments
    const departments = ['Engineering', 'Product', 'Sales', 'HR', 'Finance']

    for (let i = 1; i <= 50; i++) {
        const dept = departments[Math.floor(Math.random() * departments.length)]

        const user = await prisma.user.upsert({
            where: { email: `employee${i}@sudaksha.com` },
            update: {},
            create: {
                email: `employee${i}@sudaksha.com`,
                name: `Employee ${i}`,
                password,
                role: 'ASSESSOR',
                employeeId: `EMP${i.toString().padStart(3, '0')}`,
                department: dept,
                assessorProfile: {
                    create: {
                        employeeId: `EMP${i.toString().padStart(3, '0')}`,
                        departmentUnit: dept,
                        currentDesignation: 'Junior Associate',
                        reportingManager: 'Manager 1', // Simplified
                        dateOfJoining: new Date(),
                        yearsInCurrentRole: 1.5,
                        educationalQual: 'B.Tech',
                        professionalCerts: ['AWS Certified', 'Scrum Master']
                    }
                }
            }
        })

        // Create Metadata Assesments for some users
        if (i <= 30 && defaultModel) {
            const statuses = Object.values(AssessmentStatus)
            const status = statuses[Math.floor(Math.random() * statuses.length)]

            await prisma.userAssessmentModel.create({
                data: {
                    userId: user.id,
                    modelId: defaultModel.id,
                    status: status,
                    completionPercentage: status === 'COMPLETED' ? 100 : Math.floor(Math.random() * 90),
                    submittedAt: status === 'SUBMITTED' || status === 'COMPLETED' ? new Date() : null,
                }
            })
        }
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

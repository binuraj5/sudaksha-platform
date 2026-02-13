const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Master Data...');

    // Categories
    const categories = [
        'Software Development', 'Data Analytics', 'Cloud & DevOps', 'AI & ML',
        'Cybersecurity', 'Business Analysis', 'Project Management',
        'Digital Marketing', 'Communication', 'Leadership'
    ];

    for (const name of categories) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.masterCategory.upsert({
            where: { slug },
            update: {},
            create: { name, slug }
        });
    }
    console.log('Categories seeded.');

    // Domains
    const domains = ['IT', 'Non-IT', 'All'];
    for (const name of domains) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.masterDomain.upsert({
            where: { slug },
            update: {},
            create: { name, slug }
        });
    }
    console.log('Domains seeded.');

    // Course Types
    const types = ['Technology', 'IT', 'Functional', 'Process', 'Behavioral', 'Personal'];
    for (const name of types) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.masterCourseType.upsert({
            where: { slug },
            update: {},
            create: { name, slug }
        });
    }
    console.log('Course Types seeded.');

    // Levels
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Management', 'Executive'];
    for (const name of levels) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.masterLevel.upsert({
            where: { slug },
            update: {},
            create: { name, slug }
        });
    }
    console.log('Levels seeded.');

    // Industries (Initial set)
    const industries = ['Banking', 'Telecom', 'Retail', 'Healthcare', 'Automotive', 'Generic/All Industries'];
    for (const name of industries) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.masterIndustry.upsert({
            where: { slug },
            update: {},
            create: { name, slug }
        });
    }
    console.log('Industries seeded.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

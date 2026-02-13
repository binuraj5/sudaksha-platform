const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seeding...');

  try {
    // Create a sample trainer first
    const trainer = await prisma.trainer.create({
      data: {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@sudaksha.com',
        bio: 'Expert in software development and cloud technologies with 15+ years of industry experience.',
        expertise: JSON.stringify(['JavaScript', 'React', 'Node.js', 'AWS', 'DevOps']),
        experience: 15,
        rating: 4.8,
        status: 'ACTIVE'
      }
    });
    console.log('✅ Created trainer:', trainer.name);

    // Create a sample course
    const course = await prisma.course.create({
      data: {
        name: 'Full Stack Web Development',
        slug: 'full-stack-web-development',
        category: 'SOFTWARE_DEVELOPMENT',
        courseType: 'TECHNOLOGY',
        categoryType: 'IT',
        industry: 'Technology',
        targetLevel: 'JUNIOR',
        description: 'Comprehensive full-stack development course covering modern web technologies.',
        shortDescription: 'Master modern web development with React, Node.js, and cloud deployment.',
        duration: 120,
        price: 45000,
        skillTags: JSON.stringify(['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'JWT', 'AWS']),
        learningObjectives: JSON.stringify([
          'Build responsive web applications using React',
          'Develop robust backend APIs with Node.js and Express',
          'Work with databases and implement data persistence'
        ]),
        moduleBreakdown: JSON.stringify({
          modules: [
            { title: 'HTML, CSS & JavaScript Fundamentals', duration: 16, order: 1 },
            { title: 'React Development', duration: 24, order: 2 },
            { title: 'Node.js & Express Backend', duration: 20, order: 3 }
          ]
        }),
        status: 'PUBLISHED',
        audienceLevel: 'BEGINNER',
        language: 'English',
        certification: true,
        trainerId: trainer.id
      }
    });
    console.log('✅ Created course:', course.name);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient, CourseCategory, CourseType, TargetLevel, CategoryType, CourseStatus, BatchMode, TrainerStatus } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample trainers
  const trainers = [
    {
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@sudaksha.com',
      bio: 'Expert in software development and cloud technologies with 15+ years of industry experience.',
      expertise: JSON.stringify(['JavaScript', 'React', 'Node.js', 'AWS', 'DevOps']),
      experience: 15,
      rating: 4.8,
      imageUrl: '/images/trainers/rajesh.jpg',
      linkedinUrl: 'https://linkedin.com/in/rajesh-kumar',
      status: TrainerStatus.ACTIVE,
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@sudaksha.com',
      bio: 'Data science and machine learning specialist with expertise in Python and AI.',
      expertise: JSON.stringify(['Python', 'Machine Learning', 'Data Science', 'TensorFlow', 'SQL']),
      experience: 12,
      rating: 4.9,
      imageUrl: '/images/trainers/priya.jpg',
      linkedinUrl: 'https://linkedin.com/in/priya-sharma',
      status: TrainerStatus.ACTIVE,
    },
    {
      name: 'Amit Patel',
      email: 'amit.patel@sudaksha.com',
      bio: 'Cybersecurity expert and ethical hacker with enterprise security experience.',
      expertise: JSON.stringify(['Cybersecurity', 'Ethical Hacking', 'Network Security', 'Compliance']),
      experience: 10,
      rating: 4.7,
      imageUrl: '/images/trainers/amit.jpg',
      linkedinUrl: 'https://linkedin.com/in/amit-patel',
      status: TrainerStatus.ACTIVE,
    },
  ];

  console.log('📝 Creating trainers...');
  for (const trainer of trainers) {
    await prisma.trainer.upsert({
      where: { email: trainer.email },
      update: trainer,
      create: trainer,
    });
  }

  const createdTrainers = await prisma.trainer.findMany();
  console.log(`✅ Created ${createdTrainers.length} trainers`);

  // Sample courses data
  const courses = [
    // IT Courses
    {
      name: 'Full Stack Web Development',
      category: CourseCategory.SOFTWARE_DEVELOPMENT,
      courseType: CourseType.TECHNOLOGY,
      categoryType: CategoryType.IT,
      industry: 'Technology',
      targetLevel: TargetLevel.JUNIOR,
      description: 'Comprehensive full-stack development course covering modern web technologies, from frontend to backend development.',
      shortDescription: 'Master modern web development with React, Node.js, and cloud deployment.',
      duration: 120,
      price: 45000,
      skillTags: ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'JWT', 'AWS'],
      learningObjectives: [
        'Build responsive web applications using React',
        'Develop robust backend APIs with Node.js and Express',
        'Work with databases and implement data persistence',
        'Deploy applications to cloud platforms',
        'Implement authentication and security best practices'
      ],
      modules: [
        { title: 'HTML, CSS & JavaScript Fundamentals', duration: 16, order: 1 },
        { title: 'React Development', duration: 24, order: 2 },
        { title: 'Node.js & Express Backend', duration: 20, order: 3 },
        { title: 'Database Design & MongoDB', duration: 16, order: 4 },
        { title: 'API Development & Testing', duration: 16, order: 5 },
        { title: 'Authentication & Security', duration: 12, order: 6 },
        { title: 'Deployment & DevOps', duration: 16, order: 7 },
      ],
    },
    {
      name: 'Cloud Computing with AWS',
      category: CourseCategory.CLOUD_DEVOPS,
      courseType: CourseType.TECHNOLOGY,
      categoryType: CategoryType.IT,
      industry: 'Technology',
      targetLevel: TargetLevel.MIDDLE,
      description: 'Master Amazon Web Services cloud platform with hands-on experience in cloud architecture and DevOps.',
      shortDescription: 'Become an AWS cloud expert with practical DevOps skills.',
      duration: 80,
      price: 35000,
      skillTags: ['AWS', 'EC2', 'S3', 'Lambda', 'CloudFormation', 'Docker', 'Kubernetes'],
      learningObjectives: [
        'Understand cloud computing fundamentals',
        'Deploy and manage AWS services',
        'Implement Infrastructure as Code',
        'Master containerization and orchestration',
        'Design scalable and secure cloud architectures'
      ],
      modules: [
        { title: 'Cloud Computing Fundamentals', duration: 8, order: 1 },
        { title: 'AWS Core Services', duration: 16, order: 2 },
        { title: 'Infrastructure as Code', duration: 12, order: 3 },
        { title: 'Containerization with Docker', duration: 12, order: 4 },
        { title: 'Kubernetes Orchestration', duration: 16, order: 5 },
        { title: 'CI/CD Pipelines', duration: 16, order: 6 },
      ],
    },
    {
      name: 'Cybersecurity Fundamentals',
      category: CourseCategory.CYBERSECURITY,
      courseType: CourseType.TECHNOLOGY,
      categoryType: CategoryType.IT,
      industry: 'Technology',
      targetLevel: TargetLevel.JUNIOR,
      description: 'Learn cybersecurity essentials including threat analysis, network security, and ethical hacking techniques.',
      shortDescription: 'Build a strong foundation in cybersecurity and ethical hacking.',
      duration: 100,
      price: 40000,
      skillTags: ['Network Security', 'Ethical Hacking', 'Cryptography', 'Risk Assessment', 'Compliance'],
      learningObjectives: [
        'Understand cybersecurity principles and threats',
        'Learn network security fundamentals',
        'Master ethical hacking techniques',
        'Implement security best practices',
        'Conduct vulnerability assessments'
      ],
      modules: [
        { title: 'Introduction to Cybersecurity', duration: 12, order: 1 },
        { title: 'Network Security', duration: 16, order: 2 },
        { title: 'Cryptography & Encryption', duration: 12, order: 3 },
        { title: 'Ethical Hacking Fundamentals', duration: 20, order: 4 },
        { title: 'Web Application Security', duration: 16, order: 5 },
        { title: 'Incident Response', duration: 12, order: 6 },
        { title: 'Security Compliance', duration: 12, order: 7 },
      ],
    },

    // Technical/Industry Specific
    {
      name: 'VLSI Design for Semiconductor Industry',
      category: CourseCategory.SOFTWARE_DEVELOPMENT,
      courseType: CourseType.TECHNOLOGY,
      categoryType: CategoryType.IT,
      industry: 'Semiconductor',
      targetLevel: TargetLevel.MIDDLE,
      description: 'Comprehensive VLSI design course covering digital design, RTL coding, and ASIC implementation.',
      shortDescription: 'Master VLSI design for semiconductor career advancement.',
      duration: 140,
      price: 60000,
      skillTags: ['Verilog', 'SystemVerilog', 'RTL Design', 'ASIC', 'FPGA', 'Timing Analysis'],
      learningObjectives: [
        'Understand semiconductor fundamentals',
        'Master digital design principles',
        'Write efficient RTL code',
        'Perform timing and power analysis',
        'Work with ASIC and FPGA design flows'
      ],
      modules: [
        { title: 'Semiconductor Fundamentals', duration: 16, order: 1 },
        { title: 'Digital Design Principles', duration: 20, order: 2 },
        { title: 'Verilog HDL', duration: 24, order: 3 },
        { title: 'SystemVerilog', duration: 20, order: 4 },
        { title: 'RTL Design & Synthesis', duration: 20, order: 5 },
        { title: 'Timing Analysis', duration: 16, order: 6 },
        { title: 'ASIC Design Flow', duration: 24, order: 7 },
      ],
    },
    {
      name: 'DO-178C Avionics Software Development',
      category: CourseCategory.SOFTWARE_DEVELOPMENT,
      courseType: CourseType.TECHNOLOGY,
      categoryType: CategoryType.IT,
      industry: 'Aerospace',
      targetLevel: TargetLevel.SENIOR,
      description: 'Specialized training in avionics software development compliant with DO-178C certification standards.',
      shortDescription: 'Develop safety-critical avionics software for aerospace industry.',
      duration: 120,
      price: 75000,
      skillTags: ['DO-178C', 'Safety-Critical Software', 'Avionics', 'Embedded Systems', 'Certification'],
      learningObjectives: [
        'Understand DO-178C certification requirements',
        'Develop safety-critical software',
        'Implement robust testing strategies',
        'Master avionics system design',
        'Navigate regulatory compliance processes'
      ],
      modules: [
        { title: 'Avionics System Overview', duration: 12, order: 1 },
        { title: 'DO-178C Fundamentals', duration: 20, order: 2 },
        { title: 'Safety-Critical Development', duration: 24, order: 3 },
        { title: 'Requirements Engineering', duration: 16, order: 4 },
        { title: 'Verification & Validation', duration: 20, order: 5 },
        { title: 'Certification Process', duration: 16, order: 6 },
        { title: 'Case Studies & Best Practices', duration: 12, order: 7 },
      ],
    },

    // Functional/Behavioral
    {
      name: 'Strategic Leadership & Management',
      category: CourseCategory.PROJECT_MANAGEMENT,
      courseType: CourseType.BEHAVIORAL,
      categoryType: CategoryType.NON_IT,
      industry: 'Generic/All Industries',
      targetLevel: TargetLevel.MANAGEMENT,
      description: 'Develop strategic leadership skills and advanced management techniques for senior executives.',
      shortDescription: 'Master strategic leadership for executive success.',
      duration: 60,
      price: 55000,
      skillTags: ['Strategic Planning', 'Leadership', 'Change Management', 'Executive Decision Making', 'Team Building'],
      learningObjectives: [
        'Develop strategic thinking capabilities',
        'Master advanced leadership techniques',
        'Navigate organizational change',
        'Make effective executive decisions',
        'Build high-performing teams'
      ],
      modules: [
        { title: 'Strategic Thinking', duration: 12, order: 1 },
        { title: 'Leadership Excellence', duration: 12, order: 2 },
        { title: 'Change Management', duration: 10, order: 3 },
        { title: 'Executive Decision Making', duration: 10, order: 4 },
        { title: 'Building High-Performance Teams', duration: 10, order: 5 },
        { title: 'Crisis Leadership', duration: 6, order: 6 },
      ],
    },
    {
      name: 'Professional Communication Skills',
      category: CourseCategory.COMMUNICATION,
      courseType: CourseType.BEHAVIORAL,
      categoryType: CategoryType.NON_IT,
      industry: 'Generic/All Industries',
      targetLevel: TargetLevel.JUNIOR,
      description: 'Enhance communication skills for professional success including presentation, negotiation, and interpersonal skills.',
      shortDescription: 'Master professional communication for career advancement.',
      duration: 40,
      price: 20000,
      skillTags: ['Public Speaking', 'Negotiation', 'Business Writing', 'Presentation Skills', 'Interpersonal Communication'],
      learningObjectives: [
        'Deliver compelling presentations',
        'Write effective business communications',
        'Negotiate successfully in professional settings',
        'Build strong interpersonal relationships',
        'Communicate with confidence and clarity'
      ],
      modules: [
        { title: 'Effective Communication Fundamentals', duration: 8, order: 1 },
        { title: 'Public Speaking & Presentations', duration: 10, order: 2 },
        { title: 'Business Writing Skills', duration: 8, order: 3 },
        { title: 'Negotiation Techniques', duration: 8, order: 4 },
        { title: 'Interpersonal Communication', duration: 6, order: 5 },
      ],
    },

    // Process
    {
      name: 'Six Sigma Green Belt Certification',
      category: CourseCategory.PROJECT_MANAGEMENT,
      courseType: CourseType.PROCESS,
      categoryType: CategoryType.NON_IT,
      industry: 'Manufacturing',
      targetLevel: TargetLevel.MIDDLE,
      description: 'Comprehensive Six Sigma Green Belt training with DMAIC methodology and statistical tools for process improvement.',
      shortDescription: 'Master Six Sigma methodologies for process excellence.',
      duration: 80,
      price: 45000,
      skillTags: ['Six Sigma', 'DMAIC', 'Statistical Analysis', 'Process Improvement', 'Quality Management'],
      learningObjectives: [
        'Understand Six Sigma methodology',
        'Apply DMAIC problem-solving approach',
        'Use statistical tools for data analysis',
        'Implement process improvement projects',
        'Achieve Green Belt certification standards'
      ],
      modules: [
        { title: 'Six Sigma Fundamentals', duration: 12, order: 1 },
        { title: 'Define Phase (DMAIC)', duration: 12, order: 2 },
        { title: 'Measure Phase', duration: 16, order: 3 },
        { title: 'Analyze Phase', duration: 16, order: 4 },
        { title: 'Improve Phase', duration: 12, order: 5 },
        { title: 'Control Phase', duration: 12, order: 6 },
      ],
    },
    {
      name: 'Agile Project Management',
      category: CourseCategory.PROJECT_MANAGEMENT,
      courseType: CourseType.PROCESS,
      categoryType: CategoryType.NON_IT,
      industry: 'Technology',
      targetLevel: TargetLevel.MIDDLE,
      description: 'Master Agile methodologies including Scrum, Kanban, and Lean practices for effective project management.',
      shortDescription: 'Become an Agile expert with Scrum and Kanban mastery.',
      duration: 50,
      price: 30000,
      skillTags: ['Scrum', 'Kanban', 'Agile', 'Sprint Planning', 'Lean Methodology', 'Product Backlog'],
      learningObjectives: [
        'Understand Agile principles and values',
        'Master Scrum framework and ceremonies',
        'Implement Kanban for workflow management',
        'Facilitate effective sprint planning',
        'Apply Lean practices for continuous improvement'
      ],
      modules: [
        { title: 'Agile Fundamentals', duration: 8, order: 1 },
        { title: 'Scrum Framework', duration: 12, order: 2 },
        { title: 'Sprint Planning & Execution', duration: 10, order: 3 },
        { title: 'Kanban Methodology', duration: 8, order: 4 },
        { title: 'Agile Leadership', duration: 8, order: 5 },
        { title: 'Scaling Agile', duration: 4, order: 6 },
      ],
    },
  ];

  console.log('📚 Creating courses...');
  for (const courseData of courses) {
    const slug = slugify(courseData.name, { lower: true, strict: true });

    // Get a random trainer
    const trainer = createdTrainers[Math.floor(Math.random() * createdTrainers.length)];

    // Extract modules from courseData as they should be created separately
    const { modules: courseModules, ...courseDataWithoutModules } = courseData;

    const course = await prisma.course.upsert({
      where: { slug },
      update: {
        ...courseDataWithoutModules,
        trainerId: trainer.id,
        status: CourseStatus.PUBLISHED,
        audienceLevel: 'BEGINNER',
        language: 'English',
        certification: true,
      },
      create: {
        ...courseDataWithoutModules,
        slug,
        trainerId: trainer.id,
        status: CourseStatus.PUBLISHED,
        audienceLevel: 'BEGINNER',
        language: 'English',
        certification: true,
        moduleBreakdown: {
          modules: courseModules.map(module => ({
            title: module.title,
            duration: module.duration,
            lessons: []
          }))
        },
      },
    });

    // Create modules
    for (const moduleData of courseModules) {
      // Check if module already exists
      const existingModule = await prisma.courseModule.findFirst({
        where: {
          courseId: course.id,
          order: moduleData.order,
        },
      });

      if (existingModule) {
        // Update existing module
        await prisma.courseModule.update({
          where: { id: existingModule.id },
          data: moduleData,
        });
      } else {
        // Create new module
        await prisma.courseModule.create({
          data: {
            ...moduleData,
            courseId: course.id,
          },
        });
      }
    }

    // Create modules
    for (const moduleData of courseData.modules) {
      // Check if module already exists
      const existingModule = await prisma.courseModule.findFirst({
        where: {
          courseId: course.id,
          order: moduleData.order,
        },
      });

      if (existingModule) {
        // Update existing module
        await prisma.courseModule.update({
          where: { id: existingModule.id },
          data: moduleData,
        });
      } else {
        // Create new module
        await prisma.courseModule.create({
          data: {
            ...moduleData,
            courseId: course.id,
          },
        });
      }
    }

    // Create sample lessons for each module
    const modules = await prisma.courseModule.findMany({
      where: { courseId: course.id },
      orderBy: { order: 'asc' },
    });

    for (const module of modules) {
      // Create 3-5 lessons per module
      const lessonCount = Math.floor(Math.random() * 3) + 3;

      for (let i = 0; i < lessonCount; i++) {
        await prisma.courseLesson.create({
          data: {
            title: `Lesson ${i + 1}: ${module.title} - Part ${i + 1}`,
            description: `Comprehensive coverage of ${module.title} concepts`,
            content: `Detailed content for ${module.title} - Part ${i + 1}`,
            duration: Math.floor(module.duration / lessonCount) * 60, // Convert hours to minutes
            order: i + 1,
            isFree: i === 0, // First lesson is free
            moduleId: module.id,
          },
        });
      }
    }

    // Create an upcoming batch
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) + 30); // 30-90 days from now

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + course.duration * 7); // Rough estimate

    await prisma.courseBatch.create({
      data: {
        name: `${course.name} - Batch 1`,
        courseId: course.id,
        trainerId: trainer.id,
        startDate,
        endDate,
        schedule: 'Mon-Wed-Fri 6:00 PM - 8:00 PM IST',
        mode: BatchMode.ONLINE,
        maxStudents: 50,
        currentStudents: Math.floor(Math.random() * 20),
        status: 'UPCOMING',
      },
    });
  }

  const createdCourses = await prisma.course.count();
  console.log(`✅ Created ${createdCourses} courses`);

  // Create finishing school programs
  const finishingSchools = [
    {
      title: 'IT Career Foundation Program',
      description: 'Comprehensive foundation program for fresh graduates and students looking to start their IT career. Covers programming basics, data structures, algorithms, and industry-ready skills.',
      categoryType: CategoryType.IT,
      industry: 'Technology',
    },
    {
      title: 'Business Analytics Starter Program',
      description: 'Entry-level program for students interested in business analytics, data analysis, and decision-making roles.',
      categoryType: CategoryType.NON_IT,
      industry: 'Business',
    },
  ];

  console.log('🏫 Creating finishing school programs...');
  for (const program of finishingSchools) {
    // Check if program already exists by title
    const existingProgram = await prisma.finishingSchool.findFirst({
      where: { title: program.title },
    });

    if (existingProgram) {
      // Update existing program
      await prisma.finishingSchool.update({
        where: { id: existingProgram.id },
        data: program,
      });
    } else {
      // Create new program
      await prisma.finishingSchool.create({
        data: program,
      });
    }
  }

  const createdPrograms = await prisma.finishingSchool.count();
  console.log(`✅ Created ${createdPrograms} finishing school programs`);

  // MasterDepartment for role request form (HR, Sales, Marketing, Finance, etc.)
  const departmentNames = ['HR', 'Sales', 'Marketing', 'Finance', 'Operations', 'Technology', 'Engineering', 'Customer Success', 'Legal', 'Product'];
  for (const name of departmentNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await prisma.masterDepartment.upsert({
      where: { slug },
      update: { name, isActive: true },
      create: { name, slug, isActive: true },
    });
  }
  console.log(`✅ Seeded ${departmentNames.length} MasterDepartment options`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
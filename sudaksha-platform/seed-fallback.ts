import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const fallbackCourses = [
  {
    name: "Java Full Stack Development", slug: "java-built-stack-development", category: "Software Development",
    duration: 320, price: 45000, status: "PUBLISHED",
    description: "Master front-end and back-end development using Java Spring Boot and React.", shortDescription: "Learn Java & React",
    learningObjectives: ["React", "Spring Boot", "Microservices"],
    domain: "IT", industryFocus: ["Technology"],
    careerLevel: "Beginner", audienceLevel: "BEGINNER", courseType: "TECHNOLOGY", deliveryMode: "ONLINE",
    specialFeatures: ["Most Popular", "Placement Support"], rating: 4.8, isPopular: true, isNew: false, hasPlacementSupport: true, hasEMI: false,
    categoryType: "IT", targetLevel: "BEGINNER", industry: "Technology", skillTags: ["Java", "React"]
  },
  {
    name: "MERN Stack Web Development", slug: "mern-stack-web-development", category: "Software Development",
    duration: 240, price: 40000, status: "PUBLISHED",
    description: "Learn MongoDB, Express.js, React, and Node.js to build scalable web applications.", shortDescription: "Learn MERN Stack",
    learningObjectives: ["MongoDB", "Express", "React", "Node.js"],
    domain: "IT", industryFocus: ["Technology"],
    careerLevel: "Beginner", audienceLevel: "BEGINNER", courseType: "TECHNOLOGY", deliveryMode: "ONLINE",
    specialFeatures: ["Placement Support"], rating: 4.7, isPopular: false, isNew: false, hasPlacementSupport: true, hasEMI: false,
    categoryType: "IT", targetLevel: "BEGINNER", industry: "Technology", skillTags: ["MongoDB", "React"]
  },
  {
    name: "Data Analytics Professional", slug: "data-analytics-professional", category: "Data Science",
    duration: 200, price: 42000, status: "PUBLISHED",
    description: "Master Python, SQL, Tableau, and Excel to become a data-driven decision maker.", shortDescription: "Learn Data Analytics",
    learningObjectives: ["Python", "SQL", "Tableau"],
    domain: "IT", industryFocus: ["Technology"],
    careerLevel: "Beginner", audienceLevel: "BEGINNER", courseType: "TECHNOLOGY", deliveryMode: "ONLINE",
    specialFeatures: ["Most Popular"], rating: 4.9, isPopular: true, isNew: false, hasPlacementSupport: false, hasEMI: false,
    categoryType: "IT", targetLevel: "BEGINNER", industry: "Technology", skillTags: ["Python", "SQL"]
  },
  {
    name: "AWS Solutions Architect", slug: "aws-solutions-architect", category: "Cloud Computing",
    duration: 160, price: 35000, status: "PUBLISHED",
    description: "Prepare for the AWS Certified Solutions Architect - Associate exam.", shortDescription: "Learn AWS Cloud",
    learningObjectives: ["AWS services", "Architecture patterns", "Security"],
    domain: "IT", industryFocus: ["Technology"],
    careerLevel: "Intermediate", audienceLevel: "INTERMEDIATE", courseType: "TECHNOLOGY", deliveryMode: "ONLINE",
    specialFeatures: [], rating: 4.6, isPopular: false, isNew: false, hasPlacementSupport: false, hasEMI: false,
    categoryType: "IT", targetLevel: "INTERMEDIATE", industry: "Technology", skillTags: ["AWS"]
  },
  {
    name: "Manual & Automation Testing", slug: "manual-and-automation-testing", category: "Software Testing",
    duration: 180, price: 38000, status: "PUBLISHED",
    description: "Learn QA methodologies, Selenium, API testing, and CI/CD integration.", shortDescription: "Learn Automaton Testing",
    learningObjectives: ["Selenium", "TestNG", "Postman"],
    domain: "IT", industryFocus: ["Technology"],
    careerLevel: "Beginner", audienceLevel: "BEGINNER", courseType: "TECHNOLOGY", deliveryMode: "ONLINE",
    specialFeatures: ["Placement Support"], rating: 4.7, isPopular: false, isNew: false, hasPlacementSupport: true, hasEMI: false,
    categoryType: "IT", targetLevel: "BEGINNER", industry: "Technology", skillTags: ["Selenium", "QA"]
  },
  {
    name: "Business Analysis Foundation", slug: "business-analysis-foundation", category: "Business",
    duration: 120, price: 30000, status: "PUBLISHED",
    description: "Learn requirements gathering, agile methodologies, and stakeholder management.", shortDescription: "Learn Business Analysis",
    learningObjectives: ["Agile", "UML", "Jira"],
    domain: "Non-IT", industryFocus: ["Technology"],
    careerLevel: "Beginner", audienceLevel: "BEGINNER", courseType: "FUNCTIONAL", deliveryMode: "ONLINE",
    specialFeatures: ["EMI Available"], rating: 4.5, isPopular: false, isNew: false, hasPlacementSupport: false, hasEMI: true,
    categoryType: "NON_IT", targetLevel: "BEGINNER", industry: "Technology", skillTags: ["Agile", "UML"]
  }
];

async function main() {
  console.log("Seeding fallback courses...");
  try {
    for (const course of fallbackCourses) {
      await prisma.course.upsert({
        where: { slug: course.slug },
        update: {},
        create: {
          name: course.name,
          slug: course.slug,
          category: course.category,
          duration: course.duration,
          price: course.price,
          status: "PUBLISHED" as any,
          description: course.description,
          shortDescription: course.shortDescription,
          learningObjectives: course.learningObjectives,
          audienceLevel: course.audienceLevel as any,
          courseType: course.courseType as any,
          deliveryMode: course.deliveryMode as any,
          skillTags: course.skillTags,
          industry: course.industry,
          categoryType: course.categoryType as any,
          targetLevel: course.targetLevel,
          rating: course.rating,
          moduleBreakdown: [],
          trainer: {
            connectOrCreate: {
              where: { email: "admin@sudaksha.com" },
              create: { name: "Sudaksha Admin", email: "admin@sudaksha.com", bio: "Platform Administrator", expertise: ["General"], experience: 10 }
            }
          }
        } as any
      });
    }
    console.log("Successfully seeded courses.");
  } catch (e: any) {
    console.error("PRISMA ERROR DETAILS:");
    console.error(e.message);
  }
}
main().finally(() => prisma.$disconnect());

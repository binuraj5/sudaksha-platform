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
  }
];

async function main() {
  console.log("Testing validation error...");
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
          rating: course.rating
        } as any
      });
    }
  } catch (e: any) {
    console.error("PRISMA ERROR DETAILS:");
    console.error(e.message);
  }
}
main().finally(() => prisma.$disconnect());

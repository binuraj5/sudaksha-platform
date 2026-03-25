import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const courses = await prisma.course.findMany({
    select: { id: true, name: true, status: true }
  });
  console.log('Total courses:', courses.length);
  console.dir(courses);
}
main().catch(console.error).finally(() => prisma.$disconnect());

/**
 * Seed institution data for university-edu (State University).
 * Run after seed-auth: npm run db:seed:auth && npx tsx prisma/seed-university-edu.ts
 *
 * Creates: Departments (Faculties), Courses, Classes, ActivityOrgUnit links, and Members.
 */
import { PrismaClient, UnitType, MemberType, MemberRole, ActivityType, CourseDivision } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SLUG = "university-edu";
const PASSWORD = "password123";

async function main() {
  console.log("🌱 Seeding university-edu institution data...");

  const tenant = await prisma.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) {
    throw new Error(
      `Tenant with slug "${SLUG}" not found. Run: npm run db:seed:auth`
    );
  }
  const tenantId = tenant.id;

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  // --- 1. Departments (Faculties) ---
  console.log("Creating departments (faculties)...");
  const deptCSE = await prisma.organizationUnit.upsert({
    where: { tenantId_code: { tenantId, code: "CSE" } },
    update: {},
    create: {
      tenantId,
      name: "Computer Science & Engineering",
      code: "CSE",
      type: UnitType.DEPARTMENT,
      description: "Faculty of Computer Science and Engineering",
      isActive: true,
    },
  });
  const deptBM = await prisma.organizationUnit.upsert({
    where: { tenantId_code: { tenantId, code: "BM" } },
    update: {},
    create: {
      tenantId,
      name: "Business Management",
      code: "BM",
      type: UnitType.DEPARTMENT,
      description: "Faculty of Business Management",
      isActive: true,
    },
  });

  // --- 2. Courses (Activity type COURSE) ---
  console.log("Creating courses...");
  const courseBTech = await prisma.activity.upsert({
    where: { tenantId_slug: { tenantId, slug: "btech-cse-2023" } },
    update: {},
    create: {
      tenantId,
      type: ActivityType.COURSE,
      name: "B.Tech Computer Science Engineering",
      slug: "btech-cse-2023",
      code: "BTECH-CSE",
      description: "4-year undergraduate program",
      status: "ACTIVE",
      startDate: new Date(2023, 0, 1),
      endDate: new Date(2027, 11, 31),
      createdBy: "SEED",
      yearBegin: 2023,
      yearEnd: 2027,
      division: CourseDivision.BOTH,
      semesterCount: 8,
      yearCount: 4,
    },
  });
  const courseMBA = await prisma.activity.upsert({
    where: { tenantId_slug: { tenantId, slug: "mba-2024" } },
    update: {},
    create: {
      tenantId,
      type: ActivityType.COURSE,
      name: "MBA",
      slug: "mba-2024",
      code: "MBA",
      description: "2-year postgraduate program",
      status: "ACTIVE",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2026, 11, 31),
      createdBy: "SEED",
      yearBegin: 2024,
      yearEnd: 2026,
      division: CourseDivision.SEMESTER,
      semesterCount: 4,
      yearCount: 2,
    },
  });

  // --- 3. Link courses to departments (SCOPED_TO) ---
  console.log("Linking courses to departments...");
  await prisma.activityOrgUnit.upsert({
    where: {
      activityId_orgUnitId: { activityId: courseBTech.id, orgUnitId: deptCSE.id },
    },
    update: {},
    create: {
      activityId: courseBTech.id,
      orgUnitId: deptCSE.id,
      relationship: "SCOPED_TO",
    },
  });
  await prisma.activityOrgUnit.upsert({
    where: {
      activityId_orgUnitId: { activityId: courseMBA.id, orgUnitId: deptBM.id },
    },
    update: {},
    create: {
      activityId: courseMBA.id,
      orgUnitId: deptBM.id,
      relationship: "SCOPED_TO",
    },
  });

  // --- 4. Classes (under departments) ---
  console.log("Creating classes...");
  const classCSEA = await prisma.organizationUnit.upsert({
    where: { tenantId_code: { tenantId, code: "CSE-A-2023" } },
    update: { parentId: deptCSE.id },
    create: {
      tenantId,
      name: "Section A",
      code: "CSE-A-2023",
      type: UnitType.CLASS,
      parentId: deptCSE.id,
      isActive: true,
    },
  });
  const classCSEB = await prisma.organizationUnit.upsert({
    where: { tenantId_code: { tenantId, code: "CSE-B-2023" } },
    update: { parentId: deptCSE.id },
    create: {
      tenantId,
      name: "Section B",
      code: "CSE-B-2023",
      type: UnitType.CLASS,
      parentId: deptCSE.id,
      isActive: true,
    },
  });
  const classMBA1 = await prisma.organizationUnit.upsert({
    where: { tenantId_code: { tenantId, code: "MBA-1-2024" } },
    update: { parentId: deptBM.id },
    create: {
      tenantId,
      name: "MBA Section 1",
      code: "MBA-1-2024",
      type: UnitType.CLASS,
      parentId: deptBM.id,
      isActive: true,
    },
  });

  // --- 5. Link classes to courses (CONTAINS) ---
  console.log("Linking classes to courses...");
  for (const cls of [classCSEA, classCSEB]) {
    await prisma.activityOrgUnit.upsert({
      where: {
        activityId_orgUnitId: { activityId: courseBTech.id, orgUnitId: cls.id },
      },
      update: {},
      create: {
        activityId: courseBTech.id,
        orgUnitId: cls.id,
        relationship: "CONTAINS",
      },
    });
  }
  await prisma.activityOrgUnit.upsert({
    where: {
      activityId_orgUnitId: { activityId: courseMBA.id, orgUnitId: classMBA1.id },
    },
    update: {},
    create: {
      activityId: courseMBA.id,
      orgUnitId: classMBA1.id,
      relationship: "CONTAINS",
    },
  });

  // --- 6. Members: Principal (existing), HoD CSE, Class Teacher, Students ---
  console.log("Creating/updating members...");

  // Ensure principal exists and is tenant admin
  await prisma.member.upsert({
    where: { email: "principal@university.edu" },
    update: { tenantId, role: MemberRole.TENANT_ADMIN, orgUnitId: null },
    create: {
      email: "principal@university.edu",
      name: "University Principal",
      firstName: "University",
      lastName: "Principal",
      password: hashedPassword,
      tenantId,
      type: MemberType.STUDENT,
      role: MemberRole.TENANT_ADMIN,
      isActive: true,
    },
  });

  // HoD CSE (Department Head)
  const hodCSE = await prisma.member.upsert({
    where: { email: "hod.cse@university.edu" },
    update: {
      tenantId,
      orgUnitId: deptCSE.id,
      role: MemberRole.DEPT_HEAD,
    },
    create: {
      email: "hod.cse@university.edu",
      name: "Dr. Rajesh Kumar",
      firstName: "Rajesh",
      lastName: "Kumar",
      password: hashedPassword,
      tenantId,
      type: MemberType.EMPLOYEE,
      role: MemberRole.DEPT_HEAD,
      orgUnitId: deptCSE.id,
      isActive: true,
    },
  });
  // Assign HoD as manager of CSE department
  await prisma.organizationUnit.update({
    where: { id: deptCSE.id },
    data: { managerId: hodCSE.id },
  });

  // Class Teacher for CSE Section A
  const classTeacher = await prisma.member.upsert({
    where: { email: "teacher.cse@university.edu" },
    update: {
      tenantId,
      orgUnitId: classCSEA.id,
      role: MemberRole.CLASS_TEACHER,
    },
    create: {
      email: "teacher.cse@university.edu",
      name: "Prof. Priya Sharma",
      firstName: "Priya",
      lastName: "Sharma",
      password: hashedPassword,
      tenantId,
      type: MemberType.EMPLOYEE,
      role: MemberRole.CLASS_TEACHER,
      orgUnitId: classCSEA.id,
      isActive: true,
    },
  });
  await prisma.organizationUnit.update({
    where: { id: classCSEA.id },
    data: { managerId: classTeacher.id },
  });

  // Students in CSE-A
  const students = [
    { email: "student1@university.edu", name: "Student One", firstName: "Student", lastName: "One", enrollment: "CS2023001" },
    { email: "student2@university.edu", name: "Student Two", firstName: "Student", lastName: "Two", enrollment: "CS2023002" },
    { email: "student3@university.edu", name: "Student Three", firstName: "Student", lastName: "Three", enrollment: "CS2023003" },
  ];
  for (const s of students) {
    await prisma.member.upsert({
      where: { email: s.email },
      update: {
        tenantId,
        orgUnitId: classCSEA.id,
        type: MemberType.STUDENT,
        role: MemberRole.ASSESSOR,
        enrollmentNumber: s.enrollment,
      },
      create: {
        email: s.email,
        name: s.name,
        firstName: s.firstName,
        lastName: s.lastName,
        password: hashedPassword,
        tenantId,
        type: MemberType.STUDENT,
        role: MemberRole.ASSESSOR,
        orgUnitId: classCSEA.id,
        enrollmentNumber: s.enrollment,
        memberCode: s.enrollment,
        isActive: true,
      },
    });
  }

  // One student in MBA
  await prisma.member.upsert({
    where: { email: "mba.student@university.edu" },
    update: {
      tenantId,
      orgUnitId: classMBA1.id,
      type: MemberType.STUDENT,
      role: MemberRole.ASSESSOR,
      enrollmentNumber: "MBA2024001",
    },
    create: {
      email: "mba.student@university.edu",
      name: "MBA Student",
      firstName: "MBA",
      lastName: "Student",
      password: hashedPassword,
      tenantId,
      type: MemberType.STUDENT,
      role: MemberRole.ASSESSOR,
      orgUnitId: classMBA1.id,
      enrollmentNumber: "MBA2024001",
      memberCode: "MBA2024001",
      isActive: true,
    },
  });

  console.log("✅ University-edu seed complete.");
  console.log("  Departments: CSE, BM");
  console.log("  Courses: B.Tech CSE 2023, MBA 2024");
  console.log("  Classes: CSE-A-2023, CSE-B-2023, MBA-1-2024");
  console.log("  Logins (password: " + PASSWORD + "):");
  console.log("    principal@university.edu (Tenant Admin)");
  console.log("    hod.cse@university.edu (Dept Head CSE)");
  console.log("    teacher.cse@university.edu (Class Teacher CSE-A)");
  console.log("    student1@university.edu, student2@university.edu, student3@university.edu");
  console.log("    mba.student@university.edu");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@sudaksha/db-core";

const prisma = new PrismaClient();

async function fixVisibility() {
  try {
    console.log("🔍 Scanning for hidden programs...\n");

    // Find all programs that should be visible but aren't
    const hiddenPrograms = await prisma.offlineBatch.findMany({
      where: {
        OR: [
          { status: { not: "PUBLISHED" } },
          { isPublic: false },
        ],
      },
      select: {
        id: true,
        programTitle: true,
        status: true,
        isPublic: true,
      },
    });

    if (hiddenPrograms.length === 0) {
      console.log("✅ All programs are visible! No fixes needed.");
      return;
    }

    console.log(`Found ${hiddenPrograms.length} hidden program(s):\n`);
    hiddenPrograms.forEach((prog) => {
      console.log(`  ✗ "${prog.programTitle}"`);
      console.log(`    - Status: ${prog.status} (should be: PUBLISHED)`);
      console.log(`    - isPublic: ${prog.isPublic} (should be: true)\n`);
    });

    // Make all programs published and public
    const fixed = await prisma.offlineBatch.updateMany({
      where: {
        id: {
          in: hiddenPrograms.map((p) => p.id),
        },
      },
      data: {
        status: "PUBLISHED",
        isPublic: true,
      },
    });

    console.log(`\n✅ Fixed ${fixed.count} program(s)!`);
    console.log(
      "\n📝 Programs should now be visible on http://localhost:3000/our-work"
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVisibility();

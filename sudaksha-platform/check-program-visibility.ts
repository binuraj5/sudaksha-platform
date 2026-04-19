import { PrismaClient } from "@sudaksha/db-core";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking offline batch visibility...\n");

    const batches = await prisma.offlineBatch.findMany({
      select: {
        id: true,
        slug: true,
        programTitle: true,
        status: true,
        isPublic: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Total batches: ${batches.length}`);

    const visible = batches.filter((b) => b.status === "PUBLISHED" && b.isPublic);
    const hidden = batches.filter(
      (b) => !(b.status === "PUBLISHED" && b.isPublic)
    );

    console.log(`\nVisible on /our-work (${visible.length}):`);
    visible.forEach((b) => {
      console.log(`  ✓ ${b.programTitle} [${b.slug}]`);
    });

    console.log(`\nHidden from /our-work (${hidden.length}):`);
    hidden.forEach((b) => {
      console.log(
        `  ✗ ${b.programTitle} [status=${b.status}, isPublic=${b.isPublic}]`
      );
    });

    if (hidden.length > 0) {
      console.log(
        "\n📝 To make hidden programs visible, they need:"
      );
      console.log('   1. status = "PUBLISHED"');
      console.log("   2. isPublic = true");
      console.log(
        "\n   Edit them via: /admin/offlinebatches/[id]/edit"
      );
    }

    if (visible.length > 0) {
      console.log(
        "\n✅ Programs should now be visible on http://localhost:3000/our-work"
      );
    } else if (hidden.length > 0) {
      console.log(
        "\n⚠️  No programs are visible. Fix the hidden programs above."
      );
    } else {
      console.log("\n❌ No programs found in database");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

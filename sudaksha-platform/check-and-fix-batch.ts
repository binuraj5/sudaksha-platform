import { prismaCore as prisma } from '@sudaksha/db-core';

async function checkAndFixOfflineBatch() {
  console.log('🔍 Checking OfflineBatch records...');

  try {
    // Find the course
    const batch = await prisma.offlineBatch.findFirst({
      where: {
        programTitle: {
          contains: 'Advanced Enterprise AI',
          mode: 'insensitive'
        }
      }
    });

    if (!batch) {
      console.log('❌ No course found with "Advanced Enterprise AI" in title');
      return;
    }

    console.log('\n📋 Current Record Status:');
    console.log(`  ID: ${batch.id}`);
    console.log(`  Title: ${batch.programTitle}`);
    console.log(`  Status: ${batch.status}`);
    console.log(`  isPublic: ${batch.isPublic}`);
    console.log(`  Slug: ${batch.slug}`);

    // Check if it meets the visibility criteria
    const isVisible = batch.isPublic === true && batch.status === 'PUBLISHED';
    
    if (isVisible) {
      console.log('\n✅ Record is VISIBLE on /our-work page');
      return;
    }

    console.log('\n⚠️  Record is NOT VISIBLE on /our-work page');
    console.log('   Reason:');
    if (batch.status !== 'PUBLISHED') {
      console.log(`     - Status is "${batch.status}" (needs to be "PUBLISHED")`);
    }
    if (batch.isPublic !== true) {
      console.log(`     - isPublic is ${batch.isPublic} (needs to be true)`);
    }

    // Ask if we should fix it
    console.log('\n🔧 Updating record to be visible...');
    const updated = await prisma.offlineBatch.update({
      where: { id: batch.id },
      data: {
        status: 'PUBLISHED',
        isPublic: true
      }
    });

    console.log('✅ Record updated successfully!');
    console.log(`  Status: ${updated.status}`);
    console.log(`  isPublic: ${updated.isPublic}`);
    console.log('\n🎉 The course should now appear on http://localhost:3000/our-work');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixOfflineBatch();

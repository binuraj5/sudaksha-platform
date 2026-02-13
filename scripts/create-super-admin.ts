import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Use same DATABASE_URL as Next.js (from .env)
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@sudaksha.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      isActive: true,
    },
    create: {
      email,
      name,
      passwordHash,
      isActive: true,
    },
  });

  console.log('✅ Super Admin created/updated');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((error) => {
    console.error('❌ Failed to create Super Admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


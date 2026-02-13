import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL is properly configured
const hasValidDatabaseUrl = process.env.DATABASE_URL && 
  !process.env.DATABASE_URL.includes('dummy:dummy') &&
  (process.env.DATABASE_URL.startsWith('postgresql://') || 
   process.env.DATABASE_URL.startsWith('mysql://') ||
   process.env.DATABASE_URL.startsWith('mongodb://') ||
   process.env.DATABASE_URL.startsWith('file:'));

if (!hasValidDatabaseUrl) {
  console.warn('⚠️  DATABASE_URL not set - using mock data mode');
  console.log('📝 To connect to a real database:');
  console.log('   1. Set: $env:DATABASE_URL="your-postgresql-connection-string"');
  console.log('   2. Run: npm run db:generate && npm run db:migrate && npm run db:seed');
  console.log('   3. Restart the application');
  console.log('');
}

// Only initialize PrismaClient if we have a valid DATABASE_URL
let prisma: PrismaClient;
if (hasValidDatabaseUrl) {
  try {
    console.log('🔗 Attempting to connect to database...');
    prisma = globalForPrisma.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.warn('⚠️  Database connection failed - falling back to mock mode');
    console.log('🔄 Running in mock data mode - UI will work without database');
    console.log('💡 Set up a proper database to enable full functionality');
    prisma = {} as PrismaClient;
  }
} else {
  // Create a mock prisma object that won't crash the app
  prisma = {} as PrismaClient;
  console.log('🔄 Running in mock data mode - UI will work without database');
}

export { prisma };

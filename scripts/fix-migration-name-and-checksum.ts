/**
 * Fix: DB has 20260212000001_add_assessment_model_schema_columns applied but we want
 * 20260212000002_add_assessment_model_schema_columns (so enum migration runs first).
 * Updates the row and checksum so migrate dev can proceed.
 */
import 'dotenv/config';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dir = path.join(process.cwd(), 'prisma', 'migrations', '20260212000002_add_assessment_model_schema_columns');
  const content = readFileSync(path.join(dir, 'migration.sql'), 'utf8');
  const checksum = createHash('sha256').update(content, 'utf8').digest('hex');

  const updated = await prisma.$executeRawUnsafe(
    `UPDATE "_prisma_migrations" SET "migration_name" = $1, "checksum" = $2 WHERE "migration_name" = $3`,
    '20260212000002_add_assessment_model_schema_columns',
    checksum,
    '20260212000001_add_assessment_model_schema_columns'
  );
  console.log('Updated _prisma_migrations row (count):', updated);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

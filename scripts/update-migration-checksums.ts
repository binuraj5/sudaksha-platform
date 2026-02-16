/**
 * One-off: update _prisma_migrations.checksum for migrations that were edited after apply.
 * Run from repo root: npx tsx scripts/update-migration-checksums.ts
 */
import 'dotenv/config';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MIGRATIONS_DIR = path.join(process.cwd(), 'prisma', 'migrations');
const MIGRATION_NAMES = [
  '20260205000004_rename_university_slug',
  '20260215000001_add_superadmin_user_for_created_by',
  '20260215000002_master_assessment_engine_phase1',
];

function sha256Hex(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

async function main() {
  console.log('Updating migration checksums in _prisma_migrations...\n');
  for (const name of MIGRATION_NAMES) {
    const filePath = path.join(MIGRATIONS_DIR, name, 'migration.sql');
    const content = readFileSync(filePath, 'utf8');
    const checksum = sha256Hex(content);
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "_prisma_migrations" SET "checksum" = $1 WHERE "migration_name" = $2`,
      checksum,
      name
    );
    console.log(`  ${name}: checksum updated (rows affected: ${result})`);
  }
  console.log('\nDone. Run: npx prisma migrate dev');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

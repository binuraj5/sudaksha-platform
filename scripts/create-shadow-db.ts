/**
 * Create shadow DB for migrate diff (run once).
 */
import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL required');
  const u = new URL(url);
  const dbName = u.pathname.slice(1);
  const shadowName = `${dbName}_shadow`;
  u.pathname = '/postgres';
  const client = new Client({ connectionString: u.toString() });
  await client.connect();
  await client.query(`CREATE DATABASE "${shadowName}"`);
  await client.end();
  console.log('Created', shadowName);
}

main().catch((e) => { console.error(e); process.exit(1); });

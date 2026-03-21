import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Admin@123@localhost:5432/sudassessdb',
});

async function main() {
  await client.connect();
  
  try {
    const res1 = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Member'
      ORDER BY ordinal_position;
    `);
    console.log("--- MEMBER COLUMNS ---");
    console.log(JSON.stringify(res1.rows, null, 2));

    const res2 = await client.query(`
      SELECT *
      FROM "Member"
      WHERE "careerFormData" IS NOT NULL
      LIMIT 1;
    `);
    console.log("--- SAMPLE MEMBER RECORD ---");
    console.log(JSON.stringify(res2.rows, null, 2));
  } catch (error) {
    console.log("No careerFormData on member maybe?");
    console.error(error.message);
  } finally {
    await client.end();
  }
}

main();

import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Admin@123@localhost:5432/sudassessdb',
});

async function main() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT "careerFormData"
      FROM "Member"
      WHERE "careerFormData" IS NOT NULL
        AND "careerFormData"::text != '{}'
      LIMIT 1;
    `);
    if (res.rows.length > 0) {
      console.log(JSON.stringify(res.rows[0].careerFormData, null, 2));
    } else {
      console.log("No non-empty careerFormData found.");
    }
  } catch (error) {
    console.error(error.message);
  } finally {
    await client.end();
  }
}
main();

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
      WHERE table_name = 'CareerProfile'
         OR table_name = 'WorkExperience'
         OR table_name = 'MemberCareerProfile'
      ORDER BY table_name, ordinal_position;
    `);
    console.log("--- TABLE COLUMNS ---");
    console.log(JSON.stringify(res1.rows, null, 2));

    const res2 = await client.query(`
      SELECT 
        m.id AS member_id,
        m."experienceLevel",
        cp.*
      FROM "Member" m
      LEFT JOIN "CareerProfile" cp ON cp."memberId" = m.id
      LIMIT 5;
    `);
    console.log("--- CAREER PROFILE DATA ---");
    console.log(JSON.stringify(res2.rows, null, 2));

    const res3 = await client.query(`
      SELECT 
        id as member_id,
        "experienceLevel",
        "careerFormData"
      FROM "Member"
      WHERE "careerFormData" IS NOT NULL
      LIMIT 2;
    `);
    console.log("--- MEMBER RECORD (careerFormData) ---");
    console.log(JSON.stringify(res3.rows, null, 2));

  } catch (error) {
    console.error(error.message);
  } finally {
    await client.end();
  }
}

main();

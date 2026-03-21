import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:Admin@123@localhost:5432/sudassessdb',
});

async function main() {
  await client.connect();
  
  try {
    const anchorId = 'cmmd5ow8y000412u1j7q3f5my';
    console.log(`Using Anchor ID: ${anchorId}\n`);

    const res2 = await client.query(`
      SELECT 
        s.id AS component_result_id,
        s."componentId",
        s."finalScore" AS percentage,
        s."questionsCorrect" AS score,
        s.status,
        c.name AS competency_name
      FROM "AdaptiveSession" s
      JOIN "Competency" c ON c.id = s."competencyId"
      WHERE s."memberAssessmentId" = $1
      ORDER BY c.name;
    `, [anchorId]);

    const res3 = await client.query(`
      SELECT 
        ma.id AS user_assessment_id,
        m."currentRoleId",
        r.name AS role_name,
        COUNT(rc.id) AS role_competency_count
      FROM "MemberAssessment" ma
      JOIN "Member" m ON m.id = ma."memberId"
      JOIN "Role" r ON r.id = m."currentRoleId"
      JOIN "RoleCompetency" rc ON rc."roleId" = r.id
      WHERE ma.id = $1
      GROUP BY ma.id, m."currentRoleId", r.name;
    `, [anchorId]);
    
    let roleCompCount = res3.rows.length > 0 ? parseInt(res3.rows[0].role_competency_count) : 0;
    
    console.log(JSON.stringify({
      Query_2_ComponentResultCount: res2.rows.length,
      Query_3_RoleCompetencyCount: roleCompCount,
      Bug1_Confirmed: roleCompCount > res2.rows.length
    }, null, 2));

    const res4 = await client.query(`
      SELECT 
        c.name AS competency_name,
        rc."requiredLevel",
        s."finalScore" AS achieved_percentage,
        s."questionsCorrect" AS achieved_score,
        s.status AS result_status,
        CASE WHEN s.id IS NOT NULL THEN 'ASSESSED' ELSE 'NOT ASSESSED' END AS assessed_flag
      FROM "MemberAssessment" ma
      JOIN "Member" m ON m.id = ma."memberId"
      JOIN "Role" r ON r.id = m."currentRoleId"
      JOIN "RoleCompetency" rc ON rc."roleId" = r.id
      JOIN "Competency" c ON c.id = rc."competencyId"
      LEFT JOIN "AdaptiveSession" s ON s."competencyId" = c.id
        AND s."memberAssessmentId" = ma.id
      WHERE ma.id = $1
      ORDER BY assessed_flag DESC, c.name;
    `, [anchorId]);
    
    const assessedCount = res4.rows.filter(r => r.assessed_flag === 'ASSESSED').length;
    const notAssessedCount = res4.rows.filter(r => r.assessed_flag === 'NOT ASSESSED').length;
    
    console.log(JSON.stringify({
      Query_4_ASSESSED_Count: assessedCount,
      Query_4_NOT_ASSESSED_Count: notAssessedCount
    }, null, 2));

    const res5 = await client.query(`
      SELECT 
        c.name AS competency_name,
        rc."requiredLevel",
        s."finalScore" AS achieved_pct,
        CASE 
          WHEN s."finalScore"::numeric >= 75 THEN 'EXPERT'
          WHEN s."finalScore"::numeric >= 50 THEN 'SENIOR'
          WHEN s."finalScore"::numeric >= 25 THEN 'MIDDLE'
          ELSE 'JUNIOR'
        END AS achieved_level,
        CASE rc."requiredLevel"
          WHEN 'EXPERT' THEN 3
          WHEN 'SENIOR' THEN 2
          WHEN 'MIDDLE' THEN 1
          ELSE 0
        END -
        CASE 
          WHEN s."finalScore"::numeric >= 75 THEN 3
          WHEN s."finalScore"::numeric >= 50 THEN 2
          WHEN s."finalScore"::numeric >= 25 THEN 1
          ELSE 0
        END AS integer_gap,
        CASE rc."requiredLevel"
          WHEN 'EXPERT' THEN 75
          WHEN 'SENIOR' THEN 50
          WHEN 'MIDDLE' THEN 25
          ELSE 0
        END - COALESCE(s."finalScore"::numeric, 0) AS pct_gap,
        CASE WHEN s.id IS NOT NULL THEN 'ASSESSED' ELSE 'NOT ASSESSED' END AS assessed_flag
      FROM "MemberAssessment" ma
      JOIN "Member" m ON m.id = ma."memberId"
      JOIN "Role" r ON r.id = m."currentRoleId"
      JOIN "RoleCompetency" rc ON rc."roleId" = r.id
      JOIN "Competency" c ON c.id = rc."competencyId"
      LEFT JOIN "AdaptiveSession" s ON s."competencyId" = c.id
        AND s."memberAssessmentId" = ma.id
      WHERE ma.id = $1
      ORDER BY assessed_flag DESC, pct_gap DESC;
    `, [anchorId]);
    
    const largeGaps = res5.rows.filter(r => parseFloat(r.pct_gap) > 0 && r.assessed_flag === 'NOT ASSESSED');
    
    console.log("Query 5 NOT ASSESSED with Gaps > 0:");
    console.log(JSON.stringify(largeGaps.map(r => ({
      Competency: r.competency_name,
      Required: r.requiredLevel,
      AchievedPct: r.achieved_pct,
      PctGap: r.pct_gap,
      Status: r.assessed_flag
    })), null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}
main();

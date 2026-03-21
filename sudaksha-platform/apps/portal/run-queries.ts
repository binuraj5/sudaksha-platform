import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("--- Query 1: Find a good anchor assessment record ---");
    const q1 = await prisma.$queryRawUnsafe(`
      SELECT 
        ua.id AS user_assessment_id,
        ua."assessmentModelId",
        ua."userId",
        ua."status",
        ua."tenantId",
        COUNT(cr.id) AS component_result_count
      FROM "UserAssessment" ua
      JOIN "ComponentResult" cr ON cr."userAssessmentId" = ua.id
      WHERE ua.status = 'COMPLETED'
      GROUP BY ua.id, ua."assessmentModelId", ua."userId", ua."status", ua."tenantId"
      ORDER BY component_result_count DESC
      LIMIT 10;
    `);
    
    // Convert BigInt to Number
    const parsedQ1 = JSON.parse(JSON.stringify(q1, (key, value) => typeof value === 'bigint' ? value.toString() : value));
    
    if (parsedQ1.length === 0) {
      console.log("No completed assessments found.");
      return;
    }
    
    // Pick first as anchor
    const anchor = parsedQ1[0];
    const anchorId = anchor.user_assessment_id;
    console.log(`\nPicked Anchor ID: ${anchorId}\nComponent Count (Q1): ${anchor.component_result_count}`);

    console.log("\n--- Query 2: How many competencies were assessed in this session ---");
    const q2 = await prisma.$queryRawUnsafe(`
      SELECT 
        cr.id AS component_result_id,
        cr."componentId",
        cr.percentage,
        cr.score,
        cr.status,
        c.name AS competency_name
      FROM "ComponentResult" cr
      JOIN "AssessmentComponent" ac ON ac.id = cr."componentId"
      JOIN "Competency" c ON c.id = ac."competencyId"
      WHERE cr."userAssessmentId" = '${anchorId}'
      ORDER BY c.name;
    `);
    const parsedQ2 = JSON.parse(JSON.stringify(q2, (key, value) => typeof value === 'bigint' ? value.toString() : value));
    console.log(`Component Result Count from Q2: ${parsedQ2.length}`);

    console.log("\n--- Query 3: How many competencies are on the role profile ---");
    const q3 = await prisma.$queryRawUnsafe(`
      SELECT 
        ua.id AS user_assessment_id,
        u."currentRoleId",
        r.name AS role_name,
        COUNT(rc.id) AS role_competency_count
      FROM "UserAssessment" ua
      JOIN "User" u ON u.id = ua."userId"
      JOIN "Role" r ON r.id = u."currentRoleId"
      JOIN "RoleCompetency" rc ON rc."roleId" = r.id
      WHERE ua.id = '${anchorId}'
      GROUP BY ua.id, u."currentRoleId", r.name;
    `);
    const parsedQ3 = JSON.parse(JSON.stringify(q3, (key, value) => typeof value === 'bigint' ? value.toString() : value));
    if (parsedQ3.length > 0) {
       console.log(`Role Competencies Count from Q3: ${parsedQ3[0].role_competency_count}`);
       console.log(`Bug 1 Confirmed? ${parseInt(parsedQ3[0].role_competency_count) > parsedQ2.length}`);
    } else {
       console.log("No role profile found for this user.");
    }

    console.log("\n--- Query 4: Side-by-side: assessed vs role profile competencies ---");
    const q4 = await prisma.$queryRawUnsafe(`
      SELECT 
        c.name AS competency_name,
        rc."requiredLevel",
        cr.percentage AS achieved_percentage,
        cr.score AS achieved_score,
        cr.status AS result_status,
        CASE WHEN cr.id IS NOT NULL THEN 'ASSESSED' ELSE 'NOT ASSESSED' END AS assessed_flag
      FROM "UserAssessment" ua
      JOIN "User" u ON u.id = ua."userId"
      JOIN "Role" r ON r.id = u."currentRoleId"
      JOIN "RoleCompetency" rc ON rc."roleId" = r.id
      JOIN "Competency" c ON c.id = rc."competencyId"
      LEFT JOIN "AssessmentComponent" ac ON ac."competencyId" = c.id 
        AND ac."assessmentModelId" = ua."assessmentModelId"
      LEFT JOIN "ComponentResult" cr ON cr."componentId" = ac.id 
        AND cr."userAssessmentId" = ua.id
      WHERE ua.id = '${anchorId}'
      ORDER BY assessed_flag DESC, c.name;
    `);
    const parsedQ4 = JSON.parse(JSON.stringify(q4, (key, value) => typeof value === 'bigint' ? value.toString() : value));
    const assessedCount = parsedQ4.filter((r: any) => r.assessed_flag === 'ASSESSED').length;
    const notAssessedCount = parsedQ4.filter((r: any) => r.assessed_flag === 'NOT ASSESSED').length;
    console.log(`ASSESSED Count: ${assessedCount}`);
    console.log(`NOT ASSESSED Count: ${notAssessedCount}`);

    console.log("\n--- Query 5: Verify the gap calculation on real data (Only NOT ASSESSED with large gaps) ---");
    const q5 = await prisma.$queryRawUnsafe(`
      SELECT 
        c.name AS competency_name,
        rc."requiredLevel",
        cr.percentage AS achieved_pct,
        CASE 
          WHEN cr.percentage >= '75' THEN 'EXPERT'
          WHEN cr.percentage >= '50' THEN 'SENIOR'
          WHEN cr.percentage >= '25' THEN 'MIDDLE'
          ELSE 'JUNIOR'
        END AS achieved_level,
        CASE rc."requiredLevel"
          WHEN 'EXPERT' THEN 3
          WHEN 'SENIOR' THEN 2
          WHEN 'MIDDLE' THEN 1
          ELSE 0
        END -
        CASE 
          WHEN cr.percentage >= '75' THEN 3
          WHEN cr.percentage >= '50' THEN 2
          WHEN cr.percentage >= '25' THEN 1
          ELSE 0
        END AS integer_gap,
        CASE rc."requiredLevel"
          WHEN 'EXPERT' THEN 75
          WHEN 'SENIOR' THEN 50
          WHEN 'MIDDLE' THEN 25
          ELSE 0
        END - COALESCE(cr.percentage, 0) AS pct_gap,
        CASE WHEN cr.id IS NOT NULL THEN 'ASSESSED' ELSE 'NOT ASSESSED' END AS assessed_flag
      FROM "UserAssessment" ua
      JOIN "User" u ON u.id = ua."userId"
      JOIN "Role" r ON r.id = u."currentRoleId"
      JOIN "RoleCompetency" rc ON rc."roleId" = r.id
      JOIN "Competency" c ON c.id = rc."competencyId"
      LEFT JOIN "AssessmentComponent" ac ON ac."competencyId" = c.id 
        AND ac."assessmentModelId" = ua."assessmentModelId"
      LEFT JOIN "ComponentResult" cr ON cr."componentId" = ac.id 
        AND cr."userAssessmentId" = ua.id
      WHERE ua.id = '${anchorId}'
      ORDER BY assessed_flag DESC, pct_gap DESC;
    `);
    const parsedQ5 = JSON.parse(JSON.stringify(q5, (key, value) => typeof value === 'bigint' ? value.toString() : value));
    const largeGaps = parsedQ5.filter((r: any) => parseFloat(r.pct_gap) > 0 && r.assessed_flag === 'NOT ASSESSED');
    console.table(largeGaps.map((r: any) => ({
      Competency: r.competency_name,
      RequiredLevel: r.requiredLevel,
      AchievedPct: r.achieved_pct,
      PctGap: r.pct_gap,
      Status: r.assessed_flag
    })));

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
main();

#!/usr/bin/env node

/**
 * Assessment Competency Diagnostic Script
 * Runs SQL queries to identify assessment competency gaps
 */

require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.ASSESSMENTS_DATABASE_URL || process.env.DATABASE_URL,
});

const queries = {
  query1: `
    SELECT 
      ua.id AS user_assessment_id,
      ua."assessmentModelId",
      ua."userId",
      ua.status,
      ua."tenantId",
      COUNT(cr.id) AS component_result_count
    FROM "UserAssessment" ua
    JOIN "ComponentResult" cr ON cr."userAssessmentId" = ua.id
    WHERE ua.status = 'COMPLETED'
    GROUP BY ua.id, ua."assessmentModelId", ua."userId", ua.status, ua."tenantId"
    ORDER BY component_result_count DESC
    LIMIT 10;
  `,

  query2: (uaId) => `
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
    WHERE cr."userAssessmentId" = '${uaId}'
    ORDER BY c.name;
  `,

  query3: (uaId) => `
    SELECT 
      ua.id AS user_assessment_id,
      u."currentRoleId",
      r.name AS role_name,
      COUNT(rc.id) AS role_competency_count
    FROM "UserAssessment" ua
    JOIN "User" u ON u.id = ua."userId"
    JOIN "Role" r ON r.id = u."currentRoleId"
    JOIN "RoleCompetency" rc ON rc."roleId" = r.id
    WHERE ua.id = '${uaId}'
    GROUP BY ua.id, u."currentRoleId", r.name;
  `,

  query4: (uaId) => `
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
    WHERE ua.id = '${uaId}'
    ORDER BY assessed_flag DESC, c.name;
  `,

  query5: (uaId) => `
    SELECT 
      c.name AS competency_name,
      rc."requiredLevel",
      cr.percentage AS achieved_pct,
      CASE 
        WHEN cr.percentage >= 75 THEN 'EXPERT'
        WHEN cr.percentage >= 50 THEN 'SENIOR'
        WHEN cr.percentage >= 25 THEN 'MIDDLE'
        ELSE 'JUNIOR'
      END AS achieved_level,
      CASE rc."requiredLevel"
        WHEN 'EXPERT' THEN 3
        WHEN 'SENIOR' THEN 2
        WHEN 'MIDDLE' THEN 1
        ELSE 0
      END -
      CASE 
        WHEN cr.percentage >= 75 THEN 3
        WHEN cr.percentage >= 50 THEN 2
        WHEN cr.percentage >= 25 THEN 1
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
    WHERE ua.id = '${uaId}'
    ORDER BY assessed_flag DESC, pct_gap DESC;
  `,
};

async function runDiagnostics() {
  try {
    console.log('🔍 Assessment Competency Diagnostic Tool\n');
    console.log('=' .repeat(60));

    // Query 1: Find anchor assessment
    console.log('\n📊 QUERY 1: Find Anchor Assessment (Top 10 by component count)\n');
    const q1Result = await pool.query(queries.query1);
    console.table(q1Result.rows);

    if (q1Result.rows.length === 0) {
      console.log('❌ No completed assessments found. Cannot proceed.');
      await pool.end();
      process.exit(0);
    }

    const anchorUaId = q1Result.rows[0].user_assessment_id;
    console.log(`\n✅ Using anchor assessment: ${anchorUaId} (${q1Result.rows[0].component_result_count} components)\n`);

    // Query 2: Assessed competencies
    console.log('=' .repeat(60));
    console.log('\n📝 QUERY 2: Competencies Assessed in This Session\n');
    const q2Result = await pool.query(queries.query2(anchorUaId));
    console.table(q2Result.rows);
    const assessedCount = q2Result.rows.length;
    console.log(`\n✅ Total assessed competencies: ${assessedCount}\n`);

    // Query 3: Role profile competencies
    console.log('=' .repeat(60));
    console.log('\n🎯 QUERY 3: Competencies on Role Profile\n');
    const q3Result = await pool.query(queries.query3(anchorUaId));
    console.table(q3Result.rows);
    const roleCount = q3Result.rows[0]?.role_competency_count || 0;
    console.log(`\n✅ Total role competencies: ${roleCount}`);
    if (roleCount > assessedCount) {
      console.log(`⚠️  BUG DETECTED: ${roleCount - assessedCount} competencies NOT assessed but in role profile!\n`);
    } else {
      console.log('✅ All role competencies were assessed.\n');
    }

    // Query 4: Side-by-side comparison
    console.log('=' .repeat(60));
    console.log('\n🔄 QUERY 4: Assessed vs Not Assessed (Side-by-Side)\n');
    const q4Result = await pool.query(queries.query4(anchorUaId));
    console.table(q4Result.rows);

    const notAssessed = q4Result.rows.filter(r => r.assessed_flag === 'NOT ASSESSED').length;
    console.log(`\n✅ Not assessed: ${notAssessed} competencies\n`);

    // Query 5: Gap verification
    console.log('=' .repeat(60));
    console.log('\n📉 QUERY 5: Gap Calculation Verification\n');
    const q5Result = await pool.query(queries.query5(anchorUaId));
    console.table(q5Result.rows);

    const problematicRows = q5Result.rows.filter(
      r => r.pct_gap > 25 && r.assessed_flag === 'NOT ASSESSED'
    );

    console.log('\n' + '=' .repeat(60));
    console.log('\n📋 SUMMARY\n');
    console.log(`Assessed Competencies: ${assessedCount}`);
    console.log(`Role Profile Competencies: ${roleCount}`);
    console.log(`Gap: ${roleCount - assessedCount} competencies not assessed`);
    console.log(`Problematic gaps (>25% but NOT ASSESSED): ${problematicRows.length}`);

    if (problematicRows.length > 0) {
      console.log('\n⚠️  Competencies with large gaps not assessed:');
      console.table(problematicRows.map(r => ({
        name: r.competency_name,
        required: r.requiredlevel,
        achieved: r.achieved_pct,
        gap: r.pct_gap.toFixed(1)
      })));
    }

    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ Diagnostic complete!\n');

    await pool.end();
  } catch (error) {
    console.error('❌ Error running diagnostics:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

runDiagnostics();

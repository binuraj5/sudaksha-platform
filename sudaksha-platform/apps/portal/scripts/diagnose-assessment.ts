/**
 * Diagnostic Script: Assessment Competency Gap Analysis
 * 
 * Analyzes which competencies were assessed in a session vs. required by role
 * to identify gaps in Training Needs Identification (TNI) generation
 * 
 * Usage: pnpm tsx scripts/diagnose-assessment.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
import * as pg from 'pg';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get database URL from environment
const dbUrl = process.env.ASSESSMENTS_DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ No database URL found. Check ASSESSMENTS_DATABASE_URL or DATABASE_URL in .env');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: dbUrl,
});

// Color output helpers
const log = {
  title: (text: string) => console.log('\n\x1b[36m' + '='.repeat(80) + '\x1b[0m\n' + '  ' + text + '\n' + '\x1b[36m' + '='.repeat(80) + '\x1b[0m\n'),
  section: (text: string) => console.log('\x1b[33m→ ' + text + '\x1b[0m'),
  success: (text: string) => console.log('\x1b[32m✓ ' + text + '\x1b[0m'),
  error: (text: string) => console.log('\x1b[31m✗ ' + text + '\x1b[0m'),
  data: (text: string) => console.log('  ' + text),
  table: (data: any) => console.table(data)
};

async function runDiagnostics() {
  try {
    log.title('ASSESSMENT COMPETENCY DIAGNOSTIC REPORT');

    // ========== Check available statuses ==========
    log.section('Checking assessment statuses in database...');
    
    const statusQuery = `
      SELECT DISTINCT status, COUNT(*)::integer as count
      FROM "UserAssessmentModel"
      GROUP BY status
      ORDER BY count DESC
    `;
    
    const statusResult = await pool.query(statusQuery);
    log.success(`Assessment statuses found:`);
    log.table(statusResult.rows);

    // Get the most common status or use first status if no COMPLETED
    const commonStatus = statusResult.rows[0]?.status || 'DRAFT';

    // ========== QUERY 1: Find anchor assessment ==========
    log.section(`Query 1: Finding assessments with component results (Status: ${commonStatus})...`);
    
    const query1 = `
      SELECT 
        uam.id AS assessment_id,
        uam."userId",
        am.name AS model_name,
        uam.status,
        uam."completedAt",
        COUNT(uac.id)::integer AS component_count
      FROM "UserAssessmentModel" uam
      JOIN "AssessmentModel" am ON am.id = uam."modelId"
      LEFT JOIN "UserAssessmentComponent" uac ON uac."userAssessmentModelId" = uam.id
      WHERE uam.status = $1 OR TRUE
      GROUP BY uam.id, uam."userId", am.name, uam.status, uam."completedAt"
      HAVING COUNT(uac.id) > 0
      ORDER BY component_count DESC
      LIMIT 10
    `;
    
    const result1 = await pool.query(query1, [commonStatus]);
    const assessments = result1.rows;

    if (assessments.length === 0) {
      log.error('No assessments with components found.');
      console.log('\nChecking total assessments...');
      const countQuery = 'SELECT COUNT(*)::integer as total FROM "UserAssessmentModel"';
      const countResult = await pool.query(countQuery);
      log.data(`Total assessments in database: ${countResult.rows[0].total}`);
      
      log.section('Checking total components...');
      const componentQuery = 'SELECT COUNT(*)::integer as total FROM "UserAssessmentComponent"';
      const componentResult = await pool.query(componentQuery);
      log.data(`Total components assessed: ${componentResult.rows[0].total}`);
      
      console.log('\nNote: If these numbers are low, the database may not have assessment data yet.');
      await pool.end();
      return;
    }

    log.success(`Found ${assessments.length} assessments with components`);
    log.table(assessments);

    const selectedAssessment = assessments[0];
    const ASSESSMENT_ID = selectedAssessment.assessment_id;
    const USER_ID = selectedAssessment.user_id;

    log.data(`\n📌 Using assessment: ${ASSESSMENT_ID} (${selectedAssessment.component_count} components)`);

    // ========== QUERY 2: Competencies ASSESSED in this session ==========
    log.section(`Query 2: Competencies ASSESSED in this assessment session`);

    const query2 = `
      SELECT 
        c.id,
        c.name AS competency_name,
        amc."targetLevel" AS required_level,
        uac.percentage AS achieved_percentage,
        uac.score AS achieved_score,
        uac.status,
        'ASSESSED' AS assessed_flag
      FROM "UserAssessmentComponent" uac
      JOIN "AssessmentModelComponent" amc ON amc.id = uac."componentId"
      JOIN "Competency" c ON c.id = amc."competencyId"
      WHERE uac."userAssessmentModelId" = $1
      AND amc."competencyId" IS NOT NULL
      ORDER BY c.name
    `;
    
    const result2 = await pool.query(query2, [ASSESSMENT_ID]);
    const assessedCompetencies = result2.rows;

    const assessedCount = assessedCompetencies.length;
    log.success(`${assessedCount} competencies were assessed`);
    
    if (assessedCount > 0) {
      log.table(assessedCompetencies.slice(0, 5));
      if (assessedCount > 5) {
        log.data(`... and ${assessedCount - 5} more`);
      }
    }

    // ========== QUERY 3: Role PROFILE competencies ==========
    log.section(`Query 3: Competencies REQUIRED by user's assigned role`);

    const query3 = `
      SELECT 
        u.id,
        u."assignedRoleId",
        r.name AS role_name,
        COUNT(rc.id)::integer AS role_competency_count
      FROM "UserAssessmentModel" uam
      JOIN "User" u ON u.id = uam."userId"
      LEFT JOIN "Role" r ON r.id = u."assignedRoleId"
      LEFT JOIN "RoleCompetency" rc ON rc."roleId" = r.id
      WHERE uam.id = $1
      GROUP BY u.id, u."assignedRoleId", r.name
    `;
    
    const result3 = await pool.query(query3, [ASSESSMENT_ID]);
    const roleInfo = result3.rows[0];

    if (roleInfo && roleInfo.role_name) {
      log.table(roleInfo);
      
      const roleCount = roleInfo.role_competency_count || 0;
      
      if (roleCount > assessedCount) {
        log.error(`⚠️  DELTA: Role requires ${roleCount} competencies but only ${assessedCount} were assessed`);
        log.data(`Missing from assessment: ${roleCount - assessedCount} competencies`);
      } else if (roleCount === assessedCount) {
        log.success(`✓ All ${roleCount} role competencies were assessed`);
      } else if (roleCount === 0) {
        log.error('No role assigned or role has no competencies defined');
      }
    } else {
      log.error('User has no assigned role');
    }

    // ========== QUERY 4: ASSESSED vs NOT ASSESSED comparison ==========
    log.section(`Query 4: Side-by-side ASSESSED vs NOT ASSESSED`);

    const query4 = `
      SELECT 
        c.name AS competency_name,
        rc."requiredLevel" AS role_required_level,
        amc."targetLevel" AS assessment_target_level,
        uac.percentage AS achieved_percentage,
        ROUND(uac.score::numeric, 1) AS achieved_score,
        uac.status AS component_status,
        CASE WHEN uac.id IS NOT NULL THEN 'ASSESSED' ELSE 'NOT ASSESSED' END AS assessed_flag
      FROM "Role" r
      LEFT JOIN "RoleCompetency" rc ON rc."roleId" = r.id
      LEFT JOIN "Competency" c ON c.id = rc."competencyId"
      LEFT JOIN "AssessmentModel" am ON am."projectId" = r.id 
        OR am.id IN (SELECT "modelId" FROM "UserAssessmentModel" WHERE "userId" = $2 LIMIT 1)
      LEFT JOIN "AssessmentModelComponent" amc ON amc."competencyId" = c.id 
        AND amc."modelId" = am.id
      LEFT JOIN "UserAssessmentComponent" uac ON uac."componentId" = amc.id 
        AND uac."userAssessmentModelId" = $1
      WHERE r.id = (
        SELECT u."currentRoleId" FROM "User" u 
        JOIN "UserAssessmentModel" uam ON uam."userId" = u.id 
        WHERE uam.id = $1 LIMIT 1
      )
      ORDER BY assessed_flag DESC, c.name
      LIMIT 50
    `;
    
    const result4 = await pool.query(query4, [ASSESSMENT_ID, USER_ID]);
    const comparisonData = result4.rows;

    const assessedBreakdown = {
      ASSESSED: comparisonData.filter((x: any) => x.assessed_flag === 'ASSESSED').length,
      NOT_ASSESSED: comparisonData.filter((x: any) => x.assessed_flag === 'NOT ASSESSED').length
    };

    log.success(`Breakdown: ${assessedBreakdown.ASSESSED} ASSESSED, ${assessedBreakdown.NOT_ASSESSED} NOT ASSESSED`);
    log.table(comparisonData.slice(0, 8));
    if (comparisonData.length > 8) {
      log.data(`... and ${comparisonData.length - 8} more`);
    }

    // ========== QUERY 5: Gap analysis ==========
    log.section(`Query 5: GAP CALCULATION VERIFICATION`);

    const query5 = `
      WITH competency_status AS (
        SELECT 
          c.id,
          c.name,
          rc."requiredLevel",
          uac.percentage,
          uac.status,
          CASE WHEN uac.id IS NOT NULL THEN 'ASSESSED' ELSE 'NOT ASSESSED' END AS assessed_flag,
          CASE rc."requiredLevel"
            WHEN 'EXPERT' THEN 3
            WHEN 'SENIOR' THEN 2
            WHEN 'MIDDLE' THEN 1
            ELSE 0
          END AS required_level_int,
          CASE 
            WHEN uac.percentage >= 75 THEN 3
            WHEN uac.percentage >= 50 THEN 2
            WHEN uac.percentage >= 25 THEN 1
            ELSE 0
          END AS achieved_level_int
        FROM "UserAssessmentModel" uam
        JOIN "User" u ON u.id = uam."userId"
        JOIN "Role" r ON r.id = u."currentRoleId"
        JOIN "RoleCompetency" rc ON rc."roleId" = r.id
        JOIN "Competency" c ON c.id = rc."competencyId"
        LEFT JOIN "AssessmentModel" am ON am.id = uam."modelId"
        LEFT JOIN "AssessmentModelComponent" amc ON amc."competencyId" = c.id AND amc."modelId" = am.id
        LEFT JOIN "UserAssessmentComponent" uac ON uac."componentId" = amc.id AND uac."userAssessmentModelId" = uam.id
        WHERE uam.id = $1
      )
      SELECT 
        name AS competency_name,
        "requiredLevel" AS required_level,
        percentage AS achieved_pct,
        "requiredLevel" AS required_level_label,
        CASE 
          WHEN percentage >= 75 THEN 'EXPERT'
          WHEN percentage >= 50 THEN 'SENIOR'
          WHEN percentage >= 25 THEN 'MIDDLE'
          ELSE 'JUNIOR'
        END AS achieved_level,
        (required_level_int - COALESCE(achieved_level_int, 0)) AS integer_gap,
        CASE "requiredLevel"
          WHEN 'EXPERT' THEN 75
          WHEN 'SENIOR' THEN 50
          WHEN 'MIDDLE' THEN 25
          ELSE 0
        END - COALESCE(percentage, 0) AS pct_gap,
        assessed_flag,
        status
      FROM competency_status
      ORDER BY assessed_flag DESC, pct_gap DESC
    `;
    
    const result5 = await pool.query(query5, [ASSESSMENT_ID]);
    const gapData = result5.rows;

    const problematicRows = gapData.filter((row: any) => 
      row.pct_gap > 0 && row.assessed_flag === 'NOT ASSESSED'
    );
    
    log.success(`Total competencies analyzed: ${gapData.length}`);
    if (problematicRows.length > 0) {
      log.error(`⚠️  CRITICAL: ${problematicRows.length} NOT ASSESSED competencies with positive gaps!`);
      log.table(problematicRows.slice(0, 5));
      if (problematicRows.length > 5) {
        log.data(`... and ${problematicRows.length - 5} more`);
      }
    } else {
      log.success('✓ No NOT ASSESSED competencies with positive gaps');
    }

    // ========== SUMMARY ==========
    log.title('DIAGNOSTIC SUMMARY');
    
    console.log(`
📊 Assessment: ${ASSESSMENT_ID}
👤 Role: ${roleInfo?.role_name || 'N/A'}
👤 User: ${USER_ID}

📈 Competency Counts:
   - Assessed in session: ${assessedCount}
   - Required by role: ${roleInfo?.role_competency_count || 0}
   - Delta: ${(roleInfo?.role_competency_count || 0) - assessedCount}

🎯 Assessment Breakdown:
   - Assessed: ${assessedBreakdown.ASSESSED}
   - Not Assessed: ${assessedBreakdown.NOT_ASSESSED}

⚠️  Issues Found:
   - Not assessed with gaps: ${problematicRows.length}
    `);

    if (assessedBreakdown.NOT_ASSESSED > 0) {
      log.error(`\n🔴 ISSUE: ${assessedBreakdown.NOT_ASSESSED} role competencies were NOT assessed in this session!`);
      log.data('This means TNI will be incomplete or missing competencies.\n');
    } else {
      log.success('\n🟢 All role competencies were assessed in this session.\n');
    }

  } catch (error) {
    log.error('Diagnostic Error:');
    console.error(error);
  } finally {
    try {
      await pool.end();
    } catch (e) {
      // ignore
    }
  }
}

runDiagnostics();


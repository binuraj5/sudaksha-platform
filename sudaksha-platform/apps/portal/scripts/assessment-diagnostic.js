import { PrismaClient } from '@sudaksha/db-assessments';

const prisma = new PrismaClient();

async function runAssessmentDiagnostics() {
    console.log('🔍 ASSESSMENT COMPETENCY DIAGNOSTIC REPORT');
    console.log('=' .repeat(60));

    try {
        // Query 1: Find anchor assessment
        console.log('\n📊 QUERY 1: Finding anchor assessment record...');
        const anchorAssessments = await prisma.userAssessment.findMany({
            where: { status: 'COMPLETED' },
            include: {
                _count: {
                    select: { componentResults: true }
                }
            },
            orderBy: {
                componentResults: { _count: 'desc' }
            },
            take: 10
        });

        if (anchorAssessments.length === 0) {
            console.log('❌ No completed assessments found!');
            return;
        }

        console.table(anchorAssessments.map(ua => ({
            user_assessment_id: ua.id,
            assessmentModelId: ua.assessmentModelId,
            userId: ua.userId,
            status: ua.status,
            tenantId: ua.tenantId,
            component_result_count: ua._count.componentResults
        })));

        const anchorUA = anchorAssessments[0];
        const uaId = anchorUA.id;
        console.log(`\n🎯 Using anchor assessment: ${uaId} (${anchorUA._count.componentResults} component results)`);

        // Query 2: Count assessed competencies
        console.log('\n📊 QUERY 2: Competencies actually assessed...');
        const assessedCompetencies = await prisma.componentResult.findMany({
            where: { userAssessmentId: uaId },
            include: {
                component: {
                    include: {
                        competency: true
                    }
                }
            },
            orderBy: {
                component: {
                    competency: { name: 'asc' }
                }
            }
        });

        console.table(assessedCompetencies.map(cr => ({
            component_result_id: cr.id,
            componentId: cr.componentId,
            percentage: cr.percentage,
            score: cr.score,
            status: cr.status,
            competency_name: cr.component?.competency?.name || 'Unknown'
        })));

        console.log(`✅ Assessed competencies count: ${assessedCompetencies.length}`);

        // Query 3: Role profile competencies
        console.log('\n📊 QUERY 3: Role profile competencies...');
        const roleProfile = await prisma.userAssessment.findUnique({
            where: { id: uaId },
            include: {
                user: {
                    include: {
                        currentRole: {
                            include: {
                                _count: {
                                    select: { roleCompetencies: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!roleProfile?.user?.currentRole) {
            console.log('❌ No role found for this user!');
            return;
        }

        console.table([{
            user_assessment_id: uaId,
            currentRoleId: roleProfile.user.currentRoleId,
            role_name: roleProfile.user.currentRole.name,
            role_competency_count: roleProfile.user.currentRole._count.roleCompetencies
        }]);

        const roleCompetencyCount = roleProfile.user.currentRole._count.roleCompetencies;
        console.log(`✅ Role profile competencies count: ${roleCompetencyCount}`);

        // Compare counts
        console.log('\n🔍 COMPARISON:');
        console.log(`Assessed competencies: ${assessedCompetencies.length}`);
        console.log(`Role profile competencies: ${roleCompetencyCount}`);
        if (roleCompetencyCount > assessedCompetencies.length) {
            console.log('🚨 BUG CONFIRMED: More role competencies than assessed!');
        } else {
            console.log('✅ Counts match - no gap detected');
        }

        // Query 4: Side-by-side comparison
        console.log('\n📊 QUERY 4: Side-by-side assessed vs role profile...');
        const sideBySide = await prisma.roleCompetency.findMany({
            where: {
                roleId: roleProfile.user.currentRoleId
            },
            include: {
                competency: true,
                assessmentComponents: {
                    where: {
                        assessmentModelId: anchorUA.assessmentModelId
                    },
                    include: {
                        componentResults: {
                            where: { userAssessmentId: uaId }
                        }
                    }
                }
            },
            orderBy: {
                competency: { name: 'asc' }
            }
        });

        const comparisonData = sideBySide.map(rc => {
            const assessmentComponent = rc.assessmentComponents[0];
            const componentResult = assessmentComponent?.componentResults[0];

            return {
                competency_name: rc.competency.name,
                requiredLevel: rc.requiredLevel,
                achieved_percentage: componentResult?.percentage || null,
                achieved_score: componentResult?.score || null,
                result_status: componentResult?.status || null,
                assessed_flag: componentResult ? 'ASSESSED' : 'NOT ASSESSED'
            };
        });

        console.table(comparisonData);

        // Count assessed vs not assessed
        const assessedCount = comparisonData.filter(c => c.assessed_flag === 'ASSESSED').length;
        const notAssessedCount = comparisonData.filter(c => c.assessed_flag === 'NOT ASSESSED').length;

        console.log(`✅ Assessed: ${assessedCount}, Not Assessed: ${notAssessedCount}`);

        // Query 5: Gap calculation verification
        console.log('\n📊 QUERY 5: Gap calculation verification...');
        const gapAnalysis = comparisonData.map(c => {
            const requiredPct = {
                'EXPERT': 75,
                'SENIOR': 50,
                'MIDDLE': 25,
                'JUNIOR': 0
            }[c.requiredLevel] || 0;

            const achievedPct = c.achieved_percentage || 0;

            const requiredInt = {
                'EXPERT': 3,
                'SENIOR': 2,
                'MIDDLE': 1,
                'JUNIOR': 0
            }[c.requiredLevel] || 0;

            const achievedInt = achievedPct >= 75 ? 3 : achievedPct >= 50 ? 2 : achievedPct >= 25 ? 1 : 0;

            return {
                competency_name: c.competency_name,
                requiredLevel: c.requiredLevel,
                achieved_pct: c.achieved_percentage,
                achieved_level: achievedPct >= 75 ? 'EXPERT' : achievedPct >= 50 ? 'SENIOR' : achievedPct >= 25 ? 'MIDDLE' : 'JUNIOR',
                integer_gap: requiredInt - achievedInt,
                pct_gap: requiredPct - achievedPct,
                assessed_flag: c.assessed_flag
            };
        });

        console.table(gapAnalysis);

        // Summary
        console.log('\n📋 SUMMARY REPORT');
        console.log('=' .repeat(40));
        console.log(`Anchor Assessment ID: ${uaId}`);
        console.log(`Assessed Competencies: ${assessedCompetencies.length}`);
        console.log(`Role Profile Competencies: ${roleCompetencyCount}`);
        console.log(`Gap Detected: ${roleCompetencyCount > assessedCompetencies.length ? 'YES' : 'NO'}`);
        console.log(`Assessed in Role Profile: ${assessedCount}/${comparisonData.length}`);

        const largeGapsNotAssessed = gapAnalysis.filter(g => g.pct_gap > 0 && g.assessed_flag === 'NOT ASSESSED');
        if (largeGapsNotAssessed.length > 0) {
            console.log(`\n🚨 CRITICAL: ${largeGapsNotAssessed.length} competencies have gaps but were NOT ASSESSED:`);
            largeGapsNotAssessed.forEach(g => {
                console.log(`  - ${g.competency_name}: Required ${g.requiredLevel}, Gap: ${g.pct_gap.toFixed(1)}%`);
            });
        }

    } catch (error) {
        console.error('❌ Error running diagnostics:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runAssessmentDiagnostics();
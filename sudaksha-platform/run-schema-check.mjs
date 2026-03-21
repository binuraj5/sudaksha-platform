import { PrismaClient } from './packages/db-core/generated/client/index.js';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();

async function main() {
    try {
        // Known UAM id from previous query: cmmd6rf8p000i12u1sy0fd2ln
        const uam = await prisma.userAssessmentModel.findFirst({
            where: { id: 'cmmd6rf8p000i12u1sy0fd2ln' },
            include: {
                componentResults: {
                    include: {
                        component: { include: { competency: true } }
                    }
                }
            }
        });

        const results = (uam?.componentResults ?? []).map((cr) => ({
            id: cr.id,
            componentType: cr.component?.componentType,
            competencyId: cr.component?.competencyId,
            competencyName: cr.component?.competency?.name,
            status: cr.status,
            percentage: cr.percentage,
            score: cr.score,
            maxScore: cr.maxScore,
        }));
        writeFileSync('/tmp/fix6-results.json', JSON.stringify(results, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
        console.log("Done. Written to /tmp/fix6-results.json. Count:", results.length);
    } catch(e) { console.error(e); } finally { await prisma.$disconnect(); }
}
main();

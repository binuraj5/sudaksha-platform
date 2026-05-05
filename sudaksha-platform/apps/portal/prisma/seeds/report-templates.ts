/**
 * ReportTemplate seed — four system report types
 * SEPL/INT/2026/IMPL-GAPS-01 Step G9
 * Patent claim C-06 — four structurally differentiated report templates
 *
 * DO NOT RUN automatically. Execute manually after review:
 *   npx ts-node apps/portal/prisma/seeds/report-templates.ts
 */

import { PrismaClient } from '../../generated/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: 'ADAPT-16 Individual Report',
    type: 'INDIVIDUAL',
    description: 'Patent C-06 T1 — 16-axis radar + three-lens summary for individual learner',
    isSystem: true,
    config: { templateType: 'INDIVIDUAL', sections: ['THREE_LENS', 'RADAR_CHART', 'CAREER_FIT', 'DELTA'] },
  },
  {
    name: 'Corporate Cohort Report',
    type: 'CORPORATE_COHORT',
    description: 'Patent C-06 T2 — team ADAPT-16 profile, gap heat map, WRI, ROI forecast',
    isSystem: true,
    config: { templateType: 'CORPORATE_COHORT', sections: ['WRI', 'RADAR_CHART', 'HEATMAP', 'ROI_FORECAST', 'BENCHMARK'] },
  },
  {
    name: 'Institutional Placement Report',
    type: 'INSTITUTIONAL',
    description: 'Patent C-06 T3 — student employability profiles, RIASEC distribution, placement readiness',
    isSystem: true,
    config: { templateType: 'INSTITUTIONAL', sections: ['BATCH_SUMMARY', 'EMPLOYABILITY_PROFILE', 'RIASEC', 'PLACEMENT_READINESS', 'STUDENT_PORTFOLIOS'] },
  },
  {
    name: 'Executive Strategic Report',
    type: 'EXECUTIVE',
    description: 'Patent C-06 T4 — board-ready WRI, culture health, succession coverage, strategic risks',
    isSystem: true,
    config: { templateType: 'EXECUTIVE', sections: ['WRI', 'CULTURE_HEALTH', 'SUCCESSION', 'RISKS', 'INTERVENTIONS'] },
  },
];

async function seed() {
  let upserted = 0;
  for (const t of templates) {
    await prisma.reportTemplate.upsert({
      where: { id: `system-${t.type.toLowerCase()}` },
      update: { name: t.name, description: t.description, config: t.config },
      create: {
        id: `system-${t.type.toLowerCase()}`,
        name: t.name,
        type: t.type,
        description: t.description,
        isSystem: true,
        config: t.config,
      },
    });
    upserted++;
  }
  console.log(`Seeded ${upserted} system report templates`);
  await prisma.$disconnect();
}

seed();

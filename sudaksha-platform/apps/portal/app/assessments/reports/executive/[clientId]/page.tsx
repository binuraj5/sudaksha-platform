/**
 * Executive / CHRO Strategic Report
 * SEPL/INT/2026/IMPL-GAPS-01 Step G11
 * Patent claim C-06 T4 — board-ready executive report
 *
 * Intentionally minimal: max 6 visual sections, no raw competency codes,
 * larger typography, more whitespace.
 *
 * Sections (6):
 *  1. Three headline numbers (WRI / Culture / Succession)
 *  2. Strategic risk summary (top 3, business language)
 *  3. Top talent identification (top 10% by competency avg)
 *  4. Recommended interventions (3 priority actions)
 *  5. 6-month trend sparkline (WRI direction)
 *  6. Download Board Brief button
 */

import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeWRI } from "@/lib/analytics/computeWorkforceReadinessIndex";
import { DownloadBoardBriefButton } from "@/components/Reports/DownloadBoardBriefButton";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Star, Target } from "lucide-react";

// ── Business consequence narratives per ADAPT-16 domain ─────────────────────
// Translates raw competency gaps into board-ready language (no codes).
const DOMAIN_RISK_NARRATIVE: Record<string, { domain: string; consequence: string }> = {
  A:  { domain: "Agility",    consequence: "threatens the organisation's ability to respond to market shifts" },
  D:  { domain: "Digital",    consequence: "threatens the AI adoption roadmap and digital transformation pace" },
  AL: { domain: "Alignment",  consequence: "compromises cross-functional execution and delivery velocity" },
  P:  { domain: "Purpose",    consequence: "weakens employee retention and culture continuity" },
  T:  { domain: "Thinking",   consequence: "limits strategic decision quality at middle and senior management" },
};

// Map competency codes to domain keys (used only internally — never rendered)
const CODE_TO_DOMAIN: Record<string, keyof typeof DOMAIN_RISK_NARRATIVE> = {
  "A-01":"A","A-02":"A","A-03":"A","A-04":"A",
  "D-01":"D","D-02":"D","D-03":"D",
  "AL-01":"AL","AL-02":"AL","AL-03":"AL",
  "P-01":"P","P-02":"P","P-03":"P",
  "T-01":"T","T-02":"T","T-03":"T",
};

// ── Investment / projected impact placeholders for interventions ───────────
const INTERVENTION_TEMPLATES: Record<string, { investment: string; projectedWri: string; action: string }> = {
  A:  { investment: "₹15–25L",  projectedWri: "+4–6%",  action: "Launch enterprise change agility programme covering all middle managers" },
  D:  { investment: "₹40–60L",  projectedWri: "+6–10%", action: "Roll out AI literacy bootcamp + upgrade data analytics infrastructure" },
  AL: { investment: "₹10–20L",  projectedWri: "+3–5%",  action: "Deploy cross-functional collaboration platform with structured ritual cadence" },
  P:  { investment: "₹8–15L",   projectedWri: "+2–4%",  action: "Refresh values framework with story-led leadership communication" },
  T:  { investment: "₹20–35L",  projectedWri: "+5–7%",  action: "Establish strategic thinking academy for high-potential leaders" },
};

export default async function ExecutiveReportPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const session = await getApiSession();
  if (!session) redirect("/assessments/login");

  const { clientId } = await params;
  const userRole = (session.user as any).role;
  const userClientId = (session.user as any).clientId ?? (session.user as any).tenantId;
  if (userRole !== "SUPER_ADMIN" && userClientId !== clientId) redirect("/assessments/login");

  // ── Fetch tenant ─────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.findUnique({
    where: { id: clientId },
    select: { name: true, type: true },
  });
  if (!tenant) redirect("/assessments/login");

  const sector = String(tenant.type ?? "DEFAULT").toUpperCase();

  // ── Headline 1: Workforce Future-Readiness Index ─────────────────────────
  const wri = await computeWRI(clientId, sector).catch(() => ({
    wri: 0, benchmark: 65, gap: 0, domainScores: {} as Record<string, number>, memberCount: 0,
  }));

  // ── Headline 2: Culture Health Score (SCIP VALUES mean, fallback 74) ────
  const valuesScores = await prisma.sCIPDimensionScore.findMany({
    where: {
      memberAssessment: { member: { tenantId: clientId }, status: "COMPLETED" },
      dimension: "VALUES",
    },
    select: { normalisedScore: true, rawScore: true },
  }).catch(() => []);

  let cultureHealth = 74; // placeholder per spec
  let cultureSource: "SCIP" | "PLACEHOLDER" = "PLACEHOLDER";
  if (valuesScores.length > 0) {
    const vals = valuesScores
      .map(v => v.normalisedScore ?? v.rawScore)
      .filter((n): n is number => typeof n === "number");
    if (vals.length > 0) {
      cultureHealth = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      cultureSource = "SCIP";
    }
  }

  // ── Headline 3: Succession Coverage ──────────────────────────────────────
  // Critical roles = roles with at least one critical competency in this tenant
  // Covered = at least one member has a CareerFitScore ≥ 70 for that role
  const criticalRoles = await prisma.role.findMany({
    where: {
      OR: [{ tenantId: clientId }, { tenantId: null, isActive: true }],
      competencies: { some: { isCritical: true } },
    },
    select: { id: true },
  });

  const coveredRoles = criticalRoles.length > 0
    ? await prisma.careerFitScore.findMany({
        where: {
          roleId: { in: criticalRoles.map(r => r.id) },
          fitScore: { gte: 70 },
          member: { tenantId: clientId },
        },
        distinct: ["roleId"],
        select: { roleId: true },
      })
    : [];

  const successionCoverage = criticalRoles.length > 0
    ? Math.round((coveredRoles.length / criticalRoles.length) * 100)
    : 0;

  // ── Section 2: Strategic risks (top 3 HIGH from gap analysis) ────────────
  // Aggregate competency-level gaps across the tenant from CompetencyScore
  const allScores = await prisma.competencyScore.findMany({
    where: {
      memberAssessment: { member: { tenantId: clientId }, status: "COMPLETED" },
      assessmentType: "ADAPT_16",
    },
    select: { competencyCode: true, proficiencyLevel: true },
  });

  // Domain-level avg + below-threshold count
  const domainAggregates: Record<string, { sum: number; count: number; belowThreshold: number; total: number }> = {};
  for (const s of allScores) {
    const dom = CODE_TO_DOMAIN[s.competencyCode];
    if (!dom) continue;
    if (!domainAggregates[dom]) domainAggregates[dom] = { sum: 0, count: 0, belowThreshold: 0, total: 0 };
    const d = domainAggregates[dom];
    d.sum += s.proficiencyLevel;
    d.count += 1;
    d.total += 1;
    if (s.proficiencyLevel < 2) d.belowThreshold += 1;
  }

  const memberCountInTenant = await prisma.member.count({
    where: { tenantId: clientId, type: { in: ["EMPLOYEE", "STUDENT"] } },
  });

  const strategicRisks = Object.entries(domainAggregates)
    .map(([dom, agg]) => ({
      dom,
      avg: agg.count > 0 ? agg.sum / agg.count : 0,
      belowPct: agg.total > 0 ? Math.round((agg.belowThreshold / agg.total) * 100) : 0,
      narrative: DOMAIN_RISK_NARRATIVE[dom],
    }))
    .filter(r => r.avg < 2.5 && r.narrative)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);

  // ── Section 3: Top talent — top 10% by avg proficiency ───────────────────
  // Aggregate per member: avg proficiencyLevel across all completed assessments
  const memberAvgs = new Map<string, number[]>();
  const scoresWithMembers = await prisma.competencyScore.findMany({
    where: {
      memberAssessment: { member: { tenantId: clientId }, status: "COMPLETED" },
    },
    select: {
      proficiencyLevel: true,
      memberAssessment: { select: { memberId: true } },
    },
  });

  for (const s of scoresWithMembers) {
    const mid = s.memberAssessment.memberId;
    if (!memberAvgs.has(mid)) memberAvgs.set(mid, []);
    memberAvgs.get(mid)!.push(s.proficiencyLevel);
  }

  const memberRankings = Array.from(memberAvgs.entries())
    .map(([memberId, levels]) => ({
      memberId,
      avgLevel: levels.reduce((a, b) => a + b, 0) / levels.length,
    }))
    .sort((a, b) => b.avgLevel - a.avgLevel);

  const topTenPctCount = Math.max(1, Math.ceil(memberRankings.length * 0.1));
  const topTenIds = memberRankings.slice(0, Math.min(10, topTenPctCount)).map(m => m.memberId);

  const topTalent = topTenIds.length > 0
    ? await prisma.member.findMany({
        where: { id: { in: topTenIds } },
        select: {
          id: true, firstName: true, lastName: true, name: true,
          orgUnit: { select: { name: true } },
        },
      })
    : [];

  const rankedTalent = memberRankings
    .slice(0, Math.min(10, topTenPctCount))
    .map((r, i) => {
      const m = topTalent.find(t => t.id === r.memberId);
      const fullName = m?.firstName || m?.lastName
        ? `${m?.firstName ?? ""} ${m?.lastName ?? ""}`.trim()
        : m?.name ?? "—";
      // Convert avg level (1–4) to a 0–100 score
      const score = Math.round(((r.avgLevel - 1) / 3) * 100);
      return {
        rank: i + 1,
        name: fullName,
        department: m?.orgUnit?.name ?? "—",
        score,
      };
    });

  // ── Section 4: Recommended interventions (top 3 from strategic risks) ────
  const interventions = strategicRisks
    .map(r => INTERVENTION_TEMPLATES[r.dom])
    .filter((x): x is (typeof INTERVENTION_TEMPLATES)[string] => x != null);

  // ── Section 5: 6-month trend ─────────────────────────────────────────────
  // Look for AssessmentDelta records to determine if there was a 2nd cycle
  const deltaCount = await prisma.assessmentDelta.count({
    where: { member: { tenantId: clientId } },
  });
  const recentDeltas = deltaCount > 0
    ? await prisma.assessmentDelta.findMany({
        where: { member: { tenantId: clientId } },
        select: { overallDelta: true },
        take: 100,
      })
    : [];

  const avgDelta = recentDeltas.length > 0
    ? recentDeltas
        .map(d => d.overallDelta ?? 0)
        .reduce((a, b) => a + b, 0) / recentDeltas.length
    : 0;

  const trendDirection: "up" | "flat" | "down" = avgDelta > 0.1 ? "up" : avgDelta < -0.1 ? "down" : "flat";

  // Sparkline: 6 placeholder points showing direction
  const sparkBase = wri.wri || 65;
  const sparkPoints = trendDirection === "up"
    ? [sparkBase - 5, sparkBase - 4, sparkBase - 3, sparkBase - 2, sparkBase - 1, sparkBase]
    : trendDirection === "down"
    ? [sparkBase + 5, sparkBase + 4, sparkBase + 3, sparkBase + 2, sparkBase + 1, sparkBase]
    : [sparkBase, sparkBase, sparkBase, sparkBase, sparkBase, sparkBase];

  const reportDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Back nav */}
      <div className="border-b px-8 py-4">
        <Link
          href={`/assessments/clients/${clientId}/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-16 space-y-20">

        {/* Page header — distinct typographic treatment */}
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">
            Sudaksha · Executive Strategic Report
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-none">
            {tenant.name}
          </h1>
          <p className="text-base text-gray-500">{reportDate}</p>
        </header>

        {/* ── SECTION 1: Three headline numbers ───────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-y border-gray-100 py-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-4">
              Workforce Future-Readiness
            </p>
            <p className={`text-8xl font-black tabular-nums leading-none ${
              wri.wri >= 70 ? "text-emerald-600"
              : wri.wri >= 55 ? "text-amber-600"
              : "text-red-600"
            }`}>
              {wri.wri}<span className="text-3xl text-gray-300">%</span>
            </p>
            <p className="text-sm text-gray-500 mt-3">
              {wri.gap >= 0
                ? `${wri.gap}% above industry benchmark`
                : `${Math.abs(wri.gap)}% below industry benchmark`}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-4">
              Culture Health
            </p>
            <p className={`text-8xl font-black tabular-nums leading-none ${
              cultureHealth >= 70 ? "text-emerald-600"
              : cultureHealth >= 55 ? "text-amber-600"
              : "text-red-600"
            }`}>
              {cultureHealth}<span className="text-3xl text-gray-300">%</span>
            </p>
            <p className="text-sm text-gray-500 mt-3">
              {cultureSource === "SCIP"
                ? "Values alignment across organisation"
                : "Awaiting SCIP deployment (placeholder)"}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-4">
              Succession Coverage
            </p>
            <p className={`text-8xl font-black tabular-nums leading-none ${
              successionCoverage >= 70 ? "text-emerald-600"
              : successionCoverage >= 50 ? "text-amber-600"
              : "text-red-600"
            }`}>
              {successionCoverage}<span className="text-3xl text-gray-300">%</span>
            </p>
            <p className="text-sm text-gray-500 mt-3">
              {criticalRoles.length === 0
                ? "No critical roles defined yet"
                : `${coveredRoles.length} of ${criticalRoles.length} critical roles covered`}
            </p>
          </div>
        </section>

        {/* ── SECTION 2: Strategic Risk Summary ───────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">Strategic Risks</h2>
          </div>
          {strategicRisks.length === 0 ? (
            <p className="text-base text-gray-500">
              No significant organisation-wide risks detected. Continue monitoring quarterly.
            </p>
          ) : (
            <div className="space-y-6">
              {strategicRisks.map((r, i) => {
                const peopleAffected = Math.round((r.belowPct / 100) * memberCountInTenant);
                return (
                  <div key={r.dom} className="flex items-start gap-6 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <p className="text-3xl font-black text-gray-300 tabular-nums leading-none mt-1 w-12 shrink-0">
                      0{i + 1}
                    </p>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900 mb-1">
                        {r.narrative.domain} gap {r.narrative.consequence}
                      </p>
                      <p className="text-sm text-gray-500">
                        {r.belowPct}% of assessed workforce
                        {peopleAffected > 0 ? ` (~${peopleAffected} employees)` : ""} below required threshold.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── SECTION 3: Top Talent Identification ────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Star className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Top Talent (10%)</h2>
          </div>
          {rankedTalent.length === 0 ? (
            <p className="text-base text-gray-500">
              No assessment data yet — top performer identification pending.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {rankedTalent.map(t => (
                <div key={t.rank} className="flex items-center gap-6 py-4">
                  <p className="text-2xl font-black text-gray-300 tabular-nums w-10 shrink-0">
                    {t.rank}
                  </p>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.department}</p>
                  </div>
                  <p className={`text-2xl font-black tabular-nums shrink-0 ${
                    t.score >= 70 ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    {t.score}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION 4: Recommended Interventions ────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Target className="h-5 w-5 text-indigo-500" />
            <h2 className="text-2xl font-bold text-gray-900">Recommended Interventions</h2>
          </div>
          {interventions.length === 0 ? (
            <p className="text-base text-gray-500">
              No priority interventions required at this time. Maintain quarterly review cadence.
            </p>
          ) : (
            <div className="space-y-5">
              {interventions.map((intv, i) => (
                <div key={i} className="flex items-start gap-6 p-6 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-black text-indigo-300 tabular-nums leading-none w-10 shrink-0">
                    0{i + 1}
                  </p>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 mb-3">{intv.action}</p>
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                      <span className="text-gray-500">
                        Investment: <span className="font-semibold text-gray-900">{intv.investment}</span>
                      </span>
                      <span className="text-gray-500">
                        Projected WRI uplift: <span className="font-semibold text-emerald-700">{intv.projectedWri}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION 5: 6-Month Trend ────────────────────────────────────── */}
        <section className="border-y border-gray-100 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-3">
                6-Month Readiness Trend
              </p>
              <p className="text-base text-gray-700">
                {deltaCount === 0
                  ? "Single assessment cycle — comparison pending second cycle."
                  : trendDirection === "up"
                  ? "Workforce readiness is improving cycle-over-cycle."
                  : trendDirection === "down"
                  ? "Workforce readiness has declined — intervention review recommended."
                  : "Workforce readiness is stable cycle-over-cycle."}
              </p>
            </div>
            {/* Inline SVG sparkline — distinct, minimal, no library overhead */}
            <svg viewBox="0 0 240 60" className="w-60 h-14">
              <polyline
                points={sparkPoints
                  .map((v, i) => {
                    const x = (i / (sparkPoints.length - 1)) * 240;
                    const y = 60 - (Math.min(100, Math.max(0, v)) / 100) * 60;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke={trendDirection === "up" ? "#10b981" : trendDirection === "down" ? "#ef4444" : "#9ca3af"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </section>

        {/* ── SECTION 6: Download Board Brief ─────────────────────────────── */}
        <section className="flex items-center justify-end pt-4">
          <DownloadBoardBriefButton clientId={clientId} />
        </section>

      </div>
    </div>
  );
}

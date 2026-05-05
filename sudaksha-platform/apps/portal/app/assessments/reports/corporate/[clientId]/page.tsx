/**
 * Corporate Cohort Report
 * SEPL/INT/2026/IMPL-GAPS-01 Step G9
 * Patent claim C-06 T2 — corporate cohort report template
 *
 * Sections (7):
 *  1. Header — client name, date, cohort size, coverage %
 *  2. Workforce Readiness Index — live from computeWRI
 *  3. Team ADAPT-16 Radar — cohort mean scores
 *  4. Competency Gap Heat Map — CompetencyHeatmap component
 *  5. Training ROI Forecast — top-3 gap competencies with business impact
 *  6. Benchmark Comparison — domain scores vs industry benchmark
 *  7. Module Attribution — placeholder
 */

import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeWRI } from "@/lib/analytics/computeWorkforceReadinessIndex";
import { ADAPT16RadarChart } from "@/components/Individual/ADAPT16RadarChart";
import { CompetencyHeatmap } from "@/components/Analytics/CompetencyHeatmap";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── ROI multipliers per domain (hardcoded estimates — patent spec G9) ──────
const DOMAIN_ROI: Record<string, { label: string; impact: string; metric: string }> = {
  A:  { label: "Agility",        impact: "~15%", metric: "improvement in change adoption rate" },
  D:  { label: "Digital",        impact: "~20%", metric: "improvement in technology adoption speed" },
  AL: { label: "Alignment",      impact: "~18%", metric: "improvement in cross-functional delivery" },
  P:  { label: "Purpose",        impact: "~12%", metric: "improvement in employee retention" },
  T:  { label: "Thinking",       impact: "~16%", metric: "improvement in decision quality" },
};

const DOMAIN_NAMES: Record<string, string> = {
  A: "Agility", D: "Digital Fluency", AL: "Collective Intelligence",
  P: "Purpose & Values", T: "Critical Thinking",
};

const DOMAIN_MAP: Record<string, string> = {
  "A-01": "A",  "A-02": "A",  "A-03": "A",  "A-04": "A",
  "D-01": "D",  "D-02": "D",  "D-03": "D",
  "AL-01": "AL","AL-02": "AL","AL-03": "AL",
  "P-01": "P",  "P-02": "P",  "P-03": "P",
  "T-01": "T",  "T-02": "T",  "T-03": "T",
};

export default async function CorporateCohortReportPage({
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

  // ── Fetch tenant info ────────────────────────────────────────────────────
  const tenant = await prisma.tenant.findUnique({
    where: { id: clientId },
    select: { name: true, type: true, createdAt: true },
  });
  if (!tenant) redirect("/assessments/login");

  // ── Fetch WRI ────────────────────────────────────────────────────────────
  const sector = String(tenant.type ?? "DEFAULT").toUpperCase();
  const wri = await computeWRI(clientId, sector).catch(() => ({
    wri: 0, benchmark: 65, gap: 0, domainScores: {} as Record<string, number>, memberCount: 0,
  }));

  // ── Fetch cohort ADAPT-16 scores for radar (mean per competency) ─────────
  const allScores = await prisma.competencyScore.findMany({
    where: {
      memberAssessment: { member: { tenantId: clientId }, status: "COMPLETED" },
      assessmentType: "ADAPT_16",
    },
    select: { competencyCode: true, proficiencyLevel: true },
  });

  // Group and average per competency code
  const codeMap: Record<string, number[]> = {};
  for (const s of allScores) {
    if (!codeMap[s.competencyCode]) codeMap[s.competencyCode] = [];
    codeMap[s.competencyCode].push(s.proficiencyLevel);
  }
  const radarScores = Object.entries(codeMap).map(([code, levels]) => ({
    code,
    name: code,
    level: parseFloat((levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(2)),
  })).sort((a, b) => a.code.localeCompare(b.code));

  // ── Cohort stats ─────────────────────────────────────────────────────────
  const memberCount = await prisma.member.count({ where: { tenantId: clientId } });
  const completedCount = wri.memberCount;
  const coveragePct = memberCount > 0 ? Math.round((completedCount / memberCount) * 100) : 0;

  // ── Top-3 domain gaps for ROI forecast ──────────────────────────────────
  // Gap = benchmark domain score - actual domain score (negative gap = below benchmark)
  const domainGaps = Object.entries(wri.domainScores)
    .map(([domain, score]) => ({ domain, score, gap: wri.benchmark - score }))
    .filter(d => d.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  // ── Benchmark comparison rows ────────────────────────────────────────────
  const benchmarkRows = Object.entries(DOMAIN_NAMES).map(([key, name]) => ({
    domain: key,
    name,
    score: wri.domainScores[key] ?? 0,
    benchmark: wri.benchmark,
    delta: (wri.domainScores[key] ?? 0) - wri.benchmark,
  }));

  const reportDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="bg-white border-b px-6 py-3">
        <Link
          href={`/assessments/clients/${clientId}/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* ── SECTION 1: Header ───────────────────────────────────────────── */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Sudaksha · Corporate Cohort Report
              </p>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {tenant.name}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{reportDate}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{memberCount}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Cohort Size</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{coveragePct}%</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Coverage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Assessed</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: Workforce Readiness Index ────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Workforce Readiness Index
          </h2>
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              {wri.memberCount === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  No ADAPT-16 assessment data yet. Assign ADAPT-16 assessments to generate this metric.
                </p>
              ) : (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div>
                    <p className={`text-7xl font-black tabular-nums ${
                      wri.wri >= 70 ? "text-green-600" : wri.wri >= 55 ? "text-amber-600" : "text-red-600"
                    }`}>
                      {wri.wri}
                      <span className="text-3xl text-gray-400">%</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Industry benchmark: <span className="font-semibold text-gray-700">{wri.benchmark}%</span>
                    </p>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {wri.gap >= 0
                        ? <TrendingUp className="h-5 w-5 text-green-500" />
                        : <TrendingDown className="h-5 w-5 text-red-500" />}
                      <span className={`text-lg font-bold ${wri.gap >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {wri.gap > 0 ? "+" : ""}{wri.gap}% vs benchmark
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {wri.gap >= 0
                        ? "Organisation is above the industry benchmark — a competitive advantage."
                        : "Organisation is below the industry benchmark — targeted intervention recommended."}
                    </p>
                    <div className="mt-3 w-full bg-gray-100 rounded-full h-3 relative">
                      <div
                        className={`h-3 rounded-full ${wri.wri >= 70 ? "bg-green-500" : wri.wri >= 55 ? "bg-amber-400" : "bg-red-500"}`}
                        style={{ width: `${Math.min(100, wri.wri)}%` }}
                      />
                      {/* Benchmark marker */}
                      <div
                        className="absolute top-0 w-0.5 h-3 bg-gray-600"
                        style={{ left: `${Math.min(100, wri.benchmark)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0</span>
                      <span>Benchmark {wri.benchmark}%</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── SECTION 3: Team ADAPT-16 Radar ──────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Team ADAPT-16 Cohort Profile
          </h2>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Cohort Mean Competency Profile</CardTitle>
              <CardDescription>Average proficiency level (1–4) per competency across all assessed members</CardDescription>
            </CardHeader>
            <CardContent>
              {radarScores.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">
                  No ADAPT-16 data yet — radar chart will populate after assessments are completed.
                </p>
              ) : (
                <ADAPT16RadarChart scores={radarScores} />
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── SECTION 4: Competency Gap Heat Map ──────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Competency Gap Heat Map
          </h2>
          <CompetencyHeatmap clientId={clientId} />
        </section>

        {/* ── SECTION 5: Training ROI Forecast ────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Training ROI Forecast
          </h2>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Top-3 Gap Closure Opportunities</CardTitle>
              <CardDescription>
                Estimated business impact of closing each domain gap by 1 proficiency level.
                Based on placeholder ROI multipliers — real correlation data available after pilot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {domainGaps.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400">
                  {wri.memberCount === 0
                    ? "Complete assessments to see ROI forecast."
                    : "All domains are at or above benchmark — no gaps to address."}
                </div>
              ) : (
                <div className="space-y-4">
                  {domainGaps.map(({ domain, score, gap }, i) => {
                    const roi = DOMAIN_ROI[domain];
                    if (!roi) return null;
                    return (
                      <div key={domain} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{roi.label} Domain</p>
                            <Badge variant="outline" className="text-[11px] text-red-600 border-red-200 bg-red-50">
                              {Math.round(gap)}pt below benchmark
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Closing this gap by 1 level: estimated{" "}
                            <span className="font-semibold text-green-700">{roi.impact}</span>{" "}
                            {roi.metric}.
                          </p>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-indigo-500"
                              style={{ width: `${Math.min(100, score)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Current: {score}% · Benchmark: {wri.benchmark}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── SECTION 6: Benchmark Comparison ─────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Benchmark Comparison
          </h2>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Domain Scores vs Industry Benchmark ({wri.benchmark}%)</CardTitle>
            </CardHeader>
            <CardContent>
              {benchmarkRows.every(r => r.score === 0) ? (
                <p className="text-sm text-gray-400 py-4 text-center">No ADAPT-16 data yet.</p>
              ) : (
                <div className="divide-y">
                  {benchmarkRows.map(row => (
                    <div key={row.domain} className="flex items-center gap-4 py-3">
                      <div className="w-36 shrink-0">
                        <p className="text-sm font-medium text-gray-800">{row.name}</p>
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 relative">
                        <div
                          className={`h-2 rounded-full ${row.score >= row.benchmark ? "bg-green-500" : "bg-red-400"}`}
                          style={{ width: `${Math.min(100, row.score)}%` }}
                        />
                        <div
                          className="absolute top-0 w-0.5 h-2 bg-gray-500"
                          style={{ left: `${row.benchmark}%` }}
                        />
                      </div>
                      <div className="w-20 text-right shrink-0">
                        <span className="text-sm font-semibold tabular-nums text-gray-700">{row.score}%</span>
                      </div>
                      <div className="w-16 text-right shrink-0">
                        {row.delta === 0 ? (
                          <Minus className="h-4 w-4 text-gray-400 ml-auto" />
                        ) : row.delta > 0 ? (
                          <span className="text-xs font-semibold text-green-600">+{row.delta}%</span>
                        ) : (
                          <span className="text-xs font-semibold text-red-500">{row.delta}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── SECTION 7: Module Attribution ───────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Module Attribution
          </h2>
          <Card className="border-none shadow-sm bg-gray-50 border-dashed border-gray-200">
            <CardContent className="py-10 flex flex-col items-center text-center gap-3">
              <BookOpen className="h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Enable LMS to see training attribution</p>
              <p className="text-xs text-gray-400 max-w-sm">
                Once the Learning Management System is activated, this section will show which
                training modules contributed to competency improvements per department.
              </p>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}

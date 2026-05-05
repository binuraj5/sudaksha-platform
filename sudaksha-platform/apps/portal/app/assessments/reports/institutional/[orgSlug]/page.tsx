/**
 * Institutional Placement Report
 * SEPL/INT/2026/IMPL-GAPS-01 Step G10
 * Patent claim C-06 T3 — institutional report template
 *
 * Sections (7):
 *  1. Batch header — institution name, batch year, student count, completion %
 *  2. Batch ADAPT-16 Summary — cohort mean radar ("Student Employability Profile")
 *  3. SCIP Career Clusters — RIASEC distribution across the batch
 *  4. Curriculum Gap Analysis — competencies systematically low (<L2) with interventions
 *  5. Placement Readiness Index — % of students at L2+ on ≥12/16 competencies
 *  6. Individual Student Portfolios — paginated (20/page), ADAPT-16 + SCIP + career fits
 *  7. Semester Progress — placeholder
 */

import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADAPT16RadarChart } from "@/components/Individual/ADAPT16RadarChart";
import Link from "next/link";
import { ArrowLeft, GraduationCap, CheckCircle2, AlertCircle, Users, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 20;

// ── ADAPT-16 competency labels ───────────────────────────────────────────────
const COMPETENCY_LABELS: Record<string, string> = {
  "A-01": "Learning Agility",   "A-02": "Cognitive Flexibility",
  "A-03": "Resilience",         "A-04": "Ambiguity Tolerance",
  "D-01": "AI Literacy",        "D-02": "Data-Driven Decisions",
  "D-03": "Digital Fluency",    "AL-01": "Collaborative Intelligence",
  "AL-02": "Social/EI",         "AL-03": "Influence & Communication",
  "P-01": "Growth Mindset",     "P-02": "Metacognition",
  "P-03": "Values-Based Decisions", "T-01": "Critical Thinking",
  "T-02": "Systems Thinking",   "T-03": "Creative Thinking",
};

// ── Curriculum intervention suggestions per competency code ─────────────────
const CURRICULUM_INTERVENTIONS: Record<string, string> = {
  "A-01": "Add project-based learning rotations to expose students to novel problem spaces",
  "A-02": "Introduce interdisciplinary electives requiring students to shift cognitive frameworks",
  "A-03": "Incorporate stress-inoculation workshops and reflective journaling modules",
  "A-04": "Add capstone projects with deliberately incomplete briefs to build ambiguity tolerance",
  "D-01": "Integrate AI tools into existing coursework; add a standalone AI Literacy module",
  "D-02": "Add data analytics labs using real-world datasets; partner with industry for case studies",
  "D-03": "Update lab infrastructure; require digital collaboration tools across all courses",
  "AL-01": "Increase cross-disciplinary group projects with structured peer evaluation",
  "AL-02": "Add emotional intelligence workshops; include 360° peer feedback in assessments",
  "AL-03": "Introduce debate, presentation, and negotiation modules to the curriculum",
  "P-01": "Embed growth mindset frameworks in orientation; celebrate effort over outcome in grading",
  "P-02": "Add reflective practice components (learning journals, portfolio assessments)",
  "P-03": "Introduce applied ethics courses; add case studies with moral complexity",
  "T-01": "Shift assessments from recall to analysis; add Socratic seminar sessions",
  "T-02": "Introduce systems thinking tools (causal loop diagrams) across engineering/management courses",
  "T-03": "Add design thinking sprints and hackathon modules to build creative problem-solving",
};

// ── RIASEC type labels ───────────────────────────────────────────────────────
const RIASEC_LABELS: Record<string, string> = {
  R: "Realistic", I: "Investigative", A: "Artistic",
  S: "Social",    E: "Enterprising",  C: "Conventional",
};

export default async function InstitutionalReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getApiSession();
  if (!session) redirect("/assessments/login");

  const { orgSlug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));

  // ── Auth + tenant resolution ─────────────────────────────────────────────
  const tenant = await prisma.tenant.findUnique({
    where: { slug: orgSlug },
    select: { id: true, name: true, type: true, createdAt: true },
  });
  if (!tenant) redirect("/assessments/login");

  const userRole = (session.user as any).role;
  const userTenantId = (session.user as any).clientId ?? (session.user as any).tenantId;
  if (userRole !== "SUPER_ADMIN" && userTenantId !== tenant.id) redirect("/assessments/login");

  // ── Fetch all student members ────────────────────────────────────────────
  const allMembers = await prisma.member.findMany({
    where: { tenantId: tenant.id, type: "STUDENT" },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      assessments: {
        where: { status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 1,
        select: { id: true, completedAt: true },
      },
    },
    orderBy: { lastName: "asc" },
  });

  const totalStudents = allMembers.length;
  const studentsAssessed = allMembers.filter(m => m.assessments.length > 0).length;
  const coveragePct = totalStudents > 0 ? Math.round((studentsAssessed / totalStudents) * 100) : 0;
  const batchYear = tenant.createdAt.getFullYear();

  // ── ADAPT-16 scores for all assessed students ────────────────────────────
  const assessedIds = allMembers
    .filter(m => m.assessments.length > 0)
    .map(m => m.assessments[0].id);

  const allAdaptScores = assessedIds.length > 0
    ? await prisma.competencyScore.findMany({
        where: {
          memberAssessmentId: { in: assessedIds },
          assessmentType: "ADAPT_16",
        },
        select: { memberAssessmentId: true, competencyCode: true, proficiencyLevel: true },
      })
    : [];

  // Group by competency for cohort radar (mean level)
  const codeMap: Record<string, number[]> = {};
  for (const s of allAdaptScores) {
    if (!codeMap[s.competencyCode]) codeMap[s.competencyCode] = [];
    codeMap[s.competencyCode].push(s.proficiencyLevel);
  }
  const radarScores = Object.entries(codeMap)
    .map(([code, levels]) => ({
      code,
      name: COMPETENCY_LABELS[code] ?? code,
      level: parseFloat((levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(2)),
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  // ── Curriculum Gap Analysis — competencies with cohort avg < L2 ──────────
  const gapCompetencies = radarScores
    .filter(r => r.level < 2)
    .sort((a, b) => a.level - b.level);

  // ── Placement Readiness ──────────────────────────────────────────────────
  // Group scores by assessment
  const scoresByAssessment: Record<string, number[]> = {};
  for (const s of allAdaptScores) {
    if (!scoresByAssessment[s.memberAssessmentId]) scoresByAssessment[s.memberAssessmentId] = [];
    scoresByAssessment[s.memberAssessmentId].push(s.proficiencyLevel);
  }
  const readyCount = Object.values(scoresByAssessment).filter(
    levels => levels.filter(l => l >= 2).length >= 12
  ).length;
  const placementReadinessPct = studentsAssessed > 0
    ? Math.round((readyCount / studentsAssessed) * 100)
    : 0;

  // ── SCIP RIASEC distribution ─────────────────────────────────────────────
  const scipScores = assessedIds.length > 0
    ? await prisma.sCIPDimensionScore.findMany({
        where: { memberAssessmentId: { in: assessedIds }, dimension: "RIASEC" },
        select: { subScores: true },
      })
    : [];

  const riasecCounts: Record<string, number> = {};
  for (const s of scipScores) {
    const sub = s.subScores as any;
    const code: string = sub?.hollandCode ?? sub?.primaryType ?? "";
    // Count each letter in the 2–3 char Holland code
    for (const ch of code.toUpperCase()) {
      if (RIASEC_LABELS[ch]) riasecCounts[ch] = (riasecCounts[ch] ?? 0) + 1;
    }
  }
  const totalRiasecVotes = Object.values(riasecCounts).reduce((a, b) => a + b, 0);
  const riasecDistribution = Object.entries(riasecCounts)
    .map(([type, count]) => ({
      type,
      label: RIASEC_LABELS[type] ?? type,
      count,
      pct: totalRiasecVotes > 0 ? Math.round((count / totalRiasecVotes) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // ── Individual Student Portfolios — paginated ────────────────────────────
  const paginatedMembers = allMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(totalStudents / PAGE_SIZE);

  // Fetch per-student data for this page
  const pageAssessmentIds = paginatedMembers
    .filter(m => m.assessments.length > 0)
    .map(m => m.assessments[0].id);

  type AdaptRow = { memberAssessmentId: string; competencyCode: string; proficiencyLevel: number };
  type ScipRow  = { memberAssessmentId: string; subScores: unknown };

  const [pageAdaptScores, pageScipScores, pageCareerFits] = await Promise.all([
    pageAssessmentIds.length > 0
      ? prisma.competencyScore.findMany({
          where: { memberAssessmentId: { in: pageAssessmentIds }, assessmentType: "ADAPT_16" },
          select: { memberAssessmentId: true, competencyCode: true, proficiencyLevel: true },
        })
      : Promise.resolve([] as AdaptRow[]),
    pageAssessmentIds.length > 0
      ? prisma.sCIPDimensionScore.findMany({
          where: { memberAssessmentId: { in: pageAssessmentIds }, dimension: "RIASEC" },
          select: { memberAssessmentId: true, subScores: true },
        })
      : Promise.resolve([] as ScipRow[]),
    paginatedMembers.length > 0
      ? prisma.careerFitScore.findMany({
          where: {
            memberId: { in: paginatedMembers.map(m => m.id) },
            rank: { in: [1, 2, 3] },
          },
          include: { role: { select: { name: true } } },
          orderBy: [{ memberId: "asc" }, { rank: "asc" }],
        })
      : Promise.resolve([] as Awaited<ReturnType<typeof prisma.careerFitScore.findMany<{ include: { role: { select: { name: true } } } }>>>),
  ]);

  // Index for fast lookup
  const adaptByAssessment: Record<string, typeof pageAdaptScores> = {};
  for (const s of pageAdaptScores) {
    if (!adaptByAssessment[s.memberAssessmentId]) adaptByAssessment[s.memberAssessmentId] = [];
    adaptByAssessment[s.memberAssessmentId].push(s);
  }
  const scipByAssessment: Record<string, string> = {};
  for (const s of pageScipScores) {
    const sub = s.subScores as any;
    scipByAssessment[s.memberAssessmentId] = sub?.hollandCode ?? sub?.primaryType ?? "—";
  }
  const fitsByMember: Record<string, string[]> = {};
  for (const f of pageCareerFits) {
    if (!fitsByMember[f.memberId]) fitsByMember[f.memberId] = [];
    fitsByMember[f.memberId].push(f.role.name);
  }

  const reportDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="bg-white border-b px-6 py-3">
        <Link
          href={`/assessments/org/${orgSlug}/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* ── SECTION 1: Batch Header ──────────────────────────────────────── */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Sudaksha · Institutional Placement Report
              </p>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{tenant.name}</h1>
              <p className="text-gray-500 text-sm mt-1">
                Batch {batchYear} · {reportDate}
              </p>
            </div>
            <div className="flex gap-6 shrink-0">
              {[
                { value: totalStudents, label: "Students" },
                { value: `${coveragePct}%`, label: "Coverage" },
                { value: studentsAssessed, label: "Assessed" },
                { value: `${placementReadinessPct}%`, label: "Ready" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 2: Batch ADAPT-16 Summary ───────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Student Employability Profile
          </h2>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Cohort ADAPT-16 Competency Radar</CardTitle>
              <CardDescription>
                Mean proficiency level (1–4) across all assessed students in this batch
              </CardDescription>
            </CardHeader>
            <CardContent>
              {radarScores.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">
                  No ADAPT-16 data yet. Assign ADAPT-16 assessments to students to generate this profile.
                </div>
              ) : (
                <ADAPT16RadarChart scores={radarScores} />
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── SECTION 3: SCIP Career Clusters ─────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            SCIP Career Clusters — RIASEC Distribution
          </h2>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Holland Code Distribution</CardTitle>
              <CardDescription>
                Career orientation breakdown across the batch, based on SCIP RIASEC scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {riasecDistribution.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No SCIP RIASEC data yet. Assign SCIP assessments to populate career cluster analysis.
                </div>
              ) : (
                <div className="space-y-3">
                  {riasecDistribution.map(({ type, label, count, pct }) => (
                    <div key={type} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {type}
                      </div>
                      <div className="w-32 shrink-0">
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-indigo-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-24 text-right shrink-0 text-sm text-gray-600 tabular-nums">
                        {pct}% <span className="text-gray-400">({count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── SECTION 4: Curriculum Gap Analysis ──────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Curriculum Gap Analysis
          </h2>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Systematically Low Competencies</CardTitle>
              <CardDescription>
                Competencies where cohort average is below Level 2 — requiring curriculum intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {radarScores.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400">
                  No assessment data yet.
                </div>
              ) : gapCompetencies.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-2 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                  <p className="text-sm font-medium text-green-700">All competencies above Level 2</p>
                  <p className="text-xs text-gray-400">No systematic curriculum gaps detected in this batch.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gapCompetencies.map(({ code, name, level }) => (
                    <div key={code} className="p-4 rounded-lg bg-red-50 border border-red-100">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{name}</p>
                          <p className="text-xs text-gray-500">{code}</p>
                        </div>
                        <Badge variant="outline" className="text-[11px] text-red-600 border-red-200 bg-white shrink-0">
                          Avg L{level.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="flex items-start gap-2 mt-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-600">
                          {CURRICULUM_INTERVENTIONS[code] ?? "Review and strengthen this competency area in the curriculum."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── SECTION 5: Placement Readiness Index ────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Placement Readiness Index
          </h2>
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              {studentsAssessed === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  No assessed students yet.
                </p>
              ) : (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div>
                    <p className={`text-7xl font-black tabular-nums ${
                      placementReadinessPct >= 70 ? "text-green-600"
                      : placementReadinessPct >= 50 ? "text-amber-600"
                      : "text-red-600"
                    }`}>
                      {placementReadinessPct}
                      <span className="text-3xl text-gray-400">%</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {readyCount} of {studentsAssessed} assessed students
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Minimum employability threshold: L2+ on at least 12 of 16 competencies
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          placementReadinessPct >= 70 ? "bg-green-500"
                          : placementReadinessPct >= 50 ? "bg-amber-400"
                          : "bg-red-500"
                        }`}
                        style={{ width: `${placementReadinessPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      {placementReadinessPct >= 70
                        ? "Strong placement readiness — cohort is broadly employable."
                        : placementReadinessPct >= 50
                        ? "Moderate readiness — targeted interventions recommended for at-risk students."
                        : "Below threshold — curriculum-level intervention required."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── SECTION 6: Individual Student Portfolios ─────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Individual Student Portfolios
            </h2>
            <p className="text-xs text-gray-400">
              Page {currentPage} of {totalPages || 1}
            </p>
          </div>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                Student Profiles
              </CardTitle>
              <CardDescription>
                ADAPT-16 summary · SCIP Holland code · Top 3 career matches
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {paginatedMembers.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No students enrolled yet.</div>
              ) : (
                <div className="divide-y">
                  {paginatedMembers.map((member, idx) => {
                    const assessmentId = member.assessments[0]?.id;
                    const adaptScores = assessmentId ? (adaptByAssessment[assessmentId] ?? []) : [];
                    const hollandCode = assessmentId ? (scipByAssessment[assessmentId] ?? "—") : "—";
                    const topCareers = fitsByMember[member.id] ?? [];
                    const assessed = assessmentId != null;

                    // Quick ADAPT-16 summary: avg level
                    const avgLevel = adaptScores.length > 0
                      ? (adaptScores.reduce((s, r) => s + r.proficiencyLevel, 0) / adaptScores.length).toFixed(1)
                      : null;
                    const isReady = adaptScores.filter(s => s.proficiencyLevel >= 2).length >= 12;

                    return (
                      <div key={member.id} className="flex items-start gap-4 px-4 py-4 hover:bg-gray-50">
                        {/* Rank */}
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          {(currentPage - 1) * PAGE_SIZE + idx + 1}
                        </div>

                        {/* Name + email */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900">
                              {member.firstName} {member.lastName}
                            </p>
                            {assessed && (
                              isReady
                                ? <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-1.5">Ready</Badge>
                                : <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-1.5">Developing</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{member.email}</p>

                          {assessed ? (
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                              {avgLevel && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Avg L{avgLevel}
                                </span>
                              )}
                              {hollandCode !== "—" && (
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3" />
                                  SCIP: <span className="font-mono font-semibold">{hollandCode}</span>
                                </span>
                              )}
                              {topCareers.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {topCareers.slice(0, 3).join(" · ")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-gray-400 italic">Not yet assessed</p>
                          )}
                        </div>

                        {/* Download Portfolio placeholder */}
                        <button
                          disabled
                          title="PDF generation coming soon"
                          className="shrink-0 px-3 py-1.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-md bg-gray-50 cursor-not-allowed"
                        >
                          Download PDF
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {currentPage > 1 && (
                <Link
                  href={`/assessments/reports/institutional/${orgSlug}?page=${currentPage - 1}`}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700"
                >
                  Previous
                </Link>
              )}
              <span className="px-3 py-1.5 text-sm text-gray-500">
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/assessments/reports/institutional/${orgSlug}?page=${currentPage + 1}`}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </section>

        {/* ── SECTION 7: Semester Progress ─────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Semester Progress
          </h2>
          <Card className="border-none shadow-sm bg-gray-50 border-dashed border-gray-200">
            <CardContent className="py-10 flex flex-col items-center text-center gap-3">
              <TrendingUp className="h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Semester-over-semester progress tracking</p>
              <p className="text-xs text-gray-400 max-w-sm">
                Run a second assessment cycle to compare cohort growth across semesters.
                AssessmentDelta data will populate this section automatically after the second cycle completes.
              </p>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}

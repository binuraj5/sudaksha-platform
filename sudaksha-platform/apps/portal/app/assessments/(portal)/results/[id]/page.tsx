import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    ChevronLeft,
    Trophy,
    Calendar,
    Clock,
    BrainCircuit,
    BookOpen,
    TrendingUp,
    Target,
    AlertTriangle,
    Star,
    Sparkles,
    User2,
    CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CompetencyGapAnalysis } from "@/components/assessments/CompetencyGapAnalysis";
import {
    getGapBand,
    GAP_BAND_PRIORITY,
    GAP_BAND_LABEL,
    GAP_BAND_SORT_ORDER,
    generateTNIJustification,
    buildCareerContext,
    getExperienceStanding,
    computeOverallFitment,
    getReadinessVerdict,
    type GapBand,
} from "@/lib/tni-utils";
import { generateReportNarratives, type GapRow } from "@/lib/report-ai";

// ─── Colour helpers ────────────────────────────────────────────────────────────

const BAND_COLOUR: Record<GapBand, { bg: string; text: string; border: string }> = {
    EXCEEDS:          { bg: "bg-emerald-50",  text: "text-emerald-800",  border: "border-emerald-200" },
    MET:              { bg: "bg-green-50",    text: "text-green-800",    border: "border-green-200" },
    NEAR_TARGET:      { bg: "bg-teal-50",     text: "text-teal-800",     border: "border-teal-200" },
    MODERATE_GAP:     { bg: "bg-amber-50",    text: "text-amber-800",    border: "border-amber-200" },
    SIGNIFICANT_GAP:  { bg: "bg-orange-50",   text: "text-orange-800",   border: "border-orange-200" },
    CRITICAL_GAP:     { bg: "bg-red-50",      text: "text-red-800",      border: "border-red-200" },
};

const VERDICT_COLOUR: Record<string, string> = {
    green:  "text-emerald-700 bg-emerald-100",
    teal:   "text-teal-700 bg-teal-100",
    amber:  "text-amber-700 bg-amber-100",
    orange: "text-orange-700 bg-orange-100",
    red:    "text-red-700 bg-red-100",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function IndividualResultPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getApiSession();
    const { id } = await params;

    if (!session) {
        redirect("/assessments/login");
    }

    // ── 1. Load data ─────────────────────────────────────────────────────────

    let assessment = await prisma.projectUserAssessment.findFirst({
        where: { id, userId: session.user.id },
        include: {
            projectAssignment: {
                include: { model: true }
            },
            user: {
                include: {
                    assignedRole: {
                        include: {
                            competencies: { include: { competency: true } }
                        }
                    }
                }
            },
            componentResults: {
                include: {
                    component: { include: { competency: true } },
                }
            }
        }
    });

    let isB2C = false;
    let passingScoreLevel = assessment?.projectAssignment?.model?.passingScore || 60;
    let totalTimeAccumulated = assessment?.totalTimeSpent || 0;
    if (assessment && !totalTimeAccumulated) {
        totalTimeAccumulated = assessment.componentResults.reduce((sum, cr) => sum + (cr.timeSpent || 0), 0);
    }

    let member: any = null;

    if (!assessment) {
        member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "" },
            select: {
                id: true,
                name: true,
                designation: true,
                careerFormData: true,
                currentRoleId: true,
                aspirationalRoleId: true,
                currentRole: {
                    include: {
                        competencies: { include: { competency: true } }
                    }
                },
                aspirationalRole: { select: { id: true, name: true } },
            }
        });

        if (member) {
            const memberAssessment = await prisma.memberAssessment.findFirst({
                where: { id, memberId: member.id },
                include: {
                    assessmentModel: true,
                    member: { select: { name: true } }
                }
            });

            if (memberAssessment) {
                passingScoreLevel = memberAssessment.assessmentModel.passingScore || 60;

                const uam = await prisma.userAssessmentModel.findFirst({
                    where: { userId: session.user.id!, modelId: memberAssessment.assessmentModelId },
                    orderBy: { createdAt: "desc" },
                    include: {
                        componentResults: {
                            include: {
                                component: { include: { competency: true } },
                            }
                        }
                    }
                });

                if (uam) {
                    isB2C = true;
                    const componentResults = uam.componentResults;
                    const totalTimeSpent = componentResults.reduce((s: number, r: { timeSpent?: number | null }) => s + (r.timeSpent ?? 0), 0);
                    assessment = {
                        id: memberAssessment.id,
                        status: memberAssessment.status,
                        overallScore: memberAssessment.overallScore,
                        passed: memberAssessment.passed,
                        completedAt: memberAssessment.completedAt,
                        totalTimeSpent,
                        projectAssignment: { model: memberAssessment.assessmentModel },
                        componentResults,
                        user: null,
                    } as any;
                    totalTimeAccumulated = totalTimeSpent;
                }
            }
        }
    }

    if (!assessment) notFound();

    // ── 2. Determine mode ────────────────────────────────────────────────────

    const assignedRole = isB2C
        ? (member as any)?.currentRole
        : (assessment as any).user?.assignedRole;

    const isRoleBased = !!assignedRole?.competencies?.length;
    const roleName = assignedRole?.name || "Standalone Assessment";
    const aspirationalRoleName = (member as any)?.aspirationalRole?.name ?? "";
    const memberName = isB2C
        ? (member?.name ?? "")
        : ((assessment as any).user?.name ?? "");

    // ── 3. Synthesise competency scores (Fix 2 + Fix 3) ─────────────────────
    //
    // Rules:
    //   a) Group component results by competencyId — one synthesised score per competency.
    //   b) Weight by component.weight (Float @default 1.0).
    //   c) SKIP instrument results (VIDEO/VOICE/ADAPTIVE_AI/ADAPTIVE_QUESTIONNAIRE)
    //      that are uncalibrated — detected by all numeric score fields being equal
    //      OR by percentage being exactly the hardcoded default (70).
    //      These must never enter synthesis.
    //   d) Components with no competencyId are skipped.

    const INSTRUMENT_TYPES = new Set(["VIDEO", "VOICE", "ADAPTIVE_AI", "ADAPTIVE_QUESTIONNAIRE"]);

    function isUncalibratedInstrument(cr: any): boolean {
        const type = cr.component?.componentType ?? "";
        if (!INSTRUMENT_TYPES.has(type)) return false;
        // Uncalibrated: percentage is the hardcoded fallback value (70), or component has no real score
        const pct = cr.percentage ?? null;
        if (pct === null) return true;          // no score at all — skip
        if (pct === 70 && cr.status !== "COMPLETED") return true; // default placeholder
        // Treat all-equal dimension pattern (video fallback) as uncalibrated
        // We don't have dimension fields here, so we rely on the 70% sentinel:
        // if an instrument result is exactly 70 and score equals maxScore*0.7, it's the default.
        // Safest signal: if percentage === 70 for a video/adaptive type, skip it.
        if (pct === 70 && INSTRUMENT_TYPES.has(type)) return true;
        return false;
    }

    function synthesizeCompetencyScores(
        componentResults: any[],
    ): Map<string, { avgPct: number; count: number; name: string; category: string }> {
        const acc = new Map<string, { weightedSum: number; totalWeight: number; name: string; category: string; count: number }>();
        for (const cr of componentResults) {
            const compId = cr.component?.competencyId;
            if (!compId) continue;  // unlinked component — skip

            // Fix 3: exclude uncalibrated instrument results
            if (isUncalibratedInstrument(cr)) continue;

            const pct = cr.percentage ?? (cr.maxScore > 0 ? ((cr.score ?? 0) / cr.maxScore) * 100 : null);
            if (pct === null) continue;  // no usable score — skip

            const w = cr.component?.weight ?? 1.0;
            if (!acc.has(compId)) {
                acc.set(compId, {
                    weightedSum: 0, totalWeight: 0, count: 0,
                    name: cr.component?.competency?.name ?? compId,
                    category: cr.component?.competency?.category ?? ""
                });
            }
            const e = acc.get(compId)!;
            e.weightedSum += pct * w;
            e.totalWeight += w;
            e.count += 1;
        }
        const result = new Map<string, { avgPct: number; count: number; name: string; category: string }>();
        for (const [compId, e] of acc) {
            result.set(compId, {
                avgPct: e.totalWeight > 0 ? e.weightedSum / e.totalWeight : 0,
                count: e.count,
                name: e.name,
                category: e.category,
            });
        }
        return result;
    }

    const competencyScores = synthesizeCompetencyScores(assessment.componentResults || []);

    // ── 4. Gap analysis rows — ONLY assessed competencies ────────────────────

    const gapRows: GapRow[] = [];

    if (isRoleBased && assessment.status === "COMPLETED") {
        for (const rc of assignedRole.competencies) {
            const compId = rc.competencyId;
            const scoreEntry = competencyScores.get(compId);
            if (!scoreEntry || scoreEntry.count === 0) continue;  // unassessed — skip

            const gapBand = getGapBand(scoreEntry.avgPct, rc.requiredLevel);
            gapRows.push({
                competencyName: rc.competency.name,
                category: rc.competency.category ?? "",
                achievedPct: scoreEntry.avgPct,
                requiredLevel: rc.requiredLevel,
                gap: gapBand,
                gapLabel: GAP_BAND_LABEL[gapBand],
            });
        }
    }

    // ── 5. TNI rows (Fix 5 — always call generateTNIJustification) ───────────

    const trainingNeeds: any[] = [];

    if (isRoleBased && assessment.status === "COMPLETED") {
        for (const rc of assignedRole.competencies) {
            const compId = rc.competencyId;
            const scoreEntry = competencyScores.get(compId);
            if (!scoreEntry || scoreEntry.count === 0) continue;

            const gapBand = getGapBand(scoreEntry.avgPct, rc.requiredLevel);
            if (gapBand === "EXCEEDS" || gapBand === "MET") continue;

            const priority = GAP_BAND_PRIORITY[gapBand];

            // Check if justification is already cached in any component result for this competency
            const mainCr = (assessment.componentResults || []).find(
                (cr: any) => cr.component?.competencyId === compId && !isUncalibratedInstrument(cr)
            );

            const aiObj: Record<string, any> =
                mainCr && typeof mainCr.aiEvaluationResults === "object" && mainCr.aiEvaluationResults !== null
                    ? mainCr.aiEvaluationResults
                    : {};

            let justification: string = aiObj.tniJustification ?? "";

            // Fix 5: always generate if not cached — never fall back to generic string
            // unless the API call itself fails (generateTNIJustification handles that internally)
            if (!justification) {
                justification = await generateTNIJustification(
                    rc.competency.name,
                    scoreEntry.avgPct,
                    rc.requiredLevel,
                    gapBand,
                    roleName,
                );
                // Cache to the first non-instrument component result if available
                if (mainCr) {
                    try {
                        await prisma.userAssessmentComponent.update({
                            where: { id: mainCr.id },
                            data: { aiEvaluationResults: { ...aiObj, tniJustification: justification } },
                        });
                    } catch (_) { /* cache write failure is non-fatal */ }
                }
            }

            trainingNeeds.push({
                competencyName: rc.competency.name,
                gapBand,
                gapLabel: GAP_BAND_LABEL[gapBand],
                achievedPct: scoreEntry.avgPct,
                requiredLevel: rc.requiredLevel,
                priority,
                justification,
                sortOrder: GAP_BAND_SORT_ORDER[gapBand],
            });
        }
        trainingNeeds.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    // ── 6. Fitment & readiness ───────────────────────────────────────────────

    const fitmentPct = computeOverallFitment(gapRows);
    const readiness = getReadinessVerdict(fitmentPct);
    const rawScore = Math.round(assessment.overallScore || 0);

    // ── 7. Career context & AI narratives ────────────────────────────────────

    const careerCtx = member
        ? buildCareerContext(member, roleName, aspirationalRoleName)
        : null;

    const narratives = await generateReportNarratives({
        memberName,
        roleBasedMode: isRoleBased,
        roleName,
        overallScore: rawScore,
        fitmentPct,
        readinessLabel: readiness.label,
        gapRows,
        trainingCount: trainingNeeds.length,
        careerCtx,
    });

    // ── 8. Competency profile for Mode A (role-based) & Mode B (standalone) ──

    // Mode A: show gapRows (already synthesised, one entry per assessed role competency)
    // Mode B: show all assessed competencies from the synthesised map
    const standaloneCompetencies = !isRoleBased
        ? Array.from(competencyScores.entries()).map(([compId, e]) => ({
            competencyId: compId,
            name: e.name,
            category: e.category,
            achievedPct: e.avgPct,
            standing: getExperienceStanding(e.avgPct),
        }))
        : [];

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-8 mt-12 pb-16 max-w-7xl mx-auto">
            {/* Back navigation */}
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href={isB2C ? "/assessments/individuals/dashboard" : "/assessments/results"}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {isB2C ? "Back to Dashboard" : "Back to My Results"}
                    </Link>
                </Button>
            </header>

            {/* ── Section 1: Executive Summary ─────────────────────────────── */}
            {/* Fix 4: Fitment Index is the headline number. Raw score is small/muted. */}
            <section>
                <Card className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 text-white border-none shadow-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
                    <div className="relative z-10 p-6 space-y-4">
                        {/* Top row */}
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-6 w-6 text-amber-300 shrink-0" />
                                    <h1 className="text-2xl font-black text-white">Assessment Report</h1>
                                </div>
                                <p className="text-indigo-200 text-sm pl-8">
                                    {memberName && <><span className="font-semibold">{memberName}</span> · </>}
                                    {assessment.projectAssignment?.model?.name ?? "Competency Assessment"}
                                    {isRoleBased && <> · <span className="font-semibold">{roleName}</span></>}
                                </p>
                            </div>

                            {/* Scores: Fitment is hero; raw score is muted */}
                            <div className="flex items-end gap-5">
                                {isRoleBased ? (
                                    <div className="text-right">
                                        <p className="text-6xl font-black leading-none">{fitmentPct}%</p>
                                        <p className="text-[11px] text-indigo-300 uppercase tracking-widest mt-1">Role Fitment Index</p>
                                        <p className="text-[11px] text-indigo-400 mt-0.5">Avg component score: {rawScore}%</p>
                                    </div>
                                ) : (
                                    <div className="text-right">
                                        <p className="text-6xl font-black leading-none">{rawScore}%</p>
                                        <p className="text-[11px] text-indigo-300 uppercase tracking-widest mt-1">Overall Score</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Readiness */}
                        {isRoleBased && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                                <Star className="h-3.5 w-3.5 text-amber-300" />
                                <span className="text-sm font-bold text-white">{readiness.label}</span>
                                <span className="text-xs text-indigo-200">— {readiness.description}</span>
                            </div>
                        )}

                        {/* AI Executive Summary */}
                        <div className="pt-2 border-t border-white/10">
                            <p className="text-sm text-indigo-100 leading-relaxed flex items-start gap-2">
                                <Sparkles className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" />
                                {narratives.executiveSummary}
                            </p>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap gap-6 pt-2 border-t border-white/10 text-xs text-indigo-300">
                            <span className="flex items-center gap-1">
                                <User2 className="h-3 w-3" />
                                {memberName || "Candidate"}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {assessment.completedAt ? format(assessment.completedAt, "PPP") : "N/A"}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {totalTimeAccumulated ? `${Math.round(Number(totalTimeAccumulated) / 60)} mins` : "—"}
                            </span>
                            <Badge className="bg-white/15 text-white border-none text-[10px] uppercase tracking-wider">
                                {assessment.status}
                            </Badge>
                        </div>
                    </div>
                </Card>
            </section>

            {/* ── Section 2: Role Fitment & Gap Analysis (Mode A only) ──────── */}
            {isRoleBased && gapRows.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <Target className="h-5 w-5 text-indigo-600" />
                        Role Fitment & Gap Analysis
                        <Badge variant="outline" className="ml-auto font-mono text-indigo-700 border-indigo-200 text-xs">
                            Mode A — Role-Based
                        </Badge>
                    </h2>

                    {narratives.gapInsight && (
                        <Card className="border-indigo-100 bg-indigo-50/50">
                            <CardContent className="p-4">
                                <p className="text-sm text-indigo-800 leading-relaxed flex items-start gap-2">
                                    <Sparkles className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                                    {narratives.gapInsight}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-3">
                        {gapRows
                            .sort((a, b) => GAP_BAND_SORT_ORDER[a.gap] - GAP_BAND_SORT_ORDER[b.gap])
                            .map((row, i) => {
                                const colours = BAND_COLOUR[row.gap];
                                return (
                                    <Card key={i} className={`border overflow-hidden ${colours.border} ${colours.bg}`}>
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-sm text-gray-900">{row.competencyName}</span>
                                                    <Badge variant="outline" className={`text-[10px] uppercase border px-2 ${colours.border} ${colours.text}`}>
                                                        {row.gapLabel}
                                                    </Badge>
                                                    {row.category && (
                                                        <Badge variant="outline" className="text-[10px] bg-gray-100 border-gray-200 text-gray-500">
                                                            {row.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Progress value={row.achievedPct} className="h-1.5 flex-1" />
                                                    <span className="text-xs font-bold text-gray-600 w-10 text-right">
                                                        {Math.round(row.achievedPct)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Required</p>
                                                <p className="text-xs font-bold text-gray-700">{row.requiredLevel}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        }
                    </div>

                    {!isB2C && <CompetencyGapAnalysis assessmentId={id} />}
                </section>
            )}

            {/* ── Section 3: Competency Profile ────────────────────────────── */}
            {/* Fix 1 + Fix 2: no instrument blocks; one card per synthesised competency */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <BrainCircuit className="h-5 w-5 text-indigo-600" />
                    Competency Profile
                    {!isRoleBased && (
                        <Badge variant="outline" className="ml-auto font-mono text-gray-600 border-gray-300 text-xs">
                            Mode B — Standalone
                        </Badge>
                    )}
                </h2>

                {/* Mode A — render gapRows (synthesised, one per assessed role competency) */}
                {isRoleBased && gapRows.length > 0 && (
                    <div className="grid gap-3">
                        {gapRows
                            .sort((a, b) => b.achievedPct - a.achievedPct)
                            .map((row, i) => {
                                const colours = BAND_COLOUR[row.gap];
                                return (
                                    <Card key={i} className={`border overflow-hidden ${colours.border}`}>
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-sm text-gray-900">{row.competencyName}</span>
                                                    <Badge variant="outline" className={`text-[10px] uppercase border px-2 ${colours.border} ${colours.text}`}>
                                                        {row.gapLabel}
                                                    </Badge>
                                                    {row.category && (
                                                        <Badge variant="outline" className="text-[10px] bg-gray-100 border-gray-200 text-gray-500">
                                                            {row.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Progress value={row.achievedPct} className="h-1.5 flex-1" />
                                                    <span className="text-xs font-bold text-gray-600 w-10 text-right">
                                                        {Math.round(row.achievedPct)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Score</p>
                                                <p className="text-lg font-black text-gray-800">{Math.round(row.achievedPct)}%</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </div>
                )}

                {/* Mode B — standalone: all assessed competencies from the synthesised map */}
                {!isRoleBased && standaloneCompetencies.length > 0 && (
                    <div className="grid gap-3">
                        {standaloneCompetencies
                            .sort((a, b) => b.achievedPct - a.achievedPct)
                            .map((comp, i) => (
                                <Card key={i} className="border-gray-100 shadow-sm overflow-hidden">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-gray-900">{comp.name}</span>
                                                <Badge variant="outline" className="text-[10px] bg-gray-50 border-gray-200 text-gray-500">
                                                    {comp.standing}
                                                </Badge>
                                                {comp.category && (
                                                    <Badge variant="outline" className="text-[10px] bg-gray-100 border-gray-200 text-gray-500">
                                                        {comp.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <Progress value={comp.achievedPct} className="h-1.5 mt-2" />
                                        </div>
                                        <p className="text-xl font-black text-gray-800 shrink-0">
                                            {Math.round(comp.achievedPct)}%
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}

                {/* Empty state */}
                {competencyScores.size === 0 && (
                    <Card className="border-dashed bg-slate-50/50">
                        <CardContent className="p-8 text-center text-gray-500">
                            <CheckCircle2 className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                            <p>No competency data available yet.</p>
                            <p className="text-sm mt-1">Results will appear here once the assessment is completed.</p>
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* ── Section 4: Training Need Identification ───────────────────── */}
            {isRoleBased && trainingNeeds.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <BookOpen className="h-5 w-5 text-amber-600" />
                        Training Need Identification
                        <Badge className="ml-auto bg-amber-100 text-amber-800 border-none text-xs">
                            {trainingNeeds.length} intervention{trainingNeeds.length !== 1 ? "s" : ""} recommended
                        </Badge>
                    </h2>
                    <div className="grid gap-3">
                        {trainingNeeds.map((need, i) => {
                            const colours = BAND_COLOUR[need.gapBand as GapBand];
                            return (
                                <Card key={i} className={`border overflow-hidden ${colours.border}`}>
                                    <div className={`h-1 w-full ${need.gapBand === "CRITICAL_GAP" ? "bg-red-500" : need.gapBand === "SIGNIFICANT_GAP" ? "bg-orange-500" : "bg-amber-400"}`} />
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className={`h-4 w-4 ${need.gapBand === "CRITICAL_GAP" ? "text-red-600" : "text-amber-600"}`} />
                                                <span className="font-bold text-sm text-gray-900">{need.competencyName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-[10px] uppercase border ${colours.border} ${colours.text}`}>
                                                    {need.gapLabel}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] bg-gray-50 border-gray-200 text-gray-500">
                                                    Required: {need.requiredLevel}
                                                </Badge>
                                                <span className="text-xs font-bold text-gray-600">
                                                    Score: {Math.round(need.achievedPct)}%
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[13px] text-gray-600 leading-relaxed italic border-t pt-2 border-dashed border-gray-200">
                                            {need.justification}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    {isB2C && (
                        <div className="text-right">
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" asChild>
                                <Link href="/assessments/individuals/career">Update Career Goals</Link>
                            </Button>
                        </div>
                    )}
                </section>
            )}

            {/* ── Section 5: Performance Trajectory ────────────────────────── */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    Performance Trajectory
                </h2>
                <Card className="border-indigo-100 shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        {isRoleBased && (
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${VERDICT_COLOUR[readiness.color] ?? "text-gray-700 bg-gray-100"}`}>
                                <Star className="h-4 w-4" />
                                {readiness.label} — {readiness.description}
                            </div>
                        )}

                        <p className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                            {narratives.capabilityTrajectory}
                        </p>

                        {careerCtx && (careerCtx.strengths.length > 0 || careerCtx.areasToImprove.length > 0 || careerCtx.certifications.length > 0) && (
                            <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                {careerCtx.strengths.length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Strengths</p>
                                        <ul className="space-y-0.5">
                                            {careerCtx.strengths.slice(0, 4).map((s, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-center gap-1">
                                                    <span className="text-green-500">✓</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {careerCtx.areasToImprove.length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Development Areas</p>
                                        <ul className="space-y-0.5">
                                            {careerCtx.areasToImprove.slice(0, 4).map((a, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-center gap-1">
                                                    <span className="text-amber-500">→</span> {a}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {careerCtx.certifications.length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Certifications</p>
                                        <ul className="space-y-0.5">
                                            {careerCtx.certifications.slice(0, 3).map((c, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-center gap-1">
                                                    <span className="text-indigo-500">◆</span> {c}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {careerCtx && careerCtx.learningPreferences.length > 0 && (
                            <div className="border-t pt-3">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Preferred Learning Modes</p>
                                <div className="flex flex-wrap gap-2">
                                    {careerCtx.learningPreferences.map((lp, i) => (
                                        <Badge key={i} variant="outline" className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700">
                                            {lp}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {isB2C && (
                    <div className="flex justify-end">
                        <Button asChild className="bg-gray-900 hover:bg-gray-800">
                            <Link href="/assessments/individuals/dashboard">Return to Dashboard</Link>
                        </Button>
                    </div>
                )}
            </section>
        </div>
    );
}

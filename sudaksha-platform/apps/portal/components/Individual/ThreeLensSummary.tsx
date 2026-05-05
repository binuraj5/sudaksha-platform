/**
 * ThreeLensSummary — shows RBCA, ADAPT-16, and SCIP status as three lens cards
 * SEPL/INT/2026/IMPL-STEPS-01 Step 18
 *
 * Renders at the top of the individual dashboard.
 * Pure presentational — data is fetched server-side and passed as props.
 * SCIP data is null until Step 22+ deploys the SCIP instrument.
 */

interface LensData {
    rbca?: {
        score: number;      // 0–100 overall role-fit score
        target: number;     // target proficiency (usually 85)
        gaps: number;       // count of competencies below target
    } | null;
    adapt16?: {
        avgLevel: number;   // average L1-L6 numeric level (e.g. 3.4)
        strongDomain: string;
        weakDomain: string;
    } | null;
    scip?: {
        hollandCode: string;        // e.g. "RIA"
        cognitivePercentile: number; // 0–100
    } | null;
}

export function ThreeLensSummary({ data }: { data: LensData }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            {/* ── RBCA Lens ── */}
            <div className="bg-white rounded-xl border border-emerald-100 border-t-4 border-t-emerald-500 shadow-sm p-4 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                    Role Readiness · RBCA
                </p>
                <p className="text-3xl font-black text-emerald-600 tabular-nums leading-none">
                    {data.rbca != null ? `${data.rbca.score}%` : "—"}
                </p>
                <p className="text-xs text-gray-500 leading-snug">
                    {data.rbca != null
                        ? `vs ${data.rbca.target}% target · ${data.rbca.gaps} gap${data.rbca.gaps !== 1 ? "s" : ""} identified`
                        : "Complete RBCA assessment to see your role fit score"}
                </p>
                {data.rbca != null && (
                    <div className="pt-2">
                        <div className="w-full bg-emerald-50 rounded-full h-1.5">
                            <div
                                className="h-1.5 rounded-full bg-emerald-400"
                                style={{ width: `${Math.min(100, data.rbca.score)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── ADAPT-16 Lens ── */}
            <div className="bg-white rounded-xl border border-violet-100 border-t-4 border-t-violet-500 shadow-sm p-4 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                    Future Readiness · ADAPT-16
                </p>
                <p className="text-3xl font-black text-violet-600 tabular-nums leading-none">
                    {data.adapt16 != null ? `L${data.adapt16.avgLevel.toFixed(1)}` : "—"}
                </p>
                <p className="text-xs text-gray-500 leading-snug">
                    {data.adapt16 != null
                        ? `Strong: ${data.adapt16.strongDomain} · Gap: ${data.adapt16.weakDomain}`
                        : "Complete ADAPT-16 assessment to see your readiness level"}
                </p>
                {data.adapt16 != null && (
                    <div className="pt-2">
                        <div className="w-full bg-violet-50 rounded-full h-1.5">
                            {/* L1–L6 scale: fill = (avgLevel / 6) * 100 */}
                            <div
                                className="h-1.5 rounded-full bg-violet-400"
                                style={{ width: `${Math.min(100, (data.adapt16.avgLevel / 6) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── SCIP Lens ── */}
            <div className="bg-white rounded-xl border border-orange-100 border-t-4 border-t-orange-400 shadow-sm p-4 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
                    Career Fit · SCIP
                </p>
                <p className="text-3xl font-black text-orange-500 tabular-nums leading-none">
                    {data.scip != null ? data.scip.hollandCode : "—"}
                </p>
                <p className="text-xs text-gray-500 leading-snug">
                    {data.scip != null
                        ? `Cognitive: ${data.scip.cognitivePercentile}th percentile`
                        : "Take SCIP assessment to unlock your career fit profile"}
                </p>

            </div>

        </div>
    );
}

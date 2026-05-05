"use client";

/**
 * CareerFitMatches — top career role matches from CareerFitScore
 * SEPL/INT/2026/IMPL-STEPS-01 Step 19
 *
 * Fetches from GET /api/career/fit/[memberId].
 * Shows top 3 roles with fit score bar and gap summary.
 * Returns graceful empty state when no matches exist.
 *
 * Fit score bar colours:
 *   ≥ 80%  → #1D9E75 (green)
 *   ≥ 65%  → #BA7517 (amber)
 *   < 65%  → #E24B4A (red)
 */

import { useEffect, useState } from "react";
import { Loader2, Briefcase, TrendingUp } from "lucide-react";

export interface CareerMatch {
    roleId: string;
    roleName: string;
    fitScore: number;
    scipFit?: number;
    adapt16AvgLevel?: number;
    gapCount?: number;
}

function fitColor(score: number): string {
    if (score >= 80) return "#1D9E75";
    if (score >= 65) return "#BA7517";
    return "#E24B4A";
}

function fitLabel(score: number): string {
    if (score >= 80) return "Strong match";
    if (score >= 65) return "Partial match";
    return "Needs development";
}

interface CareerFitMatchesProps {
    memberId: string;
}

export function CareerFitMatches({ memberId }: CareerFitMatchesProps) {
    const [matches, setMatches] = useState<CareerMatch[]>([]);
    const [riasecCluster, setRiasecCluster] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!memberId) { setLoading(false); return; }
        fetch(`/api/career/fit/${memberId}`)
            .then(r => r.ok ? r.json() : { matches: [] })
            .then(d => { 
                setMatches(d.matches ?? []); 
                if (d.riasecCluster) setRiasecCluster(d.riasecCluster);
            })
            .catch(() => { /* stays empty */ })
            .finally(() => setLoading(false));
    }, [memberId]);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <div className="p-3 bg-gray-100 rounded-full">
                    <Briefcase className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No career matches yet</p>
                <p className="text-xs text-gray-400 max-w-[240px]">
                    Complete an assessment to see which roles you are best suited for
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {riasecCluster && (
                <div className="mb-4 bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-orange-900">Career Personality: {riasecCluster}</p>
                        <p className="text-xs text-orange-700 mt-0.5">Your SCIP data suggests you thrive in environments that match this cluster.</p>
                    </div>
                </div>
            )}
            {matches.slice(0, 3).map((m, idx) => (
                <div
                    key={m.roleId ?? idx}
                    className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                >
                    {/* Rank */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        idx === 0 ? "bg-amber-100 text-amber-700"
                        : idx === 1 ? "bg-gray-200 text-gray-600"
                        : "bg-orange-100 text-orange-600"
                    }`}>
                        {idx + 1}
                    </div>

                    {/* Role info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{m.roleName}</p>
                        <p className="text-xs mt-0.5" style={{ color: fitColor(m.fitScore) }}>
                            {fitLabel(m.fitScore)}
                            {m.gapCount !== undefined && m.gapCount > 0
                                ? ` · ${m.gapCount} gap${m.gapCount !== 1 ? "s" : ""} to close`
                                : m.gapCount === 0 ? " · All competencies met" : ""}
                        </p>
                    </div>

                    {/* Score bar */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(100, m.fitScore)}%`,
                                    backgroundColor: fitColor(m.fitScore),
                                }}
                            />
                        </div>
                        <span className="text-sm font-bold tabular-nums w-9 text-right"
                            style={{ color: fitColor(m.fitScore) }}>
                            {Math.round(m.fitScore)}%
                        </span>
                    </div>
                </div>
            ))}

            {matches.length > 3 && (
                <p className="text-xs text-gray-400 text-center pt-1">
                    +{matches.length - 3} more matches — complete more assessments to refine
                </p>
            )}
        </div>
    );
}

/** Skeleton variant for use in SSR shell */
export function CareerFitMatchesSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
        </div>
    );
}

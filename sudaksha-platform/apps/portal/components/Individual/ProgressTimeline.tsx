"use client";

/**
 * ProgressTimeline — lifelong tracking of assessments and deltas
 * SEPL/INT/2026/IMPL-STEPS-01 Step 20
 *
 * Fetches from GET /api/member/[memberId]/timeline
 * Simple vertical list with left border line, dots, and text.
 */

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, TrendingUp, Circle, CheckCircle2, Milestone, ChevronDown, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimelineEvent {
    id: string;
    date: string | null;
    name: string;
    type: string;
    score: number | null;
    isBaseline: boolean;
    deltaScore: number | null;
}

export function ProgressTimeline({ memberId }: { memberId: string }) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!memberId) { setLoading(false); return; }
        fetch(`/api/member/${memberId}/timeline`)
            .then(r => r.ok ? r.json() : { timeline: [] })
            .then(d => { setEvents(d.timeline ?? []); })
            .catch(() => { /* handled */ })
            .finally(() => setLoading(false));
    }, [memberId]);

    if (loading) {
        return (
            <div className="space-y-4 py-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                        <div className="w-px bg-gray-200 ml-2" />
                        <div className="h-12 flex-1 bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
                <Milestone className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-700">No progress history yet</p>
                <p className="text-xs text-gray-400 mt-1">Complete your first assessment to start your career timeline</p>
            </div>
        );
    }

    // Show newest first
    const sorted = [...events].reverse();
    const visibleEvents = expanded ? sorted : sorted.slice(0, 6);
    const hasMore = sorted.length > 6;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-2">
                {visibleEvents.map((ev, idx) => {
                    const isLatest = idx === 0;
                    return (
                        <div key={ev.id} className="relative pl-6">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center
                                ${ev.isBaseline ? "bg-indigo-500" : ev.deltaScore != null && ev.deltaScore > 0 ? "bg-emerald-500" : isLatest ? "bg-blue-500" : "bg-gray-300"}
                            `}>
                                {ev.isBaseline ? <Flag className="h-2 w-2 text-white" />
                                 : ev.deltaScore != null && ev.deltaScore > 0 ? <TrendingUp className="h-2 w-2 text-white" />
                                 : <Circle className="h-1 w-1 fill-white text-white" />}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-900">{ev.name}</p>
                                        {ev.isBaseline && (
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-indigo-600 bg-indigo-50 border-indigo-200 px-1.5 py-0">Baseline</Badge>
                                        )}
                                        {isLatest && !ev.isBaseline && (
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-blue-600 bg-blue-50 border-blue-200 px-1.5 py-0">Latest</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {ev.date ? format(new Date(ev.date), "MMM d, yyyy") : "Unknown date"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {ev.deltaScore != null && (
                                        <Badge className={`text-xs ${ev.deltaScore > 0 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : ev.deltaScore < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                                            {ev.deltaScore > 0 ? "+" : ""}{ev.deltaScore > 0 ? Math.round(ev.deltaScore) : ev.deltaScore} score delta
                                        </Badge>
                                    )}
                                    {ev.score != null && (
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-gray-900 tabular-nums">{Math.round(ev.score)}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasMore && !expanded && (
                <button
                    onClick={() => setExpanded(true)}
                    className="w-full mt-4 py-2 flex items-center justify-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    Show all history <ChevronDown className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

export function ProgressTimelineSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                    <div className="w-px bg-gray-200 ml-3" />
                    <div className="h-10 flex-1 bg-gray-100 rounded animate-pulse" />
                </div>
            ))}
        </div>
    );
}

"use client";

/**
 * TniCard — shared Training Needs Indicator card component
 * SEPL/INT/2026/IMPL-STEPS-01 Step 13
 *
 * Reused by: TeamLeadDashboard, DeptHeadDashboard, and any future role dashboards.
 * Extracted from Step 12 inline implementation.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface TniItem {
    competency: string;
    currentLevel: number;
    targetLevel: number;
    gap: "HIGH" | "MEDIUM" | "LOW";
    employeesAffected?: number;
}

export function urgencyBadge(gap: "HIGH" | "MEDIUM" | "LOW") {
    if (gap === "HIGH")
        return <Badge className="bg-red-100 text-red-700 border-red-200">Critical</Badge>;
    if (gap === "MEDIUM")
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">High</Badge>;
    return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Medium</Badge>;
}

export function businessConsequence(competency: string, gap: "HIGH" | "MEDIUM" | "LOW"): string {
    if (gap === "HIGH")
        return `Critical gap in ${competency} is directly impacting delivery quality and team output.`;
    if (gap === "MEDIUM")
        return `Moderate gap in ${competency} may slow performance if not addressed this quarter.`;
    return `Low-priority gap in ${competency}; recommended for next L&D cycle.`;
}

interface TniCardProps {
    item: TniItem;
    /** Custom consequence text — defaults to auto-generated text if omitted */
    consequence?: string;
}

export function TniCard({ item, consequence }: TniCardProps) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                    {urgencyBadge(item.gap)}
                    {item.employeesAffected != null && (
                        <span className="text-xs text-gray-400">
                            {item.employeesAffected} affected
                        </span>
                    )}
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-snug">
                    {item.competency}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                    {consequence ?? businessConsequence(item.competency, item.gap)}
                </p>
                <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full ${item.gap === "HIGH" ? "bg-red-400" : item.gap === "MEDIUM" ? "bg-amber-400" : "bg-blue-400"}`}
                            style={{ width: `${Math.min(100, item.currentLevel)}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 tabular-nums">
                        {item.currentLevel}% / {item.targetLevel}%
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

/** Skeleton placeholder while loading */
export function TniCardSkeleton() {
    return (
        <Card className="border-none shadow-sm animate-pulse">
            <CardContent className="p-4">
                <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
                <div className="h-5 w-full bg-gray-200 rounded mb-1" />
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
            </CardContent>
        </Card>
    );
}

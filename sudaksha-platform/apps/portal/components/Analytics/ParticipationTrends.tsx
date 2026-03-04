"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ParticipationTrends() {
    // Basic CSS-based chart to avoid Recharts dependency issues if not installed
    const data = [45, 52, 38, 65, 48, 72, 85];
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const max = Math.max(...data);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assessment Participation</CardTitle>
                <CardDescription>Daily completion trends over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between h-48 pt-4 gap-2">
                    {data.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="relative w-full flex flex-col items-center group">
                                <div
                                    className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-all border-x border-t border-primary/10"
                                    style={{ height: `${(val / max) * 100}%` }}
                                >
                                    <div className="absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap mb-1 z-10">
                                        {val} completions
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-bold">{labels[i]}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-between items-center text-xs border-t pt-4">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Total Completions: 405</span>
                    </div>
                    <span className="text-green-600 font-bold">↑ 18% vs last week</span>
                </div>
            </CardContent>
        </Card>
    );
}

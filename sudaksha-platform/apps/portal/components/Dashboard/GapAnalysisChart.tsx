"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface GapData {
    competency: string;
    currentLevel: number;
    targetLevel: number;
    gap: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function GapAnalysisChart({ data }: { data: GapData[] }) {
    if (!data || data.length === 0) return (
        <Card className="col-span-2 h-[400px] flex items-center justify-center text-gray-400">
            No data available
        </Card>
    );

    const getBarColor = (gap: string) => {
        switch (gap) {
            case 'HIGH': return '#ef4444'; // red-500
            case 'MEDIUM': return '#f59e0b'; // amber-500
            case 'LOW': return '#22c55e'; // green-500
            default: return '#3b82f6';
        }
    };

    return (
        <Card className="col-span-2 shadow-sm">
            <CardHeader>
                <CardTitle>Competency Gap Analysis</CardTitle>
                <CardDescription>Top competency gaps across your organization</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="competency" type="category" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="currentLevel" name="Current Proficiency" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={20} />
                            <Bar dataKey="targetLevel" name="Target Proficiency" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} hide />
                            {/* We visualize the GAP. But simplified, showing current levels colored by GAP severity is effective */}
                            <Bar dataKey="currentLevel" barSize={20} radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.gap)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-4 justify-center text-xs text-gray-500">
                    <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> High Gap (&gt;40%)</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div> Medium Gap (20-40%)</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Low Gap (&lt;20%)</div>
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface HeatmapData {
    department: string;
    competencies: {
        name: string;
        level: number; // 1-5
    }[];
}

const MOCK_HEATMAP: HeatmapData[] = [
    {
        department: "Engineering",
        competencies: [
            { name: "Frontend", level: 4.2 },
            { name: "Backend", level: 3.8 },
            { name: "DevOps", level: 2.5 },
            { name: "Testing", level: 4.5 },
        ]
    },
    {
        department: "Product",
        competencies: [
            { name: "Frontend", level: 2.1 },
            { name: "Backend", level: 1.5 },
            { name: "DevOps", level: 1.2 },
            { name: "Testing", level: 3.0 },
        ]
    },
    {
        department: "Design",
        competencies: [
            { name: "Frontend", level: 3.5 },
            { name: "Backend", level: 1.0 },
            { name: "DevOps", level: 1.0 },
            { name: "Testing", level: 2.8 },
        ]
    }
];

const getColor = (level: number) => {
    if (level >= 4) return "bg-green-500";
    if (level >= 3) return "bg-green-300";
    if (level >= 2) return "bg-yellow-300";
    if (level >= 1) return "bg-orange-300";
    return "bg-slate-100";
};

export function CompetencyHeatmap() {
    const data = MOCK_HEATMAP;
    const allCompetencies = Array.from(new Set(data.flatMap(d => d.competencies.map(c => c.name))));

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle>Competency Heatmap</CardTitle>
                <CardDescription>Average proficiency levels by department and skill category.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-2 text-left text-xs font-bold uppercase text-muted-foreground border-b w-40">Department</th>
                                {allCompetencies.map(c => (
                                    <th key={c} className="p-2 text-center text-xs font-bold uppercase text-muted-foreground border-b">
                                        {c}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((dept) => (
                                <tr key={dept.department} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-2 text-sm font-medium border-b">{dept.department}</td>
                                    <TooltipProvider>
                                        {allCompetencies.map(cName => {
                                            const comp = dept.competencies.find(c => c.name === cName);
                                            const level = comp?.level || 0;
                                            return (
                                                <td key={cName} className="p-1 border-b">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className={`h-10 w-full rounded-sm ${getColor(level)} flex items-center justify-center text-[10px] font-bold text-slate-900/60`}>
                                                                {level > 0 ? level.toFixed(1) : "-"}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="font-bold">{dept.department} - {cName}</p>
                                                            <p>Avg Level: {level.toFixed(2)} / 5.0</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </td>
                                            );
                                        })}
                                    </TooltipProvider>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-end gap-4 mt-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-slate-100" /> 0.0
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-orange-300" /> 1.0+
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-yellow-300" /> 2.0+
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-green-300" /> 3.0+
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-green-500" /> 4.0+
                    </div>
                    <span className="ml-2 font-medium">Proficiency Level</span>
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    Users,
    FileCheck,
    TrendingUp,
    AlertTriangle,
    ArrowRight,
    Map
} from "lucide-react";
import { CompetencyHeatmap } from "@/components/Analytics/CompetencyHeatmap";
import { ParticipationTrends } from "@/components/Analytics/ParticipationTrends";

export function ClientAnalytics({ clientId }: { clientId: string }) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Organization Analytics</h2>
                    <p className="text-muted-foreground mt-1">Deep dive into competency distribution and employee engagement for <strong>Tech Corp</strong>.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Export All Data
                    </Button>
                    <Button size="sm">
                        Share Report
                    </Button>
                </div>
            </div>

            {/* Top Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Employees</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">1,240</div>
                        <p className="text-xs text-muted-foreground mt-1">94% participation rate</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Certifications Issued</CardTitle>
                        <FileCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">382</div>
                        <p className="text-xs text-muted-foreground mt-1">+45 this month</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Skill Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">+1.2 pts</div>
                        <p className="text-xs text-muted-foreground mt-1">Avg improvement since last Q</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Visualizations */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <CompetencyHeatmap clientId={clientId} />
                    <ParticipationTrends />
                </div>

                {/* Critical Alerts & Priority Gaps */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <Card className="bg-red-50 border-red-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-800">
                                <AlertTriangle className="h-5 w-5" /> Critical Skill Gaps
                            </CardTitle>
                            <CardDescription className="text-red-700/70">Roles lacking essential competencies.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-white rounded border border-red-100 shadow-sm">
                                <p className="text-xs font-bold text-red-800 uppercase tracking-tighter">Security Engineer</p>
                                <p className="text-sm font-medium mt-1">Cloud Compliance (Gap: 2.5)</p>
                                <div className="h-1.5 w-full bg-red-100 rounded-full mt-2">
                                    <div className="h-full bg-red-600 w-[20%]" />
                                </div>
                            </div>
                            <div className="p-3 bg-white rounded border border-red-100 shadow-sm">
                                <p className="text-xs font-bold text-red-800 uppercase tracking-tighter">Data Analyst</p>
                                <p className="text-sm font-medium mt-1">Predictive Modeling (Gap: 1.8)</p>
                                <div className="h-1.5 w-full bg-red-100 rounded-full mt-2">
                                    <div className="h-full bg-red-600 w-[45%]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Map className="h-4 w-4 text-primary" /> Roadmap Impact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Current learning pathways have closed <strong>14%</strong> of technical debt in the Engineering department this quarter.
                            </p>
                            <Button variant="outline" className="w-full text-xs">
                                View Learning Impact <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

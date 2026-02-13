"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, MessageSquare, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SurveyAnalytics({ id }: { id: string }) {
    // Mock Analytics Data
    const analytics = {
        title: "Quarterly Team Engagement",
        totalResponses: 124,
        completionRate: 88,
        questions: [
            {
                id: "sq1",
                text: "I feel supported by my immediate manager.",
                type: "LIKERT",
                avg: 4.2,
                distribution: [5, 12, 18, 45, 44] // 1 to 5 star counts
            },
            {
                id: "sq2",
                text: "I have the tools and resources I need to do my job well.",
                type: "LIKERT",
                avg: 3.8,
                distribution: [8, 15, 30, 41, 30]
            }
        ],
        recentComments: [
            "Great support during the last project sprint.",
            "Need better documentation for the new API.",
            "Remote work setup has improved my productivity significantly."
        ]
    };

    return (
        <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalResponses}</div>
                        <p className="text-xs text-muted-foreground">+12 since yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.completionRate}%</div>
                        <Progress value={analytics.completionRate} className="h-1 mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Positive</div>
                        <p className="text-xs text-green-600 font-medium">↑ 4% growth</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
                        <BarChart3 className="h-4 w-4 opacity-70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">68</div>
                        <p className="text-xs opacity-70">Excellent category</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="questions">
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="questions">Questions</TabsTrigger>
                        <TabsTrigger value="responses">Individual Responses</TabsTrigger>
                        <TabsTrigger value="export">Export</TabsTrigger>
                    </TabsList>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Download Report
                    </Button>
                </div>

                <TabsContent value="questions" className="space-y-6">
                    {analytics.questions.map((q) => (
                        <Card key={q.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{q.text}</CardTitle>
                                    <Badge variant="outline" className="bg-blue-50">
                                        Avg: {q.avg}/5.0
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-2 h-32">
                                    {q.distribution.map((val, i) => {
                                        const max = Math.max(...q.distribution);
                                        const height = (val / max) * 100;
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div
                                                    className="w-full bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-600"
                                                    style={{ height: `${height}%` }}
                                                />
                                                <span className="text-[10px] text-muted-foreground font-bold">{i + 1}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between mt-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                    <span>Strongly Disagree</span>
                                    <span>Neutral</span>
                                    <span>Strongly Agree</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                                Qualitative Feedback
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {analytics.recentComments.map((comment, i) => (
                                <div key={i} className="p-4 rounded-lg bg-slate-50 border text-sm italic text-slate-700">
                                    "{comment}"
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

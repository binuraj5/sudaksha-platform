
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ReportBuilderPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [config, setConfig] = useState({
        metric: 'average_score',
        groupBy: 'department',
        chartType: 'bar'
    });

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            setData(result);
            if (result.length === 0) toast.warning("No data found for selected criteria.");
            else toast.success("Report generated successfully!");

        } catch (error: any) {
            toast.error(error.message || "Failed to generate report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Custom Report Builder</h1>
                    <p className="text-slate-500">Generate insights on assessment performance.</p>
                </div>
                <Button variant="outline" disabled={data.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* CONTROLS */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Metric</Label>
                            <Select
                                value={config.metric}
                                onValueChange={(v) => setConfig({ ...config, metric: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="average_score">Average Score</SelectItem>
                                    <SelectItem value="completion_rate">Completion Rate</SelectItem>
                                    <SelectItem value="time_spent">Avg Time Spent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Group By</Label>
                            <Select
                                value={config.groupBy}
                                onValueChange={(v) => setConfig({ ...config, groupBy: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="department">Department</SelectItem>
                                    <SelectItem value="assessment">Assessment</SelectItem>
                                    <SelectItem value="status">Status</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Chart Type</Label>
                            <Select
                                value={config.chartType}
                                onValueChange={(v) => setConfig({ ...config, chartType: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bar">Bar Chart</SelectItem>
                                    <SelectItem value="line">Line Chart</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="w-full" onClick={generateReport} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
                            Generate Report
                        </Button>
                    </CardContent>
                </Card>

                {/* VISUALIZATION */}
                <Card className="lg:col-span-3 min-h-[500px]">
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>
                            Showing {config.metric.replace('_', ' ')} by {config.groupBy}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                {config.chartType === 'bar' ? (
                                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill="#2563eb" name={config.metric.replace('_', ' ')} />
                                    </BarChart>
                                ) : (
                                    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="value" stroke="#2563eb" name={config.metric.replace('_', ' ')} />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                {loading ? "Generating..." : "Select configuration and click Generate"}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

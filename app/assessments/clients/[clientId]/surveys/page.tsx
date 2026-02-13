"use client";

import React, { useState, useEffect, use } from "react";
import { SurveyBuilder } from "@/components/assessments/admin/surveys/SurveyBuilder";
import { AssignSurveyDialog } from "@/components/assessments/admin/surveys/AssignSurveyDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Loader2, ArrowLeft, BarChart2, Calendar, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Survey {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    _count?: {
        responses: number;
    }
}

export default function TenantSurveysPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = use(params);
    const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignSurvey, setAssignSurvey] = useState<Survey | null>(null);

    useEffect(() => {
        if (view === 'LIST') {
            fetchSurveys();
        }
    }, [view]);

    const fetchSurveys = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/clients/${clientId}/surveys`);
            if (res.ok) {
                const data = await res.json();
                setSurveys(data);
            }
        } catch (error) {
            console.error("Failed to fetch surveys", error);
        } finally {
            setLoading(false);
        }
    };

    if (view === 'CREATE') {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => setView('LIST')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Surveys
                </Button>
                <SurveyBuilder clientId={clientId} onSaved={() => setView('LIST')} />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Surveys</h1>
                    <p className="text-gray-500">Manage feedback forms and engagement surveys.</p>
                </div>
                <Button onClick={() => setView('CREATE')} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" /> Create Survey
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : surveys.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-gray-50">
                    <BarChart2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No surveys found</h3>
                    <p className="text-gray-500 mb-6">Get started by creating your first survey.</p>
                    <Button onClick={() => setView('CREATE')}>
                        <Plus className="mr-2 h-4 w-4" /> Create Survey
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {surveys.map((survey) => (
                        <Card key={survey.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="line-clamp-1">{survey.name}</CardTitle>
                                        <CardDescription className="line-clamp-2 h-10">
                                            {survey.description || "No description provided."}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={survey.isActive ? "default" : "secondary"}>
                                        {survey.isActive ? "Active" : "Draft"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" className="gap-1" asChild>
                                        <Link href={`/assessments/clients/${clientId}/surveys/${survey.id}/edit`}>
                                            Edit questions
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1" asChild>
                                        <Link href={`/assessments/clients/${clientId}/surveys/${survey.id}/results`}>
                                            View results
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1" onClick={() => setAssignSurvey(survey)}>
                                        <UserPlus className="h-3 w-3" /> Assign
                                    </Button>
                                </div>
                                <div className="flex justify-between items-end text-sm text-gray-500 pt-2 border-t">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{format(new Date(survey.createdAt), "MMM d, yyyy")}</span>
                                    </div>
                                    <div className="font-medium text-gray-900">
                                        {survey._count?.responses || 0} Responses
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {assignSurvey && (
                <AssignSurveyDialog
                    open={!!assignSurvey}
                    onOpenChange={(open) => !open && setAssignSurvey(null)}
                    clientId={clientId}
                    surveyId={assignSurvey.id}
                    surveyName={assignSurvey.name}
                    onAssigned={() => fetchSurveys()}
                />
            )}
        </div>
    );
}

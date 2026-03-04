"use client";

import { useState, useEffect, use } from "react";
import { SurveyQuestionEditor } from "@/components/assessments/admin/surveys/SurveyQuestionEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SurveyEditPage({ params }: { params: Promise<{ clientId: string; surveyId: string }> }) {
    const { clientId, surveyId } = use(params);
    const [survey, setSurvey] = useState<{ id: string; name: string; description: string | null; questions: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/clients/${clientId}/surveys/${surveyId}`)
            .then(r => r.json())
            .then(data => {
                if (data && data.id) setSurvey(data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [clientId, surveyId]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }
    if (!survey) {
        return (
            <div className="p-6 text-center text-gray-500">
                Survey not found.
                <Button variant="link" asChild><Link href={`/assessments/clients/${clientId}/surveys`}>Back to Surveys</Link></Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <Button variant="ghost" size="sm" asChild>
                <Link href={`/assessments/clients/${clientId}/surveys`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Surveys
                </Link>
            </Button>
            <h1 className="text-2xl font-bold">Edit: {survey.name}</h1>
            <SurveyQuestionEditor
                clientId={clientId}
                surveyId={surveyId}
                surveyName={survey.name}
                initialQuestions={survey.questions}
                onSaved={() => {}}
            />
        </div>
    );
}


import React from 'react';
import { AIInterviewInterface } from "@/components/assessments/admin/interviews/AIInterviewInterface";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AIInterviewPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">AI Interview Session</h1>
            {/* We could fetch interview details using 'id' here contextually */}
            <div className="mb-4 text-sm text-muted-foreground">
                Session ID: {id}
            </div>
            <AIInterviewInterface />
        </div>
    );
}

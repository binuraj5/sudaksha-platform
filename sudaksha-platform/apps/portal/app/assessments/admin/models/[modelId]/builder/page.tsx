"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AssessmentBuilder } from "@/components/assessments/AssessmentBuilder";

export default function AssessmentBuilderPageWrapper({ params }: { params: Promise<{ modelId: string }> }) {
    const resolved = use(params);
    const modelId = resolved?.modelId;
    if (!modelId) {
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                <p className="text-muted-foreground">Invalid model. Please select an assessment from the list.</p>
                <Link href="/assessments/admin/models">
                    <Button variant="outline" className="mt-4">Back to Models</Button>
                </Link>
            </div>
        );
    }
    return (
        <AssessmentBuilder
            modelId={modelId}
            backHref="/assessments/admin/models"
            completeHref={`/assessments/admin/models/${modelId}/questions`}
        />
    );
}

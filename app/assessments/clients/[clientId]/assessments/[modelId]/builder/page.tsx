"use client";

import { use } from "react";
import { AssessmentBuilder } from "@/components/assessments/AssessmentBuilder";

export default function ClientAssessmentBuilderPage({ params }: { params: Promise<{ clientId: string; modelId: string }> }) {
    const { clientId, modelId } = use(params);
    return (
        <AssessmentBuilder
            modelId={modelId}
            backHref={`/assessments/clients/${clientId}/assessments`}
            completeHref={`/assessments/clients/${clientId}/assessments/${modelId}/questions`}
        />
    );
}

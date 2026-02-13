"use client";

import { use } from "react";
import { AssessmentBuilder } from "@/app/assessments/admin/models/[modelId]/builder/page";

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

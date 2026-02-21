"use client";

import { use } from "react";
import { AssessmentBuilder } from "@/components/assessments/AssessmentBuilder";

export default function OrgAssessmentBuilderPage({ params }: { params: Promise<{ slug: string; modelId: string }> }) {
    const { slug, modelId } = use(params);
    return (
        <AssessmentBuilder
            modelId={modelId}
            backHref={`/assessments/org/${slug}/assessments`}
            completeHref={`/assessments/org/${slug}/assessments/${modelId}/questions`}
        />
    );
}

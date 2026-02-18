"use client";

import { use } from "react";
import { AssessmentBuilder } from "@/components/assessments/AssessmentBuilder";

export default function AssessmentBuilderPageWrapper({ params }: { params: Promise<{ modelId: string }> }) {
    const { modelId } = use(params);
    return (
        <AssessmentBuilder
            modelId={modelId}
            backHref="/assessments/admin/models"
        />
    );
}

"use client";

import { CompetenciesPageContent } from "@/components/Competencies/CompetenciesPageContent";

export function OrgCompetenciesContent({
    slug,
}: {
    clientId: string;
    slug: string;
    tenantType: string;
}) {
    return (
        <CompetenciesPageContent
            baseUrl={`/assessments/org/${slug}/competencies`}
        />
    );
}

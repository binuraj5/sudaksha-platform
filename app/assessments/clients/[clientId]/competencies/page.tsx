"use client";

import { use } from "react";
import { CompetenciesPageContent } from "@/components/Competencies/CompetenciesPageContent";

/**
 * Client competencies page: same UI as admin competencies (Competency Library + Role Frameworks tabs).
 * Data is scoped by /api/admin/competencies and /api/admin/roles (RLS) based on session.
 */
export default function ClientCompetenciesPage({ params }: { params: Promise<{ clientId: string }> }) {
    use(params); // satisfy dynamic route
    return <CompetenciesPageContent />;
}

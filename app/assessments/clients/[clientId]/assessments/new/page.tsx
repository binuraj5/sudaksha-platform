"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CreateAssessmentWizard } from "@/components/assessments/CreateAssessmentWizard";

export default function NewAssessmentPage() {
    const params = useParams();
    const clientId = params.clientId as string;

    return (
        <div className="max-w-4xl mx-auto">
            <Button variant="ghost" size="sm" asChild className="mb-6">
                <Link href={`/assessments/clients/${clientId}/assessments`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assessments
                </Link>
            </Button>
            <CreateAssessmentWizard
                clientId={clientId}
                redirectBase={`/assessments/clients/${clientId}/assessments`}
            />
        </div>
    );
}

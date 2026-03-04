"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";

export function SurveyResultsExport({
    clientId,
    surveyId,
    surveyName,
}: {
    clientId: string;
    surveyId: string;
    surveyName: string;
}) {
    const exportUrl = `/api/clients/${clientId}/surveys/${surveyId}/export?format=csv`;
    const filename = `${(surveyName || "survey").replace(/[^a-z0-9_-]/gi, "_")}_results.csv`;

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
            >
                <a href={exportUrl} download={filename} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                    Export CSV
                </a>
            </Button>
            <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
            >
                <a href={exportUrl.replace("format=csv", "format=excel")} download={filename} target="_blank" rel="noopener noreferrer">
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Excel
                </a>
            </Button>
        </div>
    );
}

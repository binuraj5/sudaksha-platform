"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

/**
 * Adaptive Questionnaire: Uses the same build methods as MCQ (AI Generate, Manual, Library, Bulk).
 * Branching logic can be configured later. For now, delegates to parent to show standard options.
 */
interface AdaptiveQuestionnaireBuilderProps {
    onUseStandard: () => void;
    onCancel: () => void;
}

export function AdaptiveQuestionnaireBuilder({ onUseStandard, onCancel }: AdaptiveQuestionnaireBuilderProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-navy-600" />
                    <CardTitle>Adaptive Questionnaire</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                    Build a question pool with adaptive branching. Use AI Generate, Manual Entry, Library, or Bulk
                    Upload to create questions. Branching rules can be configured in a future update.
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={onUseStandard}>
                        Use Standard Build Options (AI / Manual / Library / Bulk)
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

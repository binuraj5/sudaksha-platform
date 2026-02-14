"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface PanelComponentBuilderProps {
    componentId: string;
    competencyName: string;
    targetLevel: string;
    onComplete: () => void;
    onCancel: () => void;
}

/**
 * Panel Interview component builder.
 * Full scheduling UI will be implemented in Phase 3.
 * For now, allows admin to mark component as configured.
 */
export function PanelComponentBuilder({
    competencyName,
    targetLevel,
    onComplete,
    onCancel,
}: PanelComponentBuilderProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-navy-600" />
                    <CardTitle>Panel Interview</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                    {competencyName} • {targetLevel} Level
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm">
                    Panel interviews allow live evaluation by expert panel members. Full scheduling,
                    calendar integration, and evaluation forms will be available in Phase 3.
                </p>
                <p className="text-sm text-muted-foreground">
                    For now, you can add this component and configure panel members and scheduling
                    when the feature is fully implemented.
                </p>
                <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={onComplete}>
                        Mark as Configured (Continue)
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, ChevronRight, Brain } from "lucide-react";
import { ProficiencyLevel } from "@sudaksha/db-core";

interface Indicator {
    id: string;
    text: string;
    level: ProficiencyLevel;
    type: string;
    weight: number;
}

interface CompetencyData {
    name: string;
    indicators: Indicator[];
    targetLevel: ProficiencyLevel;
}

interface IndicatorPreviewProps {
    competencies: CompetencyData[];
}

export const IndicatorPreview: React.FC<IndicatorPreviewProps> = ({ competencies }) => {
    return (
        <div className="space-y-4">
            {competencies.map((comp, idx) => (
                <div key={idx} className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
                    <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <Brain className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">{comp.name}</h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Target: {comp.targetLevel}</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-xs font-medium">
                            {comp.indicators.length} Indicators
                        </Badge>
                    </div>

                    <ScrollArea className="max-h-[300px]">
                        <div className="p-4 space-y-4">
                            {/* Exact Match Section */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Primary Indicators (1.0x Weight)</p>
                                {comp.indicators.filter(i => i.level === comp.targetLevel).map(i => (
                                    <IndicatorRow key={i.id} indicator={i} />
                                ))}
                            </div>

                            {/* Secondary/Context Section */}
                            {comp.indicators.some(i => i.level !== comp.targetLevel) && (
                                <div className="space-y-2 pt-2 border-t border-dashed border-border">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Contextual Indicators (0.3x Weight)</p>
                                    {comp.indicators.filter(i => i.level !== comp.targetLevel).map(i => (
                                        <IndicatorRow key={i.id} indicator={i} secondary />
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            ))}
        </div>
    );
};

const IndicatorRow = ({ indicator, secondary }: { indicator: Indicator; secondary?: boolean }) => (
    <div className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${secondary ? "bg-muted/30" : "hover:bg-muted/50"}`}>
        <div className="mt-0.5">
            {indicator.type === "POSITIVE" ? (
                <CheckCircle2 className={`w-4 h-4 ${secondary ? "text-green-300" : "text-green-500"}`} />
            ) : (
                <XCircle className={`w-4 h-4 ${secondary ? "text-red-300" : "text-red-400"}`} />
            )}
        </div>
        <div className="flex-1">
            <p className={`text-xs ${secondary ? "text-muted-foreground font-medium" : "text-foreground font-semibold"} leading-relaxed`}>
                {indicator.text}
            </p>
            <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={`text-[9px] h-4 py-0 px-1 font-medium ${secondary ? "text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                    {indicator.level}
                </Badge>
            </div>
        </div>
    </div>
);

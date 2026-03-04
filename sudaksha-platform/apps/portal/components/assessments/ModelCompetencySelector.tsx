"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Scale, Loader2 } from "lucide-react";
import Link from "next/link";

export interface RoleCompetencyItem {
    id: string;
    competencyId: string;
    weight: number;
    competency: { id: string; name: string; category: string };
}

export interface ModelCompetencySelectorProps {
    /** Role competencies (from role - read-only source) */
    competencies: RoleCompetencyItem[];
    /** Selected competency IDs for this model */
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
    /** Weights per competencyId (0-100, for selected only) */
    weights: Record<string, number>;
    onWeightsChange: (weights: Record<string, number>) => void;
    roleId: string;
    loading?: boolean;
    /** Compact layout for smaller screens */
    compact?: boolean;
}

export function ModelCompetencySelector({
    competencies,
    selectedIds,
    onSelectionChange,
    weights,
    onWeightsChange,
    roleId,
    loading = false,
    compact = false,
}: ModelCompetencySelectorProps) {
    const selectedList = useMemo(
        () => competencies.filter((c) => selectedIds.has(c.competencyId)),
        [competencies, selectedIds]
    );

    const totalWeight = selectedList.reduce(
        (sum, c) => sum + (weights[c.competencyId] ?? 0),
        0
    );
    const weightsValid = Math.abs(totalWeight - 100) <= 0.5;

    const toggleCompetency = (competencyId: string) => {
        const next = new Set(selectedIds);
        if (next.has(competencyId)) {
            next.delete(competencyId);
            const w = { ...weights };
            delete w[competencyId];
            onWeightsChange(w);
        } else {
            next.add(competencyId);
            const equal = next.size > 0 ? 100 / next.size : 0;
            const w: Record<string, number> = {};
            next.forEach((id) => (w[id] = weights[id] ?? equal));
            onWeightsChange(w);
        }
        onSelectionChange(next);
    };

    const setWeight = (competencyId: string, value: number) => {
        onWeightsChange({ ...weights, [competencyId]: Math.max(0, Math.min(100, value)) });
    };

    const normalizeWeights = () => {
        const sum = selectedList.reduce((s, c) => s + (weights[c.competencyId] ?? 0), 0);
        if (sum <= 0) return;
        const next: Record<string, number> = {};
        selectedList.forEach((c) => {
            next[c.competencyId] = Math.round((((weights[c.competencyId] ?? 0) / sum) * 1000) / 10);
        });
        onWeightsChange(next);
    };

    const selectAll = () => {
        const next = new Set(competencies.map((c) => c.competencyId));
        const equal = 100 / next.size;
        const w: Record<string, number> = {};
        next.forEach((id) => (w[id] = equal));
        onWeightsChange(w);
        onSelectionChange(next);
    };

    const clearAll = () => {
        onSelectionChange(new Set());
        onWeightsChange({});
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading competencies...</span>
            </div>
        );
    }

    if (competencies.length === 0) {
        return (
            <div className="py-6 text-center border-2 border-dashed rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">No competencies linked to this role.</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Admins can add competencies from the role page.
                </p>
                <Link href={`/assessments/admin/roles/${roleId}`}>
                    <Button variant="outline" size="sm" className="mt-3">
                        View role
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">
                        Select competencies for this model ({selectedIds.size} of {competencies.length})
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAll} className="h-8 text-xs">
                        Select all
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-xs">
                        Clear
                    </Button>
                    <Link href={`/assessments/admin/roles/${roleId}`} className="text-xs text-muted-foreground hover:text-foreground self-center">
                        View role →
                    </Link>
                </div>
            </div>

            <div className="space-y-2 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1">
                {competencies.map((rc) => {
                    const checked = selectedIds.has(rc.competencyId);
                    const weight = weights[rc.competencyId] ?? 0;
                    return (
                        <Card key={rc.competencyId} className={`overflow-hidden transition-colors ${checked ? "border-primary/50" : ""}`}>
                            <CardContent className={`p-3 sm:p-4 ${compact ? "py-2.5" : ""}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <Checkbox
                                            id={rc.competencyId}
                                            checked={checked}
                                            onCheckedChange={() => toggleCompetency(rc.competencyId)}
                                            className="mt-0.5 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <Label
                                                htmlFor={rc.competencyId}
                                                className="font-medium text-sm cursor-pointer block truncate"
                                            >
                                                {rc.competency.name}
                                            </Label>
                                            <Badge variant="outline" className="text-[10px] mt-0.5">
                                                {rc.competency.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    {checked && (
                                        <div className="flex items-center gap-2 sm:gap-3 pl-6 sm:pl-0">
                                            <div className="flex items-center gap-1.5 w-24">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    value={weight === 0 ? "" : Math.round(weight)}
                                                    onChange={(e) => {
                                                        const v = parseFloat(e.target.value);
                                                        if (!Number.isNaN(v)) setWeight(rc.competencyId, v);
                                                    }}
                                                    className="h-8 w-14 text-right text-sm"
                                                />
                                                <span className="text-xs text-muted-foreground">%</span>
                                            </div>
                                            <Slider
                                                value={[weight]}
                                                max={100}
                                                step={1}
                                                onValueChange={([v]) => setWeight(rc.competencyId, v)}
                                                className="w-20 sm:w-24"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {selectedIds.size > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                    <Badge variant={weightsValid ? "default" : totalWeight > 100 ? "destructive" : "secondary"}>
                        Total: {totalWeight.toFixed(1)}%
                    </Badge>
                    <Button variant="outline" size="sm" onClick={normalizeWeights}>
                        Normalize to 100%
                    </Button>
                </div>
            )}
        </div>
    );
}

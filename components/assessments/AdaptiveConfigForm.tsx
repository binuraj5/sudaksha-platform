"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface AdaptiveConfig {
    min_questions: number;
    max_questions: number;
    starting_difficulty: number;
    allowed_question_types: string[];
    difficulty_adaptation_enabled: boolean;
    context_aware_followups: boolean;
    stopping_criteria: "MAX_QUESTIONS" | "HIGH_CONFIDENCE" | "BOTH";
}

const DEFAULT_CONFIG: AdaptiveConfig = {
    min_questions: 8,
    max_questions: 15,
    starting_difficulty: 5,
    allowed_question_types: ["MCQ"],
    difficulty_adaptation_enabled: true,
    context_aware_followups: true,
    stopping_criteria: "BOTH",
};

interface AdaptiveConfigFormProps {
    componentId: string;
    modelId: string;
    competencyName: string;
    targetLevel: string;
    initialConfig?: AdaptiveConfig | null;
    onComplete: () => void;
    onCancel: () => void;
}

export function AdaptiveConfigForm({
    componentId,
    modelId,
    competencyName,
    targetLevel,
    initialConfig,
    onComplete,
    onCancel,
}: AdaptiveConfigFormProps) {
    const [config, setConfig] = useState<AdaptiveConfig>(initialConfig ?? DEFAULT_CONFIG);
    const [saving, setSaving] = useState(false);

    const toggleQuestionType = (type: string) => {
        const current = config.allowed_question_types;
        if (current.includes(type)) {
            setConfig({ ...config, allowed_question_types: current.filter((t) => t !== type) });
        } else {
            setConfig({ ...config, allowed_question_types: [...current, type] });
        }
    };

    const handleSave = async () => {
        if (config.min_questions >= config.max_questions) {
            toast.error("Max questions must be greater than min");
            return;
        }
        if (config.allowed_question_types.length === 0) {
            toast.error("Select at least one question type");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}/components/${componentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ config }),
            });
            if (res.ok) {
                toast.success("Adaptive configuration saved");
                onComplete();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to save");
            }
        } catch {
            toast.error("Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span>🤖</span> Configure Adaptive AI
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    {competencyName} • {targetLevel} Level
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Min Questions</Label>
                        <Input
                            type="number"
                            min={5}
                            max={20}
                            value={config.min_questions}
                            onChange={(e) =>
                                setConfig({ ...config, min_questions: parseInt(e.target.value) || 5 })
                            }
                        />
                    </div>
                    <div>
                        <Label>Max Questions</Label>
                        <Input
                            type="number"
                            min={5}
                            max={20}
                            value={config.max_questions}
                            onChange={(e) =>
                                setConfig({ ...config, max_questions: parseInt(e.target.value) || 15 })
                            }
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label>Starting Difficulty: {config.starting_difficulty}/10</Label>
                        <Badge
                            variant={
                                config.starting_difficulty <= 3
                                    ? "outline"
                                    : config.starting_difficulty <= 6
                                      ? "secondary"
                                      : "default"
                            }
                        >
                            {config.starting_difficulty <= 3
                                ? "Easy"
                                : config.starting_difficulty <= 6
                                  ? "Medium"
                                  : "Hard"}
                        </Badge>
                    </div>
                    <Slider
                        value={[config.starting_difficulty]}
                        onValueChange={([v]) => setConfig({ ...config, starting_difficulty: v })}
                        min={1}
                        max={10}
                        step={1}
                    />
                </div>

                <div>
                    <Label>Allowed Question Types</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {["MCQ", "SITUATIONAL", "SHORT_ANSWER"].map((t) => (
                            <Badge
                                key={t}
                                variant={config.allowed_question_types.includes(t) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleQuestionType(t)}
                            >
                                {config.allowed_question_types.includes(t) ? "✓ " : ""}
                                {t}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Adaptation Settings</Label>
                    <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-muted/50">
                        <input
                            type="checkbox"
                            checked={config.difficulty_adaptation_enabled}
                            onChange={(e) =>
                                setConfig({ ...config, difficulty_adaptation_enabled: e.target.checked })
                            }
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Adaptive difficulty (adjust based on performance)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-muted/50">
                        <input
                            type="checkbox"
                            checked={config.context_aware_followups}
                            onChange={(e) =>
                                setConfig({ ...config, context_aware_followups: e.target.checked })
                            }
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Context-aware follow-ups (build on previous answers)</span>
                    </label>
                </div>

                <div>
                    <Label>Stopping Criteria</Label>
                    <select
                        className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                        value={config.stopping_criteria}
                        onChange={(e) =>
                            setConfig({
                                ...config,
                                stopping_criteria: e.target.value as AdaptiveConfig["stopping_criteria"],
                            })
                        }
                    >
                        <option value="MAX_QUESTIONS">Maximum questions only</option>
                        <option value="HIGH_CONFIDENCE">High confidence (may stop early)</option>
                        <option value="BOTH">Both (recommended)</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                        &quot;Both&quot; stops when max reached OR when ability level is confident
                    </p>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={onCancel} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

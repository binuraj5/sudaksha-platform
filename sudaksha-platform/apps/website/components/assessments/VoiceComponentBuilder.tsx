"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface VoiceConfig {
    questionCount: number;
    maxDurationPerQuestion: number;
    competencyName: string;
    targetLevel: string;
}

interface VoiceComponentBuilderProps {
    componentId: string;
    modelId: string;
    competencyName: string;
    targetLevel: string;
    indicators?: { id: string; text: string; level: string }[];
    initialConfig?: VoiceConfig | null;
    onComplete: () => void;
    onCancel: () => void;
}

export function VoiceComponentBuilder({
    componentId,
    modelId,
    competencyName,
    targetLevel,
    initialConfig,
    onComplete,
    onCancel,
}: VoiceComponentBuilderProps) {
    const [questionCount, setQuestionCount] = useState(initialConfig?.questionCount ?? 5);
    const [maxDurationPerQuestion, setMaxDurationPerQuestion] = useState(
        initialConfig?.maxDurationPerQuestion ?? 120
    );
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const config: VoiceConfig = {
                questionCount,
                maxDurationPerQuestion,
                competencyName,
                targetLevel,
            };

            // 1. Save config to component.config (master doc preferred)
            const patchRes = await fetch(
                `/api/assessments/admin/models/${modelId}/components/${componentId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ config }),
                }
            );
            if (!patchRes.ok) {
                const err = await patchRes.json();
                toast.error(err.error || "Failed to save config");
                return;
            }

            // 2. Bulk-json placeholder for runner compatibility (single question with metadata)
            const bulkRes = await fetch(
                `/api/assessments/admin/components/${componentId}/questions/bulk-json`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        questions: [
                            {
                                questionText: `AI Voice Interview - ${competencyName} (${targetLevel})`,
                                questionType: "VOICE_RESPONSE",
                                points: 100,
                                timeLimit: maxDurationPerQuestion * questionCount,
                                linkedIndicators: [],
                                metadata: {
                                    ...config,
                                    type: "VOICE_INTERVIEW_CONFIG",
                                },
                            },
                        ],
                    }),
                }
            );
            if (!bulkRes.ok) {
                const err = await bulkRes.json();
                toast.error(err.error || "Failed to save questions");
                return;
            }

            toast.success("AI Voice component configured");
            onComplete();
        } catch {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Mic className="w-6 h-6 text-navy-600" />
                        <CardTitle>AI Voice Interview Configuration</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Configure the AI-powered voice interview for {competencyName}. Questions are generated at
                        runtime based on competency indicators. The Python backend handles transcription and
                        evaluation.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Number of questions (3–7)</Label>
                        <Slider
                            value={[questionCount]}
                            onValueChange={([v]) => setQuestionCount(v ?? 5)}
                            min={3}
                            max={7}
                            step={1}
                        />
                        <p className="text-sm text-muted-foreground">{questionCount} questions</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Max duration per question (seconds)</Label>
                        <Input
                            type="number"
                            min={60}
                            max={300}
                            value={maxDurationPerQuestion}
                            onChange={(e) => setMaxDurationPerQuestion(parseInt(e.target.value, 10) || 120)}
                        />
                        <p className="text-sm text-muted-foreground">
                            ~{Math.round((maxDurationPerQuestion * questionCount) / 60)} min total
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
        </div>
    );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Video, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface VideoConfig {
    questionCount: number;
    maxDurationPerQuestion: number;
    retakesAllowed: number;
    competencyName: string;
    targetLevel: string;
}

interface VideoComponentBuilderProps {
    componentId: string;
    modelId: string;
    competencyName: string;
    targetLevel: string;
    indicators?: { id: string; text: string; level: string }[];
    initialConfig?: VideoConfig | null;
    onComplete: () => void;
    onCancel: () => void;
}

export function VideoComponentBuilder({
    componentId,
    modelId,
    competencyName,
    targetLevel,
    initialConfig,
    onComplete,
    onCancel,
}: VideoComponentBuilderProps) {
    const [questionCount, setQuestionCount] = useState(initialConfig?.questionCount ?? 3);
    const [maxDurationPerQuestion, setMaxDurationPerQuestion] = useState(
        initialConfig?.maxDurationPerQuestion ?? 180
    );
    const [retakesAllowed, setRetakesAllowed] = useState(initialConfig?.retakesAllowed ?? 1);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const config: VideoConfig = {
                questionCount,
                maxDurationPerQuestion,
                retakesAllowed,
                competencyName,
                targetLevel,
            };

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

            const bulkRes = await fetch(
                `/api/assessments/admin/components/${componentId}/questions/bulk-json`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        questions: [
                            {
                                questionText: `AI Video Interview - ${competencyName} (${targetLevel})`,
                                questionType: "VIDEO_RESPONSE",
                                points: 100,
                                timeLimit: maxDurationPerQuestion * questionCount,
                                linkedIndicators: [],
                                metadata: { ...config, type: "VIDEO_INTERVIEW_CONFIG" },
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
            toast.success("AI Video component configured");
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
                        <Video className="w-6 h-6 text-navy-600" />
                        <CardTitle>AI Video Interview Configuration</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Configure the video interview for {competencyName}. Candidates record video responses;
                        AI analyzes content, delivery, and visual presence.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Number of questions (2–5)</Label>
                        <Slider
                            value={[questionCount]}
                            onValueChange={([v]) => setQuestionCount(v ?? 3)}
                            min={2}
                            max={5}
                            step={1}
                        />
                        <p className="text-sm text-muted-foreground">{questionCount} questions</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Max duration per question (seconds)</Label>
                        <Input
                            type="number"
                            min={60}
                            max={600}
                            value={maxDurationPerQuestion}
                            onChange={(e) => setMaxDurationPerQuestion(parseInt(e.target.value, 10) || 180)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Retakes allowed (0–2)</Label>
                        <Input
                            type="number"
                            min={0}
                            max={2}
                            value={retakesAllowed}
                            onChange={(e) => setRetakesAllowed(parseInt(e.target.value, 10) || 0)}
                        />
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

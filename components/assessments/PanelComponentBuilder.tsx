"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export interface PanelConfig {
    panelId: string;
    panelName?: string;
    competencyName: string;
    targetLevel: string;
    durationMinutes: number;
}

interface PanelComponentBuilderProps {
    componentId: string;
    modelId: string;
    competencyName: string;
    targetLevel: string;
    initialConfig?: PanelConfig | null;
    onComplete: () => void;
    onCancel: () => void;
}

interface PanelOption {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    _count?: { members: number };
}

export function PanelComponentBuilder({
    componentId,
    modelId,
    competencyName,
    targetLevel,
    initialConfig,
    onComplete,
    onCancel,
}: PanelComponentBuilderProps) {
    const [panels, setPanels] = useState<PanelOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedPanelId, setSelectedPanelId] = useState<string>(initialConfig?.panelId ?? "");
    const [durationMinutes, setDurationMinutes] = useState(initialConfig?.durationMinutes ?? 60);
    const [createNew, setCreateNew] = useState(false);
    const [newPanelName, setNewPanelName] = useState("");
    const [newPanelDescription, setNewPanelDescription] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/assessments/panels");
                if (res.ok) {
                    const data = await res.json();
                    setPanels(data);
                    if (!selectedPanelId && data.length > 0) setSelectedPanelId(data[0].id);
                }
            } catch {
                toast.error("Failed to load panels");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSave = async () => {
        let panelId = selectedPanelId;
        if (createNew && newPanelName.trim()) {
            setSaving(true);
            try {
                const res = await fetch("/api/assessments/panels", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: newPanelName.trim(),
                        description: newPanelDescription.trim() || undefined,
                        durationMinutes,
                    }),
                });
                if (!res.ok) {
                    const err = await res.json();
                    toast.error(err.error || "Failed to create panel");
                    return;
                }
                const created = await res.json();
                panelId = created.id;
            } catch {
                toast.error("Failed to create panel");
                return;
            }
        }

        if (!panelId) {
            toast.error("Select or create a panel");
            return;
        }

        setSaving(true);
        try {
            const config: PanelConfig = {
                panelId,
                competencyName,
                targetLevel,
                durationMinutes,
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
                                questionText: `Panel Interview – ${competencyName} (${targetLevel})`,
                                questionType: "ESSAY",
                                points: 100,
                                linkedIndicators: [],
                                metadata: { type: "PANEL_PLACEHOLDER", ...config },
                            },
                        ],
                    }),
                }
            );
            if (!bulkRes.ok) {
                const err = await bulkRes.json();
                toast.error(err.error || "Failed to save placeholder");
                return;
            }
            toast.success("Panel component configured");
            onComplete();
        } catch {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6 flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
                </CardContent>
            </Card>
        );
    }

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
            <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                    Panel interviews are scheduled separately. Select a panel or create one; candidates will see this section and can schedule their interview.
                </p>

                <div className="space-y-2">
                    <Label>Panel</Label>
                    {!createNew ? (
                        <>
                            <Select value={selectedPanelId} onValueChange={setSelectedPanelId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select panel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {panels.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                            {p._count?.members != null ? ` (${p._count.members} members)` : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setCreateNew(true)}>
                                <Plus className="h-4 w-4 mr-1" /> Create new panel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Input
                                placeholder="Panel name"
                                value={newPanelName}
                                onChange={(e) => setNewPanelName(e.target.value)}
                            />
                            <Input
                                placeholder="Description (optional)"
                                value={newPanelDescription}
                                onChange={(e) => setNewPanelDescription(e.target.value)}
                            />
                            <Button type="button" variant="ghost" size="sm" onClick={() => setCreateNew(false)}>
                                Cancel – select existing
                            </Button>
                        </>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                        type="number"
                        min={15}
                        max={180}
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 60)}
                    />
                </div>

                <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={onCancel} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Library, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SaveToLibraryDialogProps {
    componentId: string;
    componentType: string;
    competencyId: string;
    competencyName?: string;
    targetLevel: string;
    questionCount: number;
    onSaved?: () => void;
    trigger?: React.ReactNode;
}

export function SaveToLibraryDialog({
    componentId,
    componentType,
    competencyId,
    competencyName,
    targetLevel,
    questionCount,
    onSaved,
    trigger,
}: SaveToLibraryDialogProps) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<"PRIVATE" | "ORGANIZATION" | "GLOBAL">("PRIVATE");

    const defaultName = name || `${competencyName || "Component"} - ${componentType} (${targetLevel})`;

    const handleSave = async () => {
        const finalName = name || defaultName;
        if (!finalName.trim()) {
            toast.error("Please enter a name");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/assessments/library", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: finalName.trim(),
                    description: description.trim() || null,
                    componentType,
                    competencyId,
                    targetLevel,
                    visibility,
                    sourceComponentId: componentId,
                }),
            });

            if (res.ok) {
                toast.success("Saved to library! You can reuse this component in other assessments.");
                setOpen(false);
                setName("");
                setDescription("");
                onSaved?.();
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to save to library");
            }
        } catch {
            toast.error("Failed to save to library");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" size="sm" className="h-8 px-4 text-sm gap-1.5">
                        <Library className="w-4 h-4" />
                        Save to Library
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Library className="w-5 h-5 text-indigo-600" />
                        Save to Component Library
                    </DialogTitle>
                    <DialogDescription>
                        Save this component ({questionCount} questions) to the library for reuse in other assessments.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="lib-name">Name</Label>
                        <Input
                            id="lib-name"
                            placeholder={defaultName}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lib-desc">Description (optional)</Label>
                        <Textarea
                            id="lib-desc"
                            placeholder="Brief description for others..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Visibility</Label>
                        <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PRIVATE">Private (only you)</SelectItem>
                                <SelectItem value="ORGANIZATION">Organization</SelectItem>
                                <SelectItem value="GLOBAL">Global (requires approval)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Library className="w-4 h-4 mr-2" />
                        )}
                        Save to Library
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

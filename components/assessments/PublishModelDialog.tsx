"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Globe, Building2, Lock } from "lucide-react";
import { toast } from "sonner";

interface PublishModelDialogProps {
    modelId: string;
    modelName?: string;
    currentVisibility?: string;
    currentStatus?: string;
    isSuperAdmin?: boolean;
    onPublished?: () => void;
    trigger?: React.ReactNode;
}

export function PublishModelDialog({
    modelId,
    modelName,
    currentVisibility = "PRIVATE",
    currentStatus = "DRAFT",
    isSuperAdmin = false,
    onPublished,
    trigger
}: PublishModelDialogProps) {
    const [open, setOpen] = useState(false);
    const [visibility, setVisibility] = useState<"PRIVATE" | "ORGANIZATION" | "GLOBAL">("PRIVATE");
    const [publishing, setPublishing] = useState(false);

    const handlePublish = async () => {
        setPublishing(true);
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visibility })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                toast.success(data.message || "Model published");
                setOpen(false);
                onPublished?.();
            } else {
                toast.error(data.error || "Failed to publish");
            }
        } catch {
            toast.error("Failed to publish");
        } finally {
            setPublishing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="default" size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Publish
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Publish Assessment Model</DialogTitle>
                    <DialogDescription>
                        {modelName && (
                            <span className="block mb-1 font-medium text-foreground">{modelName}</span>
                        )}
                        Choose visibility for this model. Published models can be assigned to users.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-3">
                        <Label>Visibility</Label>
                        <div className="grid gap-2">
                            <label
                                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                    visibility === "PRIVATE"
                                        ? "border-primary bg-primary/5"
                                        : "border-muted hover:border-muted-foreground/30"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="PRIVATE"
                                    checked={visibility === "PRIVATE"}
                                    onChange={() => setVisibility("PRIVATE")}
                                    className="sr-only"
                                />
                                <Lock className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">Private</div>
                                    <div className="text-sm text-muted-foreground">
                                        Only you and admins can see and assign
                                    </div>
                                </div>
                            </label>

                            <label
                                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                    visibility === "ORGANIZATION"
                                        ? "border-primary bg-primary/5"
                                        : "border-muted hover:border-muted-foreground/30"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="ORGANIZATION"
                                    checked={visibility === "ORGANIZATION"}
                                    onChange={() => setVisibility("ORGANIZATION")}
                                    className="sr-only"
                                />
                                <Building2 className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">Organization</div>
                                    <div className="text-sm text-muted-foreground">
                                        Visible to your organization/tenant
                                    </div>
                                </div>
                            </label>

                            <label
                                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                    visibility === "GLOBAL"
                                        ? "border-primary bg-primary/5"
                                        : "border-muted hover:border-muted-foreground/30"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="GLOBAL"
                                    checked={visibility === "GLOBAL"}
                                    onChange={() => setVisibility("GLOBAL")}
                                    className="sr-only"
                                />
                                <Globe className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        Global
                                        {!isSuperAdmin && (
                                            <Badge variant="secondary" className="text-xs">
                                                Requires approval
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {isSuperAdmin
                                            ? "Available to all tenants (Super Admin)"
                                            : "Submit request for global publishing"}
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={publishing}>
                        Cancel
                    </Button>
                    <Button onClick={handlePublish} disabled={publishing}>
                        {publishing ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Send className="w-4 h-4 mr-2" />
                        )}
                        Publish
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

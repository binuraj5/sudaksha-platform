"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Loader2, Library, Search } from "lucide-react";
import { toast } from "sonner";

interface LibraryComponent {
    id: string;
    name: string;
    description?: string | null;
    componentType: string;
    competencyId: string;
    targetLevel: string;
    visibility: string;
    usageCount: number;
    questions: unknown[];
    competency?: { id: string; name: string };
    creator?: { id: string; name: string | null; email: string | null };
}

interface LibraryBrowserProps {
    competencyId?: string;
    componentType?: string;
    targetLevel?: string;
    modelId: string;
    componentId: string;
    onSuccess: () => void;
    onCancel?: () => void;
}

export function LibraryBrowser({
    competencyId,
    componentType,
    targetLevel,
    modelId,
    componentId,
    onSuccess,
    onCancel
}: LibraryBrowserProps) {
    const [components, setComponents] = useState<LibraryComponent[]>([]);
    const [loading, setLoading] = useState(true);
    const [usingId, setUsingId] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        competencyId: competencyId || "",
        componentType: componentType || "",
        targetLevel: targetLevel || "",
        search: ""
    });

    const fetchComponents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.competencyId) params.set("competencyId", filters.competencyId);
            if (filters.componentType) params.set("componentType", filters.componentType);
            if (filters.targetLevel) params.set("targetLevel", filters.targetLevel);

            const res = await fetch(`/api/assessments/library?${params}`);
            if (res.ok) {
                const data = await res.json();
                setComponents(data.components || []);
            } else {
                toast.error("Failed to load library");
            }
        } catch {
            toast.error("Failed to load library");
        } finally {
            setLoading(false);
        }
    }, [filters.competencyId, filters.componentType, filters.targetLevel]);

    useEffect(() => {
        fetchComponents();
    }, [fetchComponents]);

    const filteredComponents = components.filter((comp) => {
        const search = filters.search.toLowerCase();
        return (
            !search ||
            comp.name.toLowerCase().includes(search) ||
            (comp.description?.toLowerCase().includes(search) ?? false) ||
            (comp.competency?.name.toLowerCase().includes(search) ?? false)
        );
    });

    const handleUse = async (lib: LibraryComponent) => {
        setUsingId(lib.id);
        try {
            const res = await fetch(
                `/api/assessments/admin/models/${modelId}/components/${componentId}/use-library`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ libraryComponentId: lib.id })
                }
            );

            if (res.ok) {
                const data = await res.json();
                toast.success(`Added ${data.count} questions from library`);
                onSuccess();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to use component");
            }
        } catch {
            toast.error("Failed to use component");
        } finally {
            setUsingId(null);
        }
    };

    const questionCount = (comp: LibraryComponent) => {
        const q = comp.questions;
        return Array.isArray(q) ? q.length : 0;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Library className="w-4 h-4" />
                <span>Browse and select from the component library</span>
            </div>

            <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, description..."
                            value={filters.search}
                            onChange={(e) =>
                                setFilters((f) => ({ ...f, search: e.target.value }))
                            }
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={filters.targetLevel}
                        onValueChange={(v) =>
                            setFilters((f) => ({ ...f, targetLevel: v }))
                        }
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Levels</SelectItem>
                            <SelectItem value="JUNIOR">Junior</SelectItem>
                            <SelectItem value="MIDDLE">Middle</SelectItem>
                            <SelectItem value="SENIOR">Senior</SelectItem>
                            <SelectItem value="EXPERT">Expert</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.componentType}
                        onValueChange={(v) =>
                            setFilters((f) => ({ ...f, componentType: v }))
                        }
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Types</SelectItem>
                            <SelectItem value="MCQ">MCQ</SelectItem>
                            <SelectItem value="SITUATIONAL">Situational</SelectItem>
                            <SelectItem value="ESSAY">Essay</SelectItem>
                            <SelectItem value="CODE">Code</SelectItem>
                            <SelectItem value="QUESTIONNAIRE">Questionnaire</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading library...</p>
                </div>
            ) : filteredComponents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                    <Library className="w-12 h-12 mx-auto opacity-50" />
                    <p>No components found. Try adjusting filters or save your own to the library.</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {filteredComponents.map((comp) => (
                        <Card
                            key={comp.id}
                            className="hover:border-primary/50 transition-colors"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h4 className="font-semibold">{comp.name}</h4>
                                            <Badge variant="outline">{comp.componentType}</Badge>
                                            <Badge variant="secondary">{comp.targetLevel}</Badge>
                                            {comp.visibility === "GLOBAL" && (
                                                <Badge>Global</Badge>
                                            )}
                                        </div>
                                        {comp.description && (
                                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                {comp.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>
                                                {comp.competency?.name ?? "—"}
                                            </span>
                                            <span>•</span>
                                            <span>{questionCount(comp)} questions</span>
                                            <span>•</span>
                                            <span>Used {comp.usageCount}×</span>
                                            {comp.creator?.name && (
                                                <>
                                                    <span>•</span>
                                                    <span>By {comp.creator.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUse(comp)}
                                            disabled={usingId !== null}
                                        >
                                            {usingId === comp.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                "Use This"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {onCancel && (
                <div className="pt-2">
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
}

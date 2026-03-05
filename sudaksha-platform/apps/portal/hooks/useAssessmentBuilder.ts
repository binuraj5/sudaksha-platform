"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface RoleOption {
    id: string;
    name: string;
    description?: string;
    overallLevel?: string;
    _count?: { competencies: number };
}

export interface CompetencyOption {
    id: string;
    competencyId: string;
    weight: number;
    competency: { id: string; name: string; category: string };
    requiredLevel?: string;
}

/**
 * Shared state and API logic for the two assessment creation wizards.
 * Extracted so bug fixes propagate to both Admin and Org wizard UIs.
 */
export function useAssessmentBuilder() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [targetLevel, setTargetLevel] = useState("JUNIOR");
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [roleCompetencies, setRoleCompetencies] = useState<CompetencyOption[]>([]);
    const [weights, setWeights] = useState<Record<string, number>>({});
    const [indicatorPreview, setIndicatorPreview] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    const fetchRoles = useCallback(async (url: string) => {
        setLoading(true);
        try {
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setRoles(Array.isArray(data) ? data : data?.roles || data?.models || []);
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to load roles");
            }
        } catch {
            toast.error("Failed to load roles");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoleCompetencies = useCallback(async (roleId: string, url: string) => {
        if (!roleId) return;
        setLoading(true);
        try {
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                const list: CompetencyOption[] = Array.isArray(data) ? data : data?.competencies || [];
                setRoleCompetencies(list);

                // Normalize weights: convert fractional (0–1) to percentage, or distribute equally
                const equal = list.length > 0 ? Math.round((100 / list.length) * 10) / 10 : 0;
                const w: Record<string, number> = {};
                list.forEach((rc) => {
                    const raw = rc.weight ?? 1;
                    w[rc.competencyId] =
                        raw > 0 && raw <= 1
                            ? Math.round(raw * 1000) / 10
                            : raw > 1
                                ? raw
                                : equal;
                });
                setWeights(w);
            } else {
                toast.error("Failed to load competencies");
            }
        } catch {
            toast.error("Failed to load competencies");
        } finally {
            setLoading(false);
        }
    }, []);

    /** Fetch indicator preview. Returns true on success. */
    const fetchPreview = useCallback(async (competencyIds: string[], level: string): Promise<boolean> => {
        setLoading(true);
        try {
            const res = await fetch("/api/assessments/admin/indicators/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ competencyIds, targetLevel: level }),
            });
            if (res.ok) {
                const data = await res.json();
                setIndicatorPreview(Array.isArray(data) ? data : data?.indicators || []);
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /** Redistribute selected competency weights proportionally to sum to 100%. */
    const normalizeWeights = useCallback((selectedIds: Set<string>, comps: CompetencyOption[]) => {
        setWeights((prev) => {
            const selected = comps.filter((c) => selectedIds.has(c.competencyId));
            const sum = selected.reduce((s, c) => s + (prev[c.competencyId] ?? 0), 0);
            if (sum <= 0) return prev;
            const next = { ...prev };
            selected.forEach((c) => {
                next[c.competencyId] = Math.round(((prev[c.competencyId] ?? 0) / sum) * 1000) / 10;
            });
            return next;
        });
    }, []);

    /** POST to /api/assessments/admin/models/from-role. */
    const handleCreate = useCallback(async (
        payload: Record<string, unknown>,
        onSuccess: (model: { id: string }) => void
    ) => {
        setCreating(true);
        try {
            const res = await fetch("/api/assessments/admin/models/from-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const model = await res.json();
                toast.success("Assessment created successfully");
                onSuccess(model);
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.details || err.error || "Failed to create assessment");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setCreating(false);
        }
    }, []);

    return {
        name, setName,
        description, setDescription,
        targetLevel, setTargetLevel,
        selectedRoleId, setSelectedRoleId,
        roles,
        roleCompetencies,
        weights, setWeights,
        indicatorPreview,
        loading,
        creating,
        fetchRoles,
        fetchRoleCompetencies,
        fetchPreview,
        normalizeWeights,
        handleCreate,
    };
}

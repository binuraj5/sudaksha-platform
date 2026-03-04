"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const COMPONENT_TYPES = ["MCQ", "SITUATIONAL", "CODE", "ESSAY", "VOICE", "VIDEO", "PANEL"];
const TARGET_LEVELS = ["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"];

export default function NewLibraryComponentPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [componentType, setComponentType] = useState("MCQ");
    const [competencyId, setCompetencyId] = useState("");
    const [targetLevel, setTargetLevel] = useState("MIDDLE");
    const [visibility, setVisibility] = useState("PRIVATE");
    const [error, setError] = useState<string | null>(null);

    const { data: competenciesData } = useQuery({
        queryKey: ["competencies"],
        queryFn: async () => {
            const res = await fetch("/api/admin/competencies");
            if (!res.ok) throw new Error("Failed to fetch competencies");
            return res.json();
        }
    });

    // Ensure we always have an array, even if the API returns a different structure
    const rawCompetencies = competenciesData?.competencies ?? competenciesData;
    const competencies = Array.isArray(rawCompetencies) ? rawCompetencies : [];

    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/assessments/library", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description: description || null,
                    componentType,
                    competencyId,
                    targetLevel,
                    visibility,
                    questions: []
                })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create");
            }
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["component-library"] });
            router.push(`/assessments/admin/components/library/${data.component?.id}/questions`);
        },
        onError: (err: Error) => setError(err.message)
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !competencyId) {
            setError("Name and Competency are required");
            return;
        }
        createMutation.mutate();
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/assessments/admin/components" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Create Library Component</h1>
                    <p className="text-sm text-gray-500">Add a new reusable assessment component</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Competency *</label>
                    <Select value={competencyId} onValueChange={setCompetencyId} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select competency" />
                        </SelectTrigger>
                        <SelectContent>
                            {competencies.map((c: { id: string; name: string }) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <Select value={componentType} onValueChange={setComponentType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {COMPONENT_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Level</label>
                        <Select value={targetLevel} onValueChange={setTargetLevel}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TARGET_LEVELS.map((l) => (
                                    <SelectItem key={l} value={l}>{l}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                    <Select value={visibility} onValueChange={setVisibility}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PRIVATE">Private</SelectItem>
                            <SelectItem value="ORGANIZATION">Organization</SelectItem>
                            <SelectItem value="GLOBAL">Global</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={createMutation.isPending} className="bg-red-600 hover:bg-red-700">
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Create & Add Questions
                </Button>
            </form>
        </div>
    );
}

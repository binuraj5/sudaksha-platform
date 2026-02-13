"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AssessmentComponentSchema } from "@/lib/validations/assessment-component";
import { Loader2, Save, ArrowLeft, Trash2, Sparkles, Settings2, Info, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type FormData = z.infer<typeof AssessmentComponentSchema>;

export default function EditComponentPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    // Fetch runtime config
    const { data: runtimeConfig } = useQuery({
        queryKey: ["runtime-config", params.id],
        queryFn: async () => {
            const res = await fetch(`/api/admin/assessment-components/${params.id}/runtime-config`);
            if (!res.ok) throw new Error("Failed to fetch runtime config");
            return res.json();
        }
    });

    const [selectionMode, setSelectionMode] = useState<"ALL" | "RANDOM" | "ADAPTIVE">("ALL");
    const [randomCount, setRandomCount] = useState<number>(10);

    const [adaptiveSettings, setAdaptiveSettings] = useState({
        enabled: false,
        totalQuestions: 10,
        adaptiveLevel: "moderate",
        startingDifficulty: "intermediate",
        initialContext: "",
        competencyAreas: [] as string[],
        aiModel: "claude-3-5-sonnet",
        aiProvider: "ANTHROPIC", // Default provider
        provideRealTimeFeedback: true,
        storeGeneratedQuestions: true,
        increaseDifficultyAfter: 3,
        decreaseDifficultyAfter: 2,
    });

    const [newCompetency, setNewCompetency] = useState("");

    // Fetch existing data
    const { data: component, isLoading } = useQuery({
        queryKey: ["assessment-component", params.id],
        queryFn: async () => {
            const res = await fetch(`/api/admin/assessment-components/${params.id}`);
            if (!res.ok) throw new Error("Failed to fetch component");
            return res.json();
        }
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm<FormData>({
        resolver: zodResolver(AssessmentComponentSchema),
        defaultValues: {
            duration: 30,
            passingScore: 70,
        }
    });

    const updateRuntimeConfig = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/admin/assessment-components/${params.id}/runtime-config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update runtime config");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["runtime-config", params.id] });
        }
    });

    const updateComponent = useMutation({
        mutationFn: async (data: FormData) => {
            const res = await fetch(`/api/admin/assessment-components/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update component");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment-components"] });
            queryClient.invalidateQueries({ queryKey: ["assessment-component", params.id] });
            router.push("/assessments/admin/components");
        },
        onError: (err: Error) => {
            setError(err.message);
        }
    });

    useEffect(() => {
        if (runtimeConfig) {
            setAdaptiveSettings(prev => ({
                ...prev,
                ...runtimeConfig,
                competencyAreas: runtimeConfig.competencyAreas || []
            }));

            // If runtime / adaptive is enabled, it overrules static config
            if (runtimeConfig.enabled) {
                setSelectionMode("ADAPTIVE");
            }
        }
    }, [runtimeConfig]);

    useEffect(() => {
        if (component) {
            reset({
                ...component,
            });

            // JSON config from component
            if (component.aiEngineConfig?.selectionMode) {
                // Only set if not already set to ADAPTIVE (unless we want priority logic)
                // Assuming ADAPTIVE flag in runtimeConfig represents state accurately
                if (!runtimeConfig?.enabled) {
                    setSelectionMode(component.aiEngineConfig.selectionMode);
                    if (component.aiEngineConfig.randomCount) {
                        setRandomCount(component.aiEngineConfig.randomCount);
                    }
                }
            }
        }
    }, [component, reset, runtimeConfig]);

    const deleteComponent = useMutation({
        mutationFn: async () => {
            if (!confirm("Are you sure you want to delete this component? This usage check will happen on server.")) return;

            const res = await fetch(`/api/admin/assessment-components/${params.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete component");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment-components"] });
            router.push("/assessments/admin/components");
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });

    // Reuse form logic from Create... (Ideally extract to component)
    // For now duplicating for speed as per agent instructions "don't be over-DRY if it slows down"
    const categories = ["TECHNICAL", "BEHAVIORAL", "DOMAIN_SPECIFIC", "COGNITIVE", "LANGUAGE", "SOFT_SKILLS"];
    const difficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
    const industries = [
        "INFORMATION_TECHNOLOGY", "HEALTHCARE", "FINANCE", "MANUFACTURING", "EDUCATION",
        "RETAIL", "TELECOMMUNICATIONS", "GOVERNMENT", "ENERGY", "TRANSPORTATION",
        "HOSPITALITY", "REAL_ESTATE", "AGRICULTURE", "MEDIA", "GENERIC"
    ];
    const experienceLevels = ["ENTRY_LEVEL", "MID_LEVEL", "SENIOR_LEVEL", "EXPERT_LEVEL", "ALL_LEVELS"];

    if (isLoading) return <div className="p-12 text-center">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Link href="/assessments/admin/components" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Component</h1>
                </div>
                <button
                    onClick={() => deleteComponent.mutate()}
                    className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(async (data) => {
                // Combined Submit Logic

                // 1. Prepare Component Data with aiEngineConfig
                const aiConfig = {
                    selectionMode,
                    randomCount: selectionMode === "RANDOM" ? randomCount : null
                };

                // 2. Update Component
                await updateComponent.mutateAsync({
                    ...data,
                    aiEngineConfig: aiConfig
                });

                // 3. Update Runtime Config (Toggle enabled based on mode)
                const isAdaptive = selectionMode === "ADAPTIVE";
                await updateRuntimeConfig.mutateAsync({
                    ...adaptiveSettings,
                    enabled: isAdaptive
                });

            })} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
                {/* Same form fields as Create */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Component Name</label>
                            <input
                                {...register("name")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                            <input
                                {...register("slug")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                disabled // Slugs typically shouldn't change to avoid breaking links
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                {...register("description")}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Classification</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                {...register("category")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                            <input
                                {...register("subCategory")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            />
                            {errors.subCategory && <p className="text-red-500 text-sm mt-1">{errors.subCategory.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                            <select
                                {...register("difficultyLevel")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">Select Difficulty</option>
                                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {errors.difficultyLevel && <p className="text-red-500 text-sm mt-1">{errors.difficultyLevel.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                {...register("duration", { valueAsNumber: true })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            />
                            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Target Industries</label>
                            <div className="flex flex-wrap gap-2">
                                {industries.map(ind => (
                                    <label key={ind} className="inline-flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            value={ind}
                                            {...register("industries")}
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
                                        />
                                        <span className="text-xs text-gray-700 font-medium capitalize">{ind.replace(/_/g, " ").toLowerCase()}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.industries && <p className="text-red-500 text-sm mt-1">{errors.industries.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                            <div className="flex flex-wrap gap-2">
                                {experienceLevels.map(exp => (
                                    <label key={exp} className="inline-flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            value={exp}
                                            {...register("experienceLevel")}
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
                                        />
                                        <span className="text-xs text-gray-700 font-medium capitalize">{exp.replace(/_/g, " ").toLowerCase()}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.experienceLevel && <p className="text-red-500 text-sm mt-1">{errors.experienceLevel.message}</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pt-6 border-t">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings2 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-medium text-gray-900">Question Selection Logic</h3>
                    </div>

                    {/* Selection Mode Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                            onClick={() => setSelectionMode("ALL")}
                            className={cn(
                                "cursor-pointer p-4 rounded-lg border-2 transition-all",
                                selectionMode === "ALL"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <div className="font-semibold text-gray-900 mb-1">Fixed Order</div>
                            <p className="text-xs text-gray-500">Deliver all questions in the sequence defined in the Manage Questions page.</p>
                        </div>

                        <div
                            onClick={() => setSelectionMode("RANDOM")}
                            className={cn(
                                "cursor-pointer p-4 rounded-lg border-2 transition-all",
                                selectionMode === "RANDOM"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <div className="font-semibold text-gray-900 mb-1">Random Subset</div>
                            <p className="text-xs text-gray-500">Randomly select a specific number of questions from the bank for each attempt.</p>
                        </div>

                        <div
                            onClick={() => setSelectionMode("ADAPTIVE")}
                            className={cn(
                                "cursor-pointer p-4 rounded-lg border-2 transition-all",
                                selectionMode === "ADAPTIVE"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                Adaptive AI
                                <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-800">BETA</Badge>
                            </div>
                            <p className="text-xs text-gray-500">Dynamically generate questions based on user performance using AI agents.</p>
                        </div>
                    </div>

                    {/* Detailed Config based on Mode */}
                    {selectionMode === "RANDOM" && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions to Select</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={randomCount}
                                    onChange={(e) => setRandomCount(parseInt(e.target.value) || 0)}
                                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-500">
                                    questions from the total pool.
                                </span>
                            </div>
                        </div>
                    )}

                    {selectionMode === "ADAPTIVE" && (
                        <div className="space-y-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                            <h4 className="font-medium text-blue-900">Adaptive Configuration</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Dynamic Questions</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        value={adaptiveSettings.totalQuestions}
                                        onChange={(e) => setAdaptiveSettings({ ...adaptiveSettings, totalQuestions: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Starting Difficulty</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        value={adaptiveSettings.startingDifficulty}
                                        onChange={(e) => setAdaptiveSettings({ ...adaptiveSettings, startingDifficulty: e.target.value })}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                </div>
                            </div>

                            {/* AI Provider Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    value={adaptiveSettings.aiProvider}
                                    onChange={(e) => setAdaptiveSettings({ ...adaptiveSettings, aiProvider: e.target.value })}
                                >
                                    <option value="OPENAI">OpenAI (GPT-4o)</option>
                                    <option value="ANTHROPIC">Anthropic (Claude 3.5 Sonnet)</option>
                                    <option value="PERPLEXITY">Perplexity AI</option>
                                    <option value="XAI">xAI (Grok 2)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Select the AI provider to use for real-time question generation.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial AI Context</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    rows={3}
                                    placeholder="Provide background info to the AI engine for question generation..."
                                    value={adaptiveSettings.initialContext}
                                    onChange={(e) => setAdaptiveSettings({ ...adaptiveSettings, initialContext: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Competency Areas</label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Add a focus area (e.g. Memory Management)"
                                        value={newCompetency}
                                        onChange={(e) => setNewCompetency(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), (newCompetency && (setAdaptiveSettings({ ...adaptiveSettings, competencyAreas: [...adaptiveSettings.competencyAreas, newCompetency] }), setNewCompetency(""))))}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newCompetency) {
                                                setAdaptiveSettings({
                                                    ...adaptiveSettings,
                                                    competencyAreas: [...adaptiveSettings.competencyAreas, newCompetency]
                                                });
                                                setNewCompetency("");
                                            }
                                        }}
                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {adaptiveSettings.competencyAreas.map((area, idx) => (
                                        <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                                            {area}
                                            <button
                                                type="button" // Important type=button to prevent submit
                                                onClick={() => setAdaptiveSettings({
                                                    ...adaptiveSettings,
                                                    competencyAreas: adaptiveSettings.competencyAreas.filter((_, i) => i !== idx)
                                                })}
                                                className="p-0.5 hover:bg-gray-200 rounded-full"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="feedback"
                                        checked={adaptiveSettings.provideRealTimeFeedback}
                                        onChange={(e) => setAdaptiveSettings({ ...adaptiveSettings, provideRealTimeFeedback: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="feedback" className="text-sm font-medium text-gray-700">Real-time Feedback</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="store"
                                        checked={adaptiveSettings.storeGeneratedQuestions}
                                        onChange={(e) => setAdaptiveSettings({ ...adaptiveSettings, storeGeneratedQuestions: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="store" className="text-sm font-medium text-gray-700">Audit/Store Logic</label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-6 border-t">
                    <button
                        type="submit"
                        disabled={isSubmitting || updateRuntimeConfig.status === 'pending'}
                        className="flex items-center px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting || updateRuntimeConfig.status === 'pending' ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form >
        </div >
    );
}

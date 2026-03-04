"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AssessmentComponentSchema } from "@/lib/validations/assessment-component";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type FormData = z.infer<typeof AssessmentComponentSchema>;

export default function CreateComponentPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<FormData>({
        resolver: zodResolver(AssessmentComponentSchema),
        defaultValues: {
            duration: 30,
            passingScore: 70, // Added based on typical schema but ensure schema supports getting this if added
            // Schema didn't have passingScore in validation but backend does, assuming schema update or backend handling
            // Actually schema validation is strict, if passingScore is not in schema it will strip it.
            // Let's stick to schema fields.
        }
    });

    const name = watch("name");

    // Auto-generate slug from name
    const generateSlug = (value: string) => {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    // Update slug when name changes, but only if user hasn't manually edited slug (simplification: just auto-update for now or allow override)
    // Better UX: Allow manual edit, but sanitize. For now, let's just sync them unless strictly managed.
    // Simple approach: On name change, set slug.
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setValue("name", value); // React Hook Form's register handles this usually, but we need to intercept for slug
        // actually using register's onChange is better
    };
    // Wait, let's use useEffect to watch name if we want auto-update, or just simple onChange on input.

    // Let's use the register + onChange pattern


    const createComponent = useMutation({
        mutationFn: async (data: FormData) => {
            const res = await fetch("/api/admin/assessment-components", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create component");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment-components"] });
            router.push("/assessments/admin/components");
        },
        onError: (err: Error) => {
            setError(err.message);
        }
    });

    const category = watch("category");

    // Enum options (manual for now, could be dynamic)
    const categories = ["TECHNICAL", "BEHAVIORAL", "DOMAIN_SPECIFIC", "COGNITIVE", "LANGUAGE", "SOFT_SKILLS"];
    const difficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
    const industries = [
        "INFORMATION_TECHNOLOGY", "HEALTHCARE", "FINANCE", "MANUFACTURING", "EDUCATION",
        "RETAIL", "TELECOMMUNICATIONS", "GOVERNMENT", "ENERGY", "TRANSPORTATION",
        "HOSPITALITY", "REAL_ESTATE", "AGRICULTURE", "MEDIA", "GENERIC"
    ];
    const experienceLevels = ["ENTRY_LEVEL", "MID_LEVEL", "SENIOR_LEVEL", "EXPERT_LEVEL", "ALL_LEVELS"];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/assessments/admin/components" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Create Assessment Component</h1>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit((data) => createComponent.mutate(data))} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Component Name</label>
                            <input
                                {...register("name", {
                                    onChange: (e) => {
                                        const slug = generateSlug(e.target.value);
                                        setValue("slug", slug, { shouldValidate: true });
                                    }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="e.g. Java Core Fundamentals"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                            <input
                                {...register("slug", {
                                    onChange: (e) => {
                                        // Sanitize manual input
                                        const clean = generateSlug(e.target.value);
                                        if (clean !== e.target.value) {
                                            setValue("slug", clean);
                                        }
                                    }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                placeholder="e.g. java-core-fundamentals"
                            />
                            {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                {...register("description")}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="Describe what this component tests..."
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
                                placeholder="e.g. Programming"
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

                <div className="flex justify-end pt-6 border-t">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Create Component
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

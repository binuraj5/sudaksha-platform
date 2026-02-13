"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AssessmentModelSchema } from "@/lib/validations/assessment-model";
import { Loader2, Save, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type FormData = z.infer<typeof AssessmentModelSchema>;

export default function ModelSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    // Fetch existing data
    const { data: model, isLoading } = useQuery({
        queryKey: ["assessment-model", params.id],
        queryFn: async () => {
            const res = await fetch(`/api/admin/assessment-models/${params.id}`);
            if (!res.ok) throw new Error("Failed to fetch model");
            return res.json();
        }
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<FormData>({
        resolver: zodResolver(AssessmentModelSchema),
        defaultValues: {
            visibility: "PUBLIC",
            passingCriteria: 60,
        }
    });

    useEffect(() => {
        if (model) {
            reset({
                ...model,
                // Ensure array handling for roles/industries if format differs
            });
            // Handle array fields manually if reset doesn't map perfectly for controlled inputs
            if (model.targetRoles) setValue("targetRoles", model.targetRoles);
        }
    }, [model, reset, setValue]);

    const updateModel = useMutation({
        mutationFn: async (data: FormData) => {
            const res = await fetch(`/api/admin/assessment-models/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update model");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment-models"] });
            queryClient.invalidateQueries({ queryKey: ["assessment-model", params.id] });
            router.push("/assessments/admin/models");
        },
        onError: (err: Error) => {
            setError(err.message);
        }
    });

    const deleteModel = useMutation({
        mutationFn: async () => {
            if (!confirm("Are you sure? This cannot be undone.")) return;
            const res = await fetch(`/api/admin/assessment-models/${params.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete model");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment-models"] });
            router.push("/assessments/admin/models");
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });

    const industries = [
        "INFORMATION_TECHNOLOGY", "HEALTHCARE", "FINANCE", "MANUFACTURING", "EDUCATION",
        "RETAIL", "TELECOMMUNICATIONS", "GOVERNMENT", "ENERGY", "TRANSPORTATION",
        "HOSPITALITY", "REAL_ESTATE", "AGRICULTURE", "MEDIA", "GENERIC"
    ];
    const experienceLevels = ["ENTRY_LEVEL", "MID_LEVEL", "SENIOR_LEVEL", "EXPERT_LEVEL", "EXECUTIVE_LEVEL"];

    if (isLoading) return <div className="p-12 text-center">Loading settings...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Link href={`/assessments/admin/models/${params.id}/builder`} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Model Settings</h1>
                </div>
                <button
                    onClick={() => deleteModel.mutate()}
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

            <form onSubmit={handleSubmit((data) => updateModel.mutate(data))} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
                {/* Reuse form fields from Create Page */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
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
                                disabled
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
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Target Audience</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Roles</label>
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="e.g. Software Engineer, Backend Developer"
                                defaultValue={model?.targetRoles?.join(", ")}
                                onChange={(e) => {
                                    const roles = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                    setValue("targetRoles", roles);
                                }}
                            />
                            {errors.targetRoles && <p className="text-red-500 text-sm mt-1">{errors.targetRoles.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Target Industries</label>
                            <div className="h-40 overflow-y-auto border rounded-lg p-3 grid grid-cols-1 gap-2">
                                {industries.map(ind => (
                                    <label key={ind} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value={ind}
                                            {...register("targetIndustries")}
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-xs text-gray-700 capitalize">{ind.replace(/_/g, " ").toLowerCase()}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.targetIndustries && <p className="text-red-500 text-sm mt-1">{errors.targetIndustries.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                            <div className="space-y-2">
                                {experienceLevels.map(exp => (
                                    <label key={exp} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            value={exp}
                                            {...register("experienceLevel")}
                                            className="text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-xs text-gray-700 capitalize">{exp.replace(/_/g, " ").toLowerCase()}</span>
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
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

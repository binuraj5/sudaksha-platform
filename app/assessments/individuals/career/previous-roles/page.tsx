"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    Loader2,
    Plus,
    Save,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface PreviousRole {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
}

interface FormValues {
    roles: PreviousRole[];
}

export default function PreviousRolesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { control, handleSubmit, reset } = useForm<FormValues>({
        defaultValues: { roles: [] }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "roles"
    });

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/profile");
                const data = await res.json();
                if (res.ok && data) {
                    const roles = Array.isArray(data.previousRoles) ? data.previousRoles : [];
                    reset({ roles });
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [reset]);

    const onSubmit = async (data: FormValues) => {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ previousRoles: data.roles })
            });

            if (res.ok) {
                toast.success("Previous roles saved successfully!");
                router.refresh();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to save previous roles");
            }
        } catch (error) {
            toast.error("An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50 p-6 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/assessments/individuals/career">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Previous Roles</h1>
                            <p className="text-gray-500 mt-1">Track the history of roles you've held to power career recommendations.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {fields.length === 0 ? (
                        <Card className="border-dashed border-2 bg-transparent shadow-none">
                            <CardContent className="flex flex-col flex-1 items-center justify-center p-12 text-center">
                                <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No previous roles added</h3>
                                <p className="text-sm text-gray-500 mt-1 mb-4">You haven't added any historical roles yet.</p>
                                <Button type="button" onClick={() => append({ title: "", company: "", startDate: "", endDate: "", description: "" })} variant="outline" className="border-dashed">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add your first role
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {fields.map((field, index) => (
                                <Card key={field.id} className="relative shadow-sm transition-all hover:shadow-md">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-indigo-500" /> Role {index + 1}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Job Title <span className="text-red-500">*</span></Label>
                                            <Controller
                                                name={`roles.${index}.title`}
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => <Input {...field} placeholder="e.g. Software Engineer" />}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Company / Organization</Label>
                                            <Controller
                                                name={`roles.${index}.company`}
                                                control={control}
                                                render={({ field }) => <Input {...field} placeholder="e.g. Tech Corp" />}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Controller
                                                    name={`roles.${index}.startDate`}
                                                    control={control}
                                                    render={({ field }) => <Input type="month" className="pl-9" {...field} />}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Controller
                                                    name={`roles.${index}.endDate`}
                                                    control={control}
                                                    render={({ field }) => <Input type="month" className="pl-9" {...field} />}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 text-right">Leave blank if current</p>
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>Description</Label>
                                            <Controller
                                                name={`roles.${index}.description`}
                                                control={control}
                                                render={({ field }) => <Textarea {...field} placeholder="Briefly describe your responsibilities and achievements..." rows={3} />}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ title: "", company: "", startDate: "", endDate: "", description: "" })}
                            className="w-full sm:w-auto text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Role
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto bg-gray-900 text-white hover:bg-gray-800"
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

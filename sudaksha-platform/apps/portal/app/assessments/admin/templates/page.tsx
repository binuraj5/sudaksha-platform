"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
    Search,
    Filter,
    Plus,
    Loader2,
    Clock,
    Users,
    CheckCircle2,
    Copy,
    Trash2,
    LayoutTemplate
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AssessmentTemplatesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const queryClient = useQueryClient();

    // Fetch ONLY templates (SYSTEM visibility)
    const { data: templates, isLoading, error } = useQuery({
        queryKey: ["assessment-templates", searchQuery],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append("visibility", "SYSTEM"); // Filter for templates
            if (searchQuery) params.append("search", searchQuery);

            const res = await fetch(`/api/admin/assessment-models?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch templates");
            return res.json();
        }
    });

    // Seed Templates Mutation
    const seedTemplates = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/seed/templates", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to seed templates");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment-templates"] });
            alert("Templates seeded successfully!");
        },
        onError: (err) => {
            alert("Failed to seed templates: " + err.message);
        }
    });

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the template.")) return;
        try {
            const res = await fetch(`/api/admin/assessment-models/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed");
            queryClient.invalidateQueries({ queryKey: ["assessment-templates"] });
        } catch (e) {
            alert("Delete failed");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assessment Templates</h1>
                    <p className="text-gray-500">System-defined assessment structures ready to be cloned.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => seedTemplates.mutate()}
                        disabled={seedTemplates.isPending}
                        className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {seedTemplates.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
                        Seed Templates
                    </button>
                    <Link
                        href="/assessments/admin/models/create?type=TEMPLATE"
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Template
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-gray-500 italic">Finding templates...</p>
                </div>
            ) : error ? (
                <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-red-600 font-medium">Failed to load templates. Please try again.</p>
                </div>
            ) : templates?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <Copy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
                    <p className="text-gray-500 mb-6">Get started by seeding default templates or create your own.</p>
                    <button
                        onClick={() => seedTemplates.mutate()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Seed Default Data
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-[300px]">Template Name</TableHead>
                                <TableHead>Target Industries</TableHead>
                                <TableHead className="text-center">Components</TableHead>
                                <TableHead className="text-center">Duration</TableHead>
                                <TableHead className="text-center">Pass Mark</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.map((template: any) => (
                                <TableRow key={template.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 uppercase tracking-tight">{template.name}</span>
                                            <span className="text-xs text-gray-500 line-clamp-1">{template.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {template.targetIndustries && template.targetIndustries.length > 0 ? (
                                                template.targetIndustries.map((ind: string) => (
                                                    <Badge key={ind} variant="outline" className="text-[10px] bg-gray-50 text-gray-600 border-gray-200">
                                                        {ind}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">General</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="bg-red-50 text-red-700 border-none text-[10px] font-bold">
                                            {template.components?.length || 0}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-gray-700">
                                        {template.durationMinutes} mins
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-sm font-bold text-gray-700">{template.passingCriteria}%</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild className="h-8 shadow-sm border px-3">
                                                <Link href={`/assessments/admin/models/${template.id}/builder`}>
                                                    <LayoutTemplate className="w-3.5 h-3.5 mr-1.5" />
                                                    Structure
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(template.id)}
                                                className="h-8 shadow-sm border text-red-600 hover:text-red-700 hover:bg-red-50 px-3"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

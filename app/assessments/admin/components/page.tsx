"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Search, Box, Database, Loader2, ShieldAlert, FileText, LayoutGrid, Edit } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getLibraryComponents(search: string, category: string) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    const res = await fetch(`/api/assessments/library?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch components");
    const data = await res.json();
    return data.components ?? [];
}

async function getModelComponents(modelId: string) {
    const params = new URLSearchParams();
    if (modelId) params.append("modelId", modelId);
    const res = await fetch(`/api/assessments/admin/model-components?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch model components");
    return res.json();
}

async function getModels() {
    const res = await fetch("/api/assessments/admin/models?limit=100");
    if (!res.ok) throw new Error("Failed to fetch models");
    const data = await res.json();
    return data.models ?? [];
}

export default function AssessmentComponentsPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [modelFilter, setModelFilter] = useState("");
    const [activeTab, setActiveTab] = useState<"library" | "model">("model");
    const queryClient = useQueryClient();

    const { data: components = [], isLoading, isError, error } = useQuery({
        queryKey: ["component-library", search, category],
        queryFn: () => getLibraryComponents(search, category),
        enabled: activeTab === "library",
    });

    const { data: modelComponents = [], isLoading: modelLoading } = useQuery({
        queryKey: ["model-components", modelFilter],
        queryFn: () => getModelComponents(modelFilter),
        enabled: activeTab === "model",
    });

    const { data: models = [] } = useQuery({
        queryKey: ["models-list"],
        queryFn: getModels,
        enabled: activeTab === "model",
    });

    const seedMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/seed/components", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Seeding failed");
            return data;
        },
        onSuccess: (data) => {
            if (data.count === 0) alert("Defaults already seeded.");
            else alert(`Successfully seeded ${data.count} components!`);
            queryClient.invalidateQueries({ queryKey: ["component-library"] });
        },
        onError: (err: Error) => {
            alert(`Error: ${err.message}`);
        }
    });

    const isLoadingCurrent = activeTab === "library" ? isLoading : modelLoading;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assessment Components</h1>
                    <p className="text-gray-500">Manage atomic assessment units (skills, topics, etc.)</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => seedMutation.mutate()}
                        disabled={seedMutation.isPending}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {seedMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                        Seed Defaults
                    </button>
                    <Link
                        href="/assessments/admin/components/library/new"
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Component
                    </Link>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "library" | "model")}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="model" className="gap-2">
                        <LayoutGrid className="w-4 h-4" />
                        Model Components
                    </TabsTrigger>
                    <TabsTrigger value="library" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Library
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="model" className="mt-4">
                    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
                        <div className="w-full sm:w-64">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Filter by model</label>
                            <select
                                value={modelFilter}
                                onChange={(e) => setModelFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">All Models</option>
                                {models.map((m: { id: string; name: string; code?: string }) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {modelLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading model components...</p>
                        </div>
                    ) : modelComponents.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                            <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No model components found</h3>
                            <p className="text-gray-500 mt-1">Components are created when building an assessment model. Go to a model&apos;s questions page to add components.</p>
                            <Link href="/assessments/admin/models">
                                <Button variant="outline" className="mt-4">View Assessment Models</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-[280px]">Component</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-center">Questions</TableHead>
                                        <TableHead className="text-center">Duration</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {modelComponents.map((comp: {
                                        id: string;
                                        model?: { id: string; name: string };
                                        competency?: { name: string; category?: string } | null;
                                        libraryComponent?: { name: string } | null;
                                        componentType?: string;
                                        estimatedDuration?: number | null;
                                        _count?: { questions: number };
                                    }) => {
                                        const name = comp.competency?.name ?? comp.libraryComponent?.name ?? "Unnamed";
                                        const cat = comp.competency?.category ?? comp.componentType ?? "—";
                                        return (
                                            <TableRow key={comp.id} className="hover:bg-gray-50/50">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{name}</span>
                                                        <span className="text-xs text-gray-500">{comp.componentType ?? "—"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/assessments/admin/models/${comp.model?.id}/questions`} className="text-sm text-red-600 hover:underline">
                                                        {comp.model?.name ?? "—"}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-gray-100 text-gray-700">{cat}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">{comp._count?.questions ?? 0}</TableCell>
                                                <TableCell className="text-center">{comp.estimatedDuration ? `${comp.estimatedDuration} mins` : "—"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild className="h-8 shadow-sm border px-3">
                                                        <Link href={`/assessments/admin/models/${comp.model?.id}/questions`}>
                                                            <Box className="w-3.5 h-3.5 mr-1.5" />
                                                            Manage Questions
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="library" className="mt-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search components..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                        <option value="">All Categories</option>
                        <option value="TECHNICAL">Technical</option>
                        <option value="BEHAVIORAL">Behavioral</option>
                        <option value="COGNITIVE">Cognitive</option>
                        <option value="DOMAIN_SPECIFIC">Domain Specific</option>
                    </select>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading components...</p>
                </div>
            ) : isError ? (
                <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-red-900">Access Restricted or Error</h3>
                    <p className="text-red-500 mt-1">{(error as Error)?.message || "You don't have permission to view this library."}</p>
                </div>
            ) : components.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No components found</h3>
                    <p className="text-gray-500 mt-1">Get started by creating your first assessment component.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-[300px]">Component Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-center">Questions</TableHead>
                                <TableHead className="text-center">Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {components.map((component: { id: string; name: string; description?: string | null; componentType?: string; competency?: { category?: string }; questions?: unknown[] }) => {
                                const category = component.competency?.category ?? component.componentType ?? "—";
                                const questionCount = Array.isArray(component.questions) ? component.questions.length : 0;
                                return (
                                    <TableRow key={component.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{component.name}</span>
                                                <span className="text-xs text-gray-500 line-clamp-1">{component.description || "No description provided."}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`
                                                ${category === "TECHNICAL" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                    category === "BEHAVIORAL" ? "bg-purple-50 text-purple-700 border-purple-100" :
                                                        "bg-gray-100 text-gray-700"}`}
                                            >
                                                {category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-medium text-gray-700">
                                            {questionCount}
                                        </TableCell>
                                        <TableCell className="text-center font-medium text-gray-700">
                                            —
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild className="h-8 shadow-sm border px-3">
                                                    <Link href={`/assessments/admin/components/library/${component.id}`}>
                                                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild className="h-8 shadow-sm border text-red-600 hover:text-red-700 hover:bg-red-50 px-3">
                                                    <Link href={`/assessments/admin/components/library/${component.id}/questions`}>
                                                        <Box className="w-3.5 h-3.5 mr-1.5" />
                                                        Questions
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

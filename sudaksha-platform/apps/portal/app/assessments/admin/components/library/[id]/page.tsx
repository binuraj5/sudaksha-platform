"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Box } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LibraryComponentEditPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);

    const { data: component, isLoading } = useQuery({
        queryKey: ["library-component", params.id],
        queryFn: async () => {
            const res = await fetch(`/api/assessments/library/${params.id}`);
            if (!res.ok) throw new Error("Failed to fetch component");
            return res.json();
        },
        enabled: !!params.id
    });

    useEffect(() => {
        if (component) {
            setName(component.name ?? "");
            setDescription(component.description ?? "");
        }
    }, [component]);

    const updateMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/assessments/library/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["library-component", params.id] });
            queryClient.invalidateQueries({ queryKey: ["component-library"] });
            router.push("/assessments/admin/components");
        },
        onError: (err: Error) => setError(err.message)
    });

    if (isLoading || !component) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/assessments/admin/components" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Edit Library Component</h1>
                    <p className="text-sm text-gray-500">Update component details</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Type:</span>
                    <Badge variant="outline">{component.componentType}</Badge>
                    <span className="text-sm text-gray-500">Level:</span>
                    <Badge variant="outline">{component.targetLevel}</Badge>
                    {component.competency && (
                        <>
                            <span className="text-sm text-gray-500">Competency:</span>
                            <Badge variant="outline">{component.competency.name}</Badge>
                        </>
                    )}
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-3">
                    <Button
                        onClick={() => updateMutation.mutate()}
                        disabled={updateMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/assessments/admin/components/library/${params.id}/questions`}>
                            <Box className="w-4 h-4 mr-2" />
                            Manage Questions
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

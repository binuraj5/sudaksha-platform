"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, BookOpen, CheckCircle, Circle, Loader2, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CurriculumNode {
    id: string;
    type: string;
    name: string;
    code: string;
    description?: string;
    parentId?: string;
    _count: { children: number; activities: number };
}

export function StudentCurriculumView({ clientId, memberId }: { clientId: string; memberId?: string }) {
    const [nodes, setNodes] = useState<CurriculumNode[]>([]);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCurriculum() {
            try {
                const res = await fetch(`/api/clients/${clientId}/curriculum`);
                if (res.ok) {
                    const data = await res.json();
                    setNodes(Array.isArray(data) ? data : data.nodes || []);
                }
            } catch (e) {
                console.error("Failed to fetch curriculum", e);
            } finally {
                setLoading(false);
            }
        }
        fetchCurriculum();
    }, [clientId]);

    const toggleExpand = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

    const renderNode = (node: CurriculumNode, depth: number) => {
        const children = nodes.filter((n) => n.parentId === node.id);
        const isExpanded = expanded[node.id];

        return (
            <div key={node.id} className="space-y-1">
                <div
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 ${depth > 0 ? "ml-6" : ""}`}
                >
                    <button
                        onClick={() => children.length > 0 && toggleExpand(node.id)}
                        className="p-0.5 hover:bg-gray-200 rounded"
                    >
                        {children.length > 0 ? (
                            isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                            )
                        ) : (
                            <span className="w-4 inline-block" />
                        )}
                    </button>

                    <div className="flex-1 flex items-center gap-2">
                        {node.type === "PROGRAM" || node.type === "DEGREE" ? (
                            <GraduationCap className="h-4 w-4 text-indigo-600 shrink-0" />
                        ) : (
                            <BookOpen className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                        <span className="font-medium text-sm">{node.name}</span>
                        <span className="text-xs text-gray-400 font-mono">{node.code}</span>
                        {node._count.activities > 0 && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                {node._count.activities} course{node._count.activities !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>

                {isExpanded && children.length > 0 && (
                    <div className="border-l-2 border-gray-100 ml-4 pl-2">
                        {children.map((c) => renderNode(c, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const roots = nodes.filter((n) => !n.parentId);

    if (roots.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No curriculum structure defined yet.</p>
                    <p className="text-sm mt-1">Your institution will add programs and subjects soon.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-1">
                    {roots.map((node) => renderNode(node, 0))}
                </div>
            </CardContent>
        </Card>
    );
}

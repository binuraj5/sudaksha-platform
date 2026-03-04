"use client";

import { useState, useEffect } from "react";
import {
    ChevronRight,
    ChevronDown,
    GraduationCap,
    Calendar,
    BookOpen,
    Plus,
    MoreVertical,
    Trash2,
    Edit2,
    Loader2,
    Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { CreateNodeDialog } from "./CreateNodeDialog";

interface CurriculumNode {
    id: string;
    type: 'PROGRAM' | 'DEGREE' | 'SEMESTER' | 'DEPARTMENT' | 'SUBJECT' | 'TOPIC';
    name: string;
    code: string;
    description?: string;
    parentId?: string;
    _count: {
        children: number;
        activities: number;
    }
}

export function CurriculumManager({ clientId, refreshKey }: { clientId: string; refreshKey?: number }) {
    const [nodes, setNodes] = useState<CurriculumNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const fetchNodes = async (parentId: string | null = null) => {
        try {
            const res = await fetch(`/api/clients/${clientId}/curriculum?parentId=${parentId || 'null'}`);
            if (res.ok) {
                const data = await res.ok ? await res.json() : [];
                if (parentId) {
                    // Update existing nodes with children
                    setNodes(prev => {
                        const others = prev.filter(n => n.parentId !== parentId);
                        return [...others, ...data];
                    });
                } else {
                    setNodes(data);
                }
            }
        } catch (e) {
            toast.error("Failed to fetch curriculum");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNodes();
    }, [clientId, refreshKey]);

    const toggleNode = (nodeId: string) => {
        setExpanded(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
        if (!expanded[nodeId]) {
            fetchNodes(nodeId);
        }
    };

    const handleDelete = async (nodeId: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;

        try {
            const res = await fetch(`/api/clients/${clientId}/curriculum/${nodeId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Node deleted");
                fetchNodes(); // Refresh root level for simplicity or filter local state
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to delete");
            }
        } catch (e) {
            toast.error("Error deleting node");
        }
    };

    const renderIcon = (type: string) => {
        switch (type) {
            case 'PROGRAM':
            case 'DEGREE': return <GraduationCap className="h-4 w-4 text-indigo-600" />;
            case 'SEMESTER': return <Calendar className="h-4 w-4 text-blue-500" />;
            case 'DEPARTMENT': return <Building className="h-4 w-4 text-orange-500" />;
            case 'SUBJECT': return <BookOpen className="h-4 w-4 text-green-500" />;
            case 'TOPIC': return <Plus className="h-4 w-4 text-gray-500" />; // Placeholder or FileText
            default: return null;
        }
    };

    const NodeRow = ({ node, depth = 0 }: { node: CurriculumNode, depth?: number }) => {
        const isExpanded = expanded[node.id];
        const children = nodes.filter(n => n.parentId === node.id);

        return (
            <div className="space-y-1">
                <div
                    className={`flex items-center group hover:bg-gray-50 p-2 rounded-md border border-transparent hover:border-gray-200 transition-colors ${depth > 0 ? 'ml-6' : ''}`}
                >
                    <button
                        onClick={() => node._count.children > 0 && toggleNode(node.id)}
                        className={`p-1 hover:bg-gray-200 rounded mr-1 transition-opacity ${node._count.children === 0 ? 'opacity-0 cursor-default' : ''}`}
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    </button>

                    <div className="mr-3 p-1.5 bg-white rounded shadow-sm border border-gray-100">
                        {renderIcon(node.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900 truncate">{node.name}</span>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">{node.code}</span>
                        </div>
                        {node.description && <p className="text-xs text-gray-500 truncate">{node.description}</p>}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        <div className="text-[10px] text-gray-400 flex gap-2">
                            {node.type !== 'TOPIC' && <span>{node._count.children} Children</span>}
                            <span>{node._count.activities} Linked</span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                {node.type !== 'TOPIC' && (
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Logic to open create dialog with parentId */ }}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Child
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(node.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {isExpanded && children.length > 0 && (
                    <div className="border-l-2 border-gray-100 ml-4 pl-2">
                        {children.map(child => <NodeRow key={child.id} node={child} depth={depth + 1} />)}
                    </div>
                )}

                {isExpanded && children.length === 0 && node._count.children > 0 && (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-300" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="shadow-none border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 py-4">
                <div>
                    <CardTitle className="text-lg">Curriculum Structure</CardTitle>
                    <CardDescription>Manage programs, departments, and academic levels.</CardDescription>
                </div>
                <CreateNodeDialog clientId={clientId} onSuccess={() => fetchNodes()} />
            </CardHeader>
            <CardContent className="p-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : nodes.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl border-gray-100">
                        <div className="h-12 w-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">No curriculum nodes</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">Start by adding a Degree or a root Subject to build your structure.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {nodes.filter(n => !n.parentId).map(node => (
                            <NodeRow key={node.id} node={node} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

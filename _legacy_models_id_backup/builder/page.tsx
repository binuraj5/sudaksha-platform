"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Search, Plus, Trash2, ArrowUp, ArrowDown, Settings,
    Save, ArrowLeft, Clock, AlertCircle, GripVertical
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Types
type ComponentParams = {
    id: string; // The relationship ID usually, but here maybe componentId? 
    // Wait, the API returns the model with components included. 
    // The relationship is AssessmentModelComponent.
    componentId: string;
    weightage: number;
    order: number;
    isRequired: boolean;
    component: {
        id: string;
        name: string;
        category: string;
        duration: number;
        totalQuestions: number;
    };
};

function SortableItem({ id, item, index, onRemove }: { id: string, item: any, index: number, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
        >
            <div
                {...attributes}
                {...listeners}
                className="flex flex-col items-center justify-center space-y-1 text-gray-300 cursor-move hover:text-gray-500"
            >
                <GripVertical className="w-5 h-5" />
            </div>

            <div className="flex flex-col items-center justify-center space-y-1 text-gray-300">
                <span className="text-xs font-mono font-bold bg-gray-100 px-1.5 rounded">{index + 1}</span>
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{item.component.name}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{item.component.category}</span>
                    <span>• {item.component.duration} mins</span>
                    <span>• {item.component.totalQuestions} questions</span>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    <span className="text-xs font-medium">Weight:</span>
                    <span className="font-bold text-gray-900">{item.weightage}x</span>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onRemove(item.componentId)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default function ModelBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState<any[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch Model Data
    const { data: model, isLoading: isModelLoading } = useQuery({
        queryKey: ["assessment-model", params?.id],
        queryFn: async () => {
            if (!params?.id) return null;
            const res = await fetch(`/api/admin/assessment-models/${params.id}`);
            if (!res.ok) throw new Error("Failed to fetch model");
            const data = await res.json();
            setItems(data?.components || []); // Init local state
            return data;
        },
        enabled: !!params?.id
    });

    // Update items when model changes (e.g. from invalidation)
    useEffect(() => {
        if (model?.components) {
            setItems(model.components);
        }
    }, [model]);

    // Fetch Available Components
    const { data: availableComponents, isLoading: isLibraryLoading } = useQuery({
        queryKey: ["assessment-components", searchQuery],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (searchQuery) params.append("search", searchQuery);
            const res = await fetch(`/api/admin/assessment-components?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch components");
            return res.json();
        }
    });

    const addComponent = useMutation({
        mutationFn: async (componentId: string) => {
            const currentMaxOrder = items.reduce((max: number, c: any) => Math.max(max, c.order), 0) || 0;
            const res = await fetch(`/api/admin/assessment-models/${params.id}/components`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    componentId,
                    order: currentMaxOrder + 1,
                    weightage: 1,
                }),
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment-model", params?.id] });
        },
    });

    const removeComponent = useMutation({
        mutationFn: async (componentId: string) => {
            const res = await fetch(`/api/admin/assessment-models/${params.id}/components/${componentId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment-model", params?.id] });
        }
    });

    const updateOrder = useMutation({
        mutationFn: async (newComponents: any[]) => {
            await fetch(`/api/admin/assessment-models/${params.id}/reorder`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    components: newComponents.map((c, i) => ({
                        componentId: c.componentId,
                        order: i + 1
                    }))
                }),
            });
        },
        onSuccess: () => {
            // queryClient.invalidateQueries({ queryKey: ["assessment-model", params?.id] });
            // Don't invalidate immediately to prevent jump, relying on local optimistic update
        }
    });

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i: any) => i.componentId === active.id);
                const newIndex = items.findIndex((i: any) => i.componentId === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Trigger API update
                updateOrder.mutate(newOrder);

                return newOrder;
            });
        }
    };

    // Show loading if still loading or if params aren't ready yet (to avoid premature error)
    if (isModelLoading || !params?.id) return <div className="p-12 text-center">Loading builder...</div>;
    if (!model) return <div className="p-12 text-center text-red-600">Failed to load model data. Please try again.</div>;

    const addedComponentIds = new Set(items.map((c: any) => c.componentId));

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/assessments/admin/models" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{model.name}</h1>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {model.totalDuration}m estimated</span>
                            <span>•</span>
                            <span>{items.length} Components</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/assessments/admin/models/${model.id}/settings`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Settings
                    </Link>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm">
                        Publish Model
                    </button>
                </div>
            </header>

            {/* Builder Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Model Structure */}
                <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold text-gray-900">Assessment Flow</h2>
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Sequence & Weightage</span>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-white">
                                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 font-medium">No components added yet</p>
                                <p className="text-sm text-gray-400">Select components from the library to build your model</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={items.map((i: any) => i.componentId)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {items.map((item: any, index: number) => (
                                            <SortableItem
                                                key={item.componentId}
                                                id={item.componentId}
                                                item={item}
                                                index={index}
                                                onRemove={(id) => removeComponent.mutate(id)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>

                {/* Right: Component Library */}
                <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Component Library</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search components..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {isLibraryLoading ? (
                            <div className="text-center py-8 text-gray-500 text-sm">Loading library...</div>
                        ) : availableComponents?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">No components found</div>
                        ) : (
                            availableComponents?.map((component: any) => {
                                const isAdded = addedComponentIds.has(component.id);
                                return (
                                    <div key={component.id} className={`p-3 rounded-lg border text-left transition-all ${isAdded ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-sm'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                {component.category}
                                            </span>
                                            {!isAdded && (
                                                <button
                                                    onClick={() => addComponent.mutate(component.id)}
                                                    disabled={addComponent.isPending}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isAdded && <span className="text-xs text-green-600 font-medium">Added</span>}
                                        </div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{component.name}</h4>
                                        <div className="flex items-center text-xs text-gray-500 gap-2">
                                            <span>{component.duration}m</span>
                                            <span>•</span>
                                            <span>{component._count?.questions || 0} Qs</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

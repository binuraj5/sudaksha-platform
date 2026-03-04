"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Library, Puzzle, Plus, Loader2, Target, X, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getComponentLibrary, createAssessmentFromComponents } from "@/app/actions/assessments/component-library";

export function ComponentLibraryBrowser({ basePath, clientId }: { basePath: string, clientId?: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [libraries, setLibraries] = useState<any[]>([]);
    const [selectedComponents, setSelectedComponents] = useState<{ id: string; name: string; weight: number; type: string }[]>([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [targetLevel, setTargetLevel] = useState("MIDDLE");

    useEffect(() => {
        async function fetchLibs() {
            setLoading(true);
            const res = await getComponentLibrary(clientId);
            if (res.error) {
                toast.error(res.error);
            } else if (res.data) {
                setLibraries(res.data);
            }
            setLoading(false);
        }
        fetchLibs();
    }, [clientId]);

    const handleAdd = (comp: any) => {
        if (selectedComponents.find(c => c.id === comp.id)) {
            toast.info("Component already added to assembly draft.");
            return;
        }
        setSelectedComponents(prev => [...prev, { id: comp.id, name: comp.name, weight: 1.0, type: comp.componentType }]);
        toast.success(`Selected: ${comp.name}`);
    };

    const handleRemove = (id: string) => {
        setSelectedComponents(prev => prev.filter(c => c.id !== id));
    };

    const handleProceed = async () => {
        if (selectedComponents.length === 0) return toast.error("Please add components to your assessment draft.");
        if (!name.trim()) return toast.error("Please provide an assessment name.");

        setCreating(true);
        const res = await createAssessmentFromComponents({
            name,
            description,
            clientId: clientId || "",
            targetLevel,
            components: selectedComponents.map(c => ({ id: c.id, weight: c.weight }))
        });
        setCreating(false);

        if (res.error) {
            toast.error(res.error);
        } else if (res.data) {
            toast.success("Component-based Assessment created successfully!");
            const parts = basePath.split("/create");
            router.push(`${parts[0]}/${res.data.id}/questions`);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <Library className="w-6 h-6 text-amber-500" />
                        Component Library
                    </h1>
                    <p className="text-gray-500">Assemble an assessment using pre-built and validated component blocks.</p>
                </div>
                <Button variant="outline" onClick={() => router.push(basePath)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
                </Button>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="flex flex-col border-amber-100 shadow-sm">
                        <CardHeader className="bg-amber-50/50 pb-4 border-b border-amber-100">
                            <CardTitle>Available Libraries</CardTitle>
                            <CardDescription>Browse existing components scoped to your organization or global tenant scope.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex justify-center items-center py-24">
                                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                                </div>
                            ) : libraries.length === 0 ? (
                                <div className="text-center space-y-3 opacity-50 py-24">
                                    <Puzzle className="w-12 h-12 mx-auto text-gray-400" />
                                    <p className="text-sm font-medium">No components available in this scope.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                    {libraries.map(comp => (
                                        <div key={comp.id} className="p-4 hover:bg-amber-50/30 transition-colors flex justify-between items-start group">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm text-gray-900">{comp.name}</h3>
                                                    {comp.publishedToGlobal && (
                                                        <Badge variant="outline" className="text-[10px] py-0 text-indigo-600 border-indigo-200 bg-indigo-50">Global</Badge>
                                                    )}
                                                    <Badge variant="secondary" className="text-[10px] py-0 tracking-wider font-medium">{comp.componentType}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2 max-w-xl">{comp.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Target className="w-3 h-3" /> {comp.competency?.name || 'Unmapped'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 text-amber-400" /> {comp.rating ? Number(comp.rating).toFixed(1) : 'New'}
                                                    </span>
                                                    <span>{comp.usageCount} uses</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 text-amber-700 border-amber-200 hover:bg-amber-50"
                                                onClick={() => handleAdd(comp)}
                                            >
                                                <Plus className="w-3 h-3" /> Add
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-6 shadow-sm border-gray-200">
                        <CardHeader className="bg-gray-50/50 pb-4 border-b">
                            <CardTitle>Draft Assembly</CardTitle>
                            <CardDescription>Configure your assessment layout.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold uppercase text-gray-500">General Settings</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Assessment Name" className="h-9 text-sm" />
                                <Select value={targetLevel} onValueChange={setTargetLevel}>
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Target Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="JUNIOR">Junior / Beginner</SelectItem>
                                        <SelectItem value="MIDDLE">Middle / Intermediate</SelectItem>
                                        <SelectItem value="SENIOR">Senior / Advanced</SelectItem>
                                        <SelectItem value="EXPERT">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..." className="text-sm min-h-[60px] resize-none" />
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label className="text-xs font-semibold uppercase text-gray-500 flex justify-between">
                                    <span>Added Components</span>
                                    <span>{selectedComponents.length} items</span>
                                </Label>

                                {selectedComponents.length === 0 ? (
                                    <div className="p-4 border border-dashed rounded-md bg-gray-50 text-center text-gray-400 text-xs italic">
                                        No components added yet. Browse the library to construct your assessment.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {selectedComponents.map((comp, idx) => (
                                            <div key={comp.id} className="p-2 border rounded-md text-sm bg-white border-amber-100 flex items-center gap-2 shadow-sm relative group">
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <p className="font-medium text-gray-800 text-xs truncate">{++idx}. {comp.name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{comp.type}</p>
                                                </div>
                                                <button
                                                    className="absolute right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemove(comp.id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-5 mt-6">
                                <Button
                                    className="w-full bg-amber-600 hover:bg-amber-700 shadow-sm"
                                    onClick={handleProceed}
                                    disabled={creating || selectedComponents.length === 0 || !name.trim()}
                                >
                                    {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Build Assessment <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

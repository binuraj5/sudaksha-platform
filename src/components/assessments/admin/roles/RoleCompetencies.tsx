"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Sparkles } from "lucide-react";
import { AICompetencyGenerator } from "./AICompetencyGenerator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { GeneratedCompetency } from "@/lib/actions/ai-competency";

interface RoleCompetenciesProps {
    roleData: any;
    competencies: GeneratedCompetency[];
    setCompetencies: (competencies: GeneratedCompetency[]) => void;
}

export function RoleCompetencies({ roleData, competencies, setCompetencies }: RoleCompetenciesProps) {
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
    const [manualCompetency, setManualCompetency] = useState({
        name: "",
        category: "TECHNICAL" as const,
        description: "",
        indicatorText: "",
    });

    const handleAddCompetencies = (newCompetencies: GeneratedCompetency[]) => {
        // Avoid duplicates based on name
        const uniqueNew = newCompetencies.filter(
            nc => !competencies.some(c => c.name.toLowerCase() === nc.name.toLowerCase())
        );
        setCompetencies([...competencies, ...uniqueNew]);
        setIsAiDialogOpen(false);
    };

    const handleAddManualCompetency = () => {
        if (!manualCompetency.name.trim() || !manualCompetency.description.trim()) {
            alert("Please fill in name and description");
            return;
        }

        const newCompetency: GeneratedCompetency = {
            name: manualCompetency.name.trim(),
            category: manualCompetency.category,
            description: manualCompetency.description.trim(),
            indicators: manualCompetency.indicatorText.trim()
                ? [{
                    level: roleData.overallLevel,
                    text: manualCompetency.indicatorText.trim(),
                    type: "POSITIVE" as const
                }]
                : []
        };

        // Check for duplicates
        if (competencies.some(c => c.name.toLowerCase() === newCompetency.name.toLowerCase())) {
            alert("A competency with this name already exists");
            return;
        }

        setCompetencies([...competencies, newCompetency]);
        setIsManualDialogOpen(false);
        setManualCompetency({
            name: "",
            category: "TECHNICAL",
            description: "",
            indicatorText: "",
        });
    };

    const removeCompetency = (index: number) => {
        const newDocs = [...competencies];
        newDocs.splice(index, 1);
        setCompetencies(newDocs);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">Competency Profile</h3>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsAiDialogOpen(true)}>
                        <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                        Generate with AI
                    </Button>
                    <Button variant="secondary" onClick={() => setIsManualDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Manually
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Competency Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Target Level Indicators</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {competencies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                                    No competencies added yet. Click "Generate with AI" or "Add Manually" to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            competencies.map((comp, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">
                                        <div>{comp.name}</div>
                                        <div className="text-xs text-slate-500 line-clamp-1">{comp.description}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{comp.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm space-y-2">
                                            {/* Positive Indicators */}
                                            {comp.indicators
                                                .filter((i: any) => i.level?.toUpperCase() === roleData.overallLevel?.toUpperCase() && i.type?.toUpperCase() === "POSITIVE")
                                                .slice(0, 3)
                                                .map((ind, i) => (
                                                    <div key={`pos-${i}`} className="flex items-start gap-1">
                                                        <span className="text-green-600 font-bold">•</span>
                                                        <span className="line-clamp-1 text-slate-600" title={ind.text}>{ind.text}</span>
                                                    </div>
                                                ))}

                                            {/* Negative Indicators */}
                                            {comp.indicators
                                                .filter((i: any) => i.level?.toUpperCase() === roleData.overallLevel?.toUpperCase() && i.type?.toUpperCase() === "NEGATIVE")
                                                .slice(0, 3)
                                                .map((ind, i) => (
                                                    <div key={`neg-${i}`} className="flex items-start gap-1">
                                                        <span className="text-red-500 font-bold">•</span>
                                                        <span className="line-clamp-1 text-slate-400 italic" title={ind.text}>{ind.text}</span>
                                                    </div>
                                                ))}

                                            {comp.indicators.filter((i: any) => i.level?.toUpperCase() === roleData.overallLevel?.toUpperCase()).length === 0 && (
                                                <span className="text-xs text-slate-400 italic">No specific indicators for {roleData.overallLevel}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => removeCompetency(idx)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* AI Dialog */}
            <AICompetencyGenerator
                isOpen={isAiDialogOpen}
                onClose={() => setIsAiDialogOpen(false)}
                onSelect={handleAddCompetencies}
                roleContext={{
                    name: roleData.name,
                    description: roleData.description,
                    level: roleData.overallLevel,
                    industry: [] // Pass selected industries from parent if available, or assume general
                }}
            />

            {/* Manual Add Dialog */}
            <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Competency Manually</DialogTitle>
                        <DialogDescription>
                            Define a new competency for the {roleData.name} role.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Competency Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., React Development, Critical Thinking"
                                value={manualCompetency.name}
                                onChange={(e) => setManualCompetency({ ...manualCompetency, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={manualCompetency.category}
                                onValueChange={(value: any) => setManualCompetency({ ...manualCompetency, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                                    <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                                    <SelectItem value="COGNITIVE">Cognitive</SelectItem>
                                    <SelectItem value="DOMAIN_SPECIFIC">Domain Specific</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what this competency means and why it's important..."
                                value={manualCompetency.description}
                                onChange={(e) => setManualCompetency({ ...manualCompetency, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="indicator">
                                Indicator (Optional)
                                <span className="text-xs text-slate-500 ml-2">
                                    For {roleData.overallLevel} level
                                </span>
                            </Label>
                            <Textarea
                                id="indicator"
                                placeholder="e.g., Can build responsive web applications using React hooks..."
                                value={manualCompetency.indicatorText}
                                onChange={(e) => setManualCompetency({ ...manualCompetency, indicatorText: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsManualDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddManualCompetency} className="bg-blue-600 hover:bg-blue-700">
                            Add Competency
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

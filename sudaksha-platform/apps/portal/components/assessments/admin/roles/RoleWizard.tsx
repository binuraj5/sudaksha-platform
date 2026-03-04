
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Check, ArrowRight, ArrowLeft, Save, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ProficiencyLevel } from "@sudaksha/db-core";

interface SelectedCompetency {
    competencyId: string;
    name: string;
    requiredLevel: ProficiencyLevel;
    weight: number;
    isCritical: boolean;
}

export const RoleWizard: React.FC = () => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [overallLevel, setOverallLevel] = useState<ProficiencyLevel>('JUNIOR');
    const [selectedCompetencies, setSelectedCompetencies] = useState<SelectedCompetency[]>([]);
    const [availableCompetencies, setAvailableCompetencies] = useState<any[]>([]); // Mocked or fetched
    const [saving, setSaving] = useState(false);

    // Mock fetching competencies
    useEffect(() => {
        setAvailableCompetencies([
            { id: '1', name: 'React Development', category: 'TECHNICAL' },
            { id: '2', name: 'System Design', category: 'TECHNICAL' },
            { id: '3', name: 'Public Speaking', category: 'BEHAVIORAL' },
        ]);
    }, []);

    const addCompetency = (competencyId: string) => {
        const comp = availableCompetencies.find(c => c.id === competencyId);
        if (comp && !selectedCompetencies.find(sc => sc.competencyId === competencyId)) {
            setSelectedCompetencies([...selectedCompetencies, {
                competencyId,
                name: comp.name,
                requiredLevel: 'JUNIOR',
                weight: 1.0,
                isCritical: false
            }]);
        }
    };

    const updateSelectedCompetency = (id: string, updates: Partial<SelectedCompetency>) => {
        setSelectedCompetencies(selectedCompetencies.map(sc =>
            sc.competencyId === id ? { ...sc, ...updates } : sc
        ));
    };

    const removeCompetency = (id: string) => {
        setSelectedCompetencies(selectedCompetencies.filter(sc => sc.competencyId !== id));
    };

    const handleSave = async (submitForApproval: boolean = false) => {
        setSaving(true);
        try {
            console.log("Saving Role:", { name, description, overallLevel, selectedCompetencies, submitForApproval });
            toast.success("Role saved successfully");
        } catch (error) {
            toast.error("Failed to save role");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Role Wizard</h1>
                    <p className="text-gray-500">Step {step} of 3: {
                        step === 1 ? 'Basic Details' :
                            step === 2 ? 'Competency Mapping' : 'Review & Submit'
                    }</p>
                </div>
                <div className="flex gap-2">
                    {step > 1 && (
                        <Button variant="ghost" onClick={() => setStep(step - 1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    )}
                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)} className="bg-blue-600 hover:bg-blue-700">
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={() => handleSave(true)} className="bg-green-600 hover:bg-green-700">
                            <Check className="mr-2 h-4 w-4" /> Finalize Role
                        </Button>
                    )}
                </div>
            </div>

            {/* Step 1: Basic Details */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Role Identifier</CardTitle>
                        <CardDescription>Basic information about the job role.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Role Name</Label>
                            <Input placeholder="e.g. Senior Frontend Engineer" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Typical Level</Label>
                            <Select value={overallLevel} onValueChange={(val) => setOverallLevel(val as ProficiencyLevel)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="JUNIOR">Junior / Entry Level</SelectItem>
                                    <SelectItem value="MIDDLE">Mid Level</SelectItem>
                                    <SelectItem value="SENIOR">Senior Level</SelectItem>
                                    <SelectItem value="EXPERT">Expert / Architect</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Role Description</Label>
                            <Textarea placeholder="Describe the core purpose and expectations of this role..." value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Competency Mapping */}
            {step === 2 && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Competencies</CardTitle>
                            <CardDescription>Choose which skills are required for this role.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Select onValueChange={addCompetency}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Search and add competencies..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCompetencies.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name} ({c.category})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Mapped Competencies</h3>
                        {selectedCompetencies.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                                <Info className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-gray-500">No competencies added yet. Start by selecting one above.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {selectedCompetencies.map(sc => (
                                    <Card key={sc.competencyId}>
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg">{sc.name}</h4>
                                                    <Badge variant="outline">Requirement</Badge>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeCompetency(sc.competencyId)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Required Level</Label>
                                                    <Select value={sc.requiredLevel} onValueChange={(v) => updateSelectedCompetency(sc.competencyId, { requiredLevel: v as ProficiencyLevel })}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="JUNIOR">Junior (L1)</SelectItem>
                                                            <SelectItem value="MIDDLE">Middle (L2)</SelectItem>
                                                            <SelectItem value="SENIOR">Senior (L3)</SelectItem>
                                                            <SelectItem value="EXPERT">Expert (L4)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Weight (0.0 - 1.0)</Label>
                                                    <Input type="number" step="0.1" min="0" max="1" value={sc.weight} onChange={(e) => updateSelectedCompetency(sc.competencyId, { weight: parseFloat(e.target.value) })} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
                <div className="space-y-6">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader>
                            <CardTitle className="text-blue-900">Review Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-blue-800">Role</h4>
                                <p className="text-blue-700">{name} ({overallLevel})</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-800">Total Competencies</h4>
                                <p className="text-blue-700">{selectedCompetencies.length} skills mapped</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        {selectedCompetencies.map(sc => (
                            <div key={sc.competencyId} className="flex justify-between p-3 bg-white border rounded shadow-sm">
                                <span>{sc.name}</span>
                                <Badge>{sc.requiredLevel}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

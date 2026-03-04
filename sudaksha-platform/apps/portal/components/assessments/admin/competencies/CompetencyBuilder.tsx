
"use client";

import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, CheckCircle, AlertCircle, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Indicator {
    text: string;
    level: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT';
    type: 'POSITIVE' | 'NEGATIVE';
}

export const CompetencyBuilder: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('TECHNICAL');
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [saving, setSaving] = useState(false);

    const addIndicator = (level: Indicator['level'], type: Indicator['type']) => {
        setIndicators([...indicators, { text: '', level, type }]);
    };

    const updateIndicator = (index: number, text: string) => {
        const newIndicators = [...indicators];
        newIndicators[index].text = text;
        setIndicators(newIndicators);
    };

    const removeIndicator = (index: number) => {
        setIndicators(indicators.filter((_, i) => i !== index));
    };

    const handleSave = async (submitForApproval: boolean = false) => {
        if (!name || !description) {
            toast.error("Please fill in basic competency details");
            return;
        }

        setSaving(true);
        try {
            // API call would go here
            console.log("Saving competency:", { name, description, category, indicators, submitForApproval });
            toast.success("Competency saved as draft");
        } catch (error) {
            toast.error("Failed to save competency");
        } finally {
            setSaving(false);
        }
    };

    const renderLevelSection = (level: Indicator['level']) => {
        const levelIndicators = indicators.filter(i => i.level === level);
        const positives = levelIndicators.filter(i => i.type === 'POSITIVE');
        const negatives = levelIndicators.filter(i => i.type === 'NEGATIVE');

        return (
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-600 h-5 w-5" />
                            <h4 className="font-semibold text-gray-900">Positive Indicators (Success Behaviors)</h4>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => addIndicator(level, 'POSITIVE')}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </div>
                    {positives.map((ind, idx) => {
                        const globalIdx = indicators.indexOf(ind);
                        return (
                            <div key={globalIdx} className="flex gap-2">
                                <Input
                                    placeholder="Describe a behavior that demonstrates success at this level..."
                                    value={ind.text}
                                    onChange={(e) => updateIndicator(globalIdx, e.target.value)}
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeIndicator(globalIdx)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="text-red-600 h-5 w-5" />
                            <h4 className="font-semibold text-gray-900">Negative Indicators (Red Flags)</h4>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => addIndicator(level, 'NEGATIVE')}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </div>
                    {negatives.map((ind, idx) => {
                        const globalIdx = indicators.indexOf(ind);
                        return (
                            <div key={globalIdx} className="flex gap-2">
                                <Input
                                    placeholder="Describe a red flag or anti-pattern at this level..."
                                    value={ind.text}
                                    onChange={(e) => updateIndicator(globalIdx, e.target.value)}
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeIndicator(globalIdx)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Competency Builder</h1>
                    <p className="text-gray-500">Define your competency and level-based behavioral indicators.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                        Save Draft
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave(true)} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        Submit for Approval
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Give your competency a name and categorization.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Competency Name</Label>
                            <Input placeholder="e.g. React Development, Leadership, etc." value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
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
                    </div>
                    <div className="space-y-2">
                        <Label>Detailed Description</Label>
                        <Textarea placeholder="What does this competency represent in practice?" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Proficiency Indicators</h3>
                    <div className="flex gap-2">
                        <Badge variant="secondary">4 Levels Required</Badge>
                    </div>
                </div>

                <Tabs defaultValue="JUNIOR" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="JUNIOR">Junior / L1</TabsTrigger>
                        <TabsTrigger value="MIDDLE">Middle / L2</TabsTrigger>
                        <TabsTrigger value="SENIOR">Senior / L3</TabsTrigger>
                        <TabsTrigger value="EXPERT">Expert / L4</TabsTrigger>
                    </TabsList>

                    <Card className="mt-4">
                        <CardContent className="pt-6">
                            <TabsContent value="JUNIOR">{renderLevelSection('JUNIOR')}</TabsContent>
                            <TabsContent value="MIDDLE">{renderLevelSection('MIDDLE')}</TabsContent>
                            <TabsContent value="SENIOR">{renderLevelSection('SENIOR')}</TabsContent>
                            <TabsContent value="EXPERT">{renderLevelSection('EXPERT')}</TabsContent>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </div>
    );
};

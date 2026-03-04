
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Building2, Users, Calendar, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const BulkAssignmentForm: React.FC = () => {
    const [targetType, setTargetType] = useState<'ORG_UNIT' | 'INDIVIDUAL'>('ORG_UNIT');
    const [targetId, setTargetId] = useState('');
    const [modelId, setModelId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isMandatory, setIsMandatory] = useState(true);
    const [loading, setLoading] = useState(false);

    // Mock data
    const orgUnits = [
        { id: 'ou1', name: 'Engineering' },
        { id: 'ou2', name: 'Product Management' },
    ];
    const models = [
        { id: 'm1', name: 'Senior Frontend Assessment (Global)' },
        { id: 'm2', name: 'Acme Technical Baseline (Draft)' },
    ];

    const handleSubmit = async () => {
        if (!targetId || !modelId) {
            toast.error("Please select a target and an assessment model");
            return;
        }

        setLoading(true);
        try {
            console.log("Assigning assessment:", { targetType, targetId, modelId, dueDate, isMandatory });
            toast.success("Assessments assigned successfully");
        } catch (error) {
            toast.error("Failed to assign assessments");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Bulk Assignment</h1>
                <p className="text-gray-500">Deploy assessments to multiple members at once.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Assignment Settings</CardTitle>
                    <CardDescription>Configure who receives the assessment and what the parameters are.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Label>Who should receive this?</Label>
                        <div className="flex gap-4">
                            <Button
                                variant={targetType === 'ORG_UNIT' ? 'default' : 'outline'}
                                className="flex-1 py-8"
                                onClick={() => setTargetType('ORG_UNIT')}
                            >
                                <div className="text-center">
                                    <Building2 className="mx-auto h-6 w-6 mb-2" />
                                    <span>By Organization Unit</span>
                                </div>
                            </Button>
                            <Button
                                variant={targetType === 'INDIVIDUAL' ? 'default' : 'outline'}
                                className="flex-1 py-8"
                                onClick={() => setTargetType('INDIVIDUAL')}
                            >
                                <div className="text-center">
                                    <Users className="mx-auto h-6 w-6 mb-2" />
                                    <span>Individual Members</span>
                                </div>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{targetType === 'ORG_UNIT' ? 'Select Organization Unit' : 'Select Member'}</Label>
                        <Select value={targetId} onValueChange={setTargetId}>
                            <SelectTrigger>
                                <SelectValue placeholder={`Select ${targetType === 'ORG_UNIT' ? 'Unit' : 'Member'}...`} />
                            </SelectTrigger>
                            <SelectContent>
                                {orgUnits.map(ou => (
                                    <SelectItem key={ou.id} value={ou.id}>{ou.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Select Assessment Model</Label>
                        <Select value={modelId} onValueChange={setModelId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Model..." />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Due Date (Optional)</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="date"
                                    className="pl-10"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border h-full mt-6">
                            <div className="space-y-0.5">
                                <Label>Mandatory</Label>
                                <p className="text-xs text-gray-500">Require completion by due date</p>
                            </div>
                            <Switch checked={isMandatory} onCheckedChange={setIsMandatory} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={loading}>
                    <Send className="mr-2 h-4 w-4" />
                    Deploy Assessments
                </Button>
            </div>

            {loading && (
                <div className="flex items-center justify-center p-8 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                    <CheckCircle2 className="mr-2 h-5 w-5 animate-pulse" />
                    Processing bulk assignments...
                </div>
            )}
        </div>
    );
};

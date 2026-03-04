
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Wand2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface AICompetencyGeneratorProps {
    onGenerated: (competency: any) => void;
}

export const AICompetencyGenerator: React.FC<AICompetencyGeneratorProps> = ({ onGenerated }) => {
    const [role, setRole] = useState('');
    const [industry, setIndustry] = useState('');
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!role || !industry) {
            toast.error("Please provide both Role and Industry");
            return;
        }

        setGenerating(true);
        try {
            // Mock API call
            await new Promise(r => setTimeout(r, 3000));

            const mockCompetency = {
                name: `Knowledge of ${role} in ${industry}`,
                description: `Core technical and behavioral standard for ${role} within the ${industry} sector.`,
                indicators: [
                    { level: 'JUNIOR', type: 'POSITIVE', text: 'Follows established documentation.' },
                    { level: 'JUNIOR', type: 'NEGATIVE', text: 'Disregards standard operating procedures.' },
                    { level: 'EXPERT', type: 'POSITIVE', text: 'Architects complex systems and mentors leads.' }
                ]
            };

            onGenerated(mockCompetency);
            toast.success("AI drafted your competency successfully!");
        } catch (error) {
            toast.error("Failed to generate competency");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-purple-600" />
                    AI Competency Drafter
                </CardTitle>
                <CardDescription>Generate a complete competency model covering 4 levels of proficiency.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Target Job Role</Label>
                        <Input
                            placeholder="e.g. Data Scientist, Sales Lead..."
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Industry / Sector</Label>
                        <Input
                            placeholder="e.g. Fintech, Healthcare..."
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                        />
                    </div>
                </div>
                <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleGenerate}
                    disabled={generating}
                >
                    {generating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            AI is researching industry standards...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Draft Competency with AI <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};

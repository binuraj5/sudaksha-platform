"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Target, Puzzle } from "lucide-react";
import { cn } from "@/lib/utils";

type AssessmentCreationType = 'role' | 'competency' | 'component';

interface AssessmentTypeSelectorProps {
    onSelect: (type: AssessmentCreationType) => void;
    userRole: string;
    orgSlug?: string;
}

export function AssessmentTypeSelector({ onSelect, userRole, orgSlug }: AssessmentTypeSelectorProps) {
    const options = [
        {
            id: 'role' as AssessmentCreationType,
            title: 'Role Based',
            description: 'Select a role, auto-load its competency framework',
            icon: <UserCircle className="w-10 h-10 mb-4 text-indigo-500" />,
            allowed: true, // Generally allowed for everyone entering this screen
        },
        {
            id: 'competency' as AssessmentCreationType,
            title: 'Competency Based',
            description: 'Choose one or more competencies directly, role-agnostic',
            icon: <Target className="w-10 h-10 mb-4 text-emerald-500" />,
            allowed: true,
        },
        {
            id: 'component' as AssessmentCreationType,
            title: 'Components Library',
            description: 'Pick from pre-built question components in your library (org/dept/team)',
            icon: <Puzzle className="w-10 h-10 mb-4 text-amber-500" />,
            allowed: true,
        }
    ];

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
                    How would you like to create this assessment?
                </h2>
                <p className="text-gray-500 text-lg">Choose a template path to begin drafting your assessment engine.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {options.map((opt) => (
                    <div
                        key={opt.id}
                        className={cn(
                            "cursor-pointer transition-all h-full",
                            !opt.allowed ? "opacity-50 cursor-not-allowed" : ""
                        )}
                        onClick={() => {
                            if (opt.allowed) onSelect(opt.id);
                        }}
                    >
                        <Card
                            className={cn(
                                "h-full transition-all",
                                opt.allowed ? "hover:border-indigo-500 hover:shadow-md" : "hover:border-gray-200 hover:shadow-none bg-gray-50"
                            )}
                        >
                            <CardHeader className="text-center pb-2">
                                <div className="flex justify-center">{opt.icon}</div>
                                <CardTitle className="text-xl">{opt.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center text-gray-500">
                                <CardDescription className="text-sm font-medium">
                                    {opt.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}

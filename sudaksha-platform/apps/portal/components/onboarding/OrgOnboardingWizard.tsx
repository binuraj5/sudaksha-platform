"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    Circle,
    Building2,
    Users,
    BrainCircuit,
    Rocket,
    ChevronRight,
    ArrowRight,
    Settings,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    actionLabel: string;
    actionHref: string;
}

interface OrgOnboardingWizardProps {
    slug: string;
    orgName: string;
    steps: OnboardingStep[];
}

const STEP_ICONS: Record<string, React.ReactNode> = {
    profile: <Settings className="h-5 w-5" />,
    departments: <Building2 className="h-5 w-5" />,
    employees: <Users className="h-5 w-5" />,
    assessment: <BrainCircuit className="h-5 w-5" />,
};

export function OrgOnboardingWizard({ slug, orgName, steps }: OrgOnboardingWizardProps) {
    const router = useRouter();
    const [completing, setCompleting] = useState(false);

    const completedCount = steps.filter((s) => s.completed).length;
    const allDone = completedCount === steps.length;
    const progressPercent = Math.round((completedCount / steps.length) * 100);

    const handleComplete = async () => {
        setCompleting(true);
        try {
            const res = await fetch(`/api/org/${slug}/onboarding`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to complete onboarding");
            toast.success("Setup complete! Welcome to your dashboard.");
            router.push(`/assessments/org/${slug}/dashboard`);
        } catch {
            toast.error("Something went wrong. Please try again.");
            setCompleting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-2">
                    <Rocket className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Set up <span className="text-indigo-600">{orgName}</span>
                </h1>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Complete these steps to get your organisation ready for assessments and talent management.
                </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                    <span>{completedCount} of {steps.length} steps complete</span>
                    <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
                {steps.map((step, index) => (
                    <Card
                        key={step.id}
                        className={`border transition-all duration-200 ${
                            step.completed
                                ? "border-emerald-100 bg-emerald-50/40"
                                : "border-gray-100 bg-white hover:border-indigo-100"
                        }`}
                    >
                        <CardContent className="p-5 flex items-center gap-4">
                            {/* Step number / check */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                step.completed
                                    ? "bg-emerald-500 text-white"
                                    : "bg-indigo-50 text-indigo-600"
                            }`}>
                                {step.completed
                                    ? <CheckCircle2 className="h-5 w-5" />
                                    : (STEP_ICONS[step.id] ?? <Circle className="h-5 w-5" />)
                                }
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className={`font-semibold text-sm ${step.completed ? "text-emerald-700" : "text-gray-900"}`}>
                                        {step.title}
                                    </h3>
                                    {step.completed && (
                                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0 font-bold border-0">
                                            Done
                                        </Badge>
                                    )}
                                    {!step.completed && index === steps.findIndex((s) => !s.completed) && (
                                        <Badge className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0 font-bold border-0">
                                            Next
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">{step.description}</p>
                            </div>

                            {/* Action */}
                            {!step.completed && (
                                <Link href={step.actionHref} target="_blank" rel="noopener noreferrer">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-shrink-0 gap-1 text-xs font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                    >
                                        {step.actionLabel}
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            )}
                            {step.completed && (
                                <Link href={step.actionHref} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="ghost" className="flex-shrink-0 text-xs text-emerald-600 hover:text-emerald-700">
                                        View
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2">
                <Button
                    variant="ghost"
                    className="text-gray-500 text-sm"
                    onClick={handleComplete}
                    disabled={completing}
                >
                    Skip for now
                </Button>
                <Button
                    onClick={handleComplete}
                    disabled={completing}
                    className={`gap-2 font-semibold ${
                        allDone
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                >
                    {allDone ? "Launch Dashboard" : "Complete Setup"}
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

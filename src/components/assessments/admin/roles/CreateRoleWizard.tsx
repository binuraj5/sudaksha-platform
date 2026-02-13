"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { RoleBasicInfo } from "@/components/assessments/admin/roles/RoleBasicInfo";
import { RoleCompetencies } from "@/components/assessments/admin/roles/RoleCompetencies";

import { createRoleWithCompetencies } from "@/lib/actions/role-actions";
import { toast } from "sonner";


// Define the steps
const steps = [
    { id: 1, name: "Role Details" },
    { id: 2, name: "Competencies" },
    { id: 3, name: "Review & Save" },
];

interface RoleFormData {
    name: string;
    code: string;
    overallLevel: string;
    department: string;
    description: string;
}

export function CreateRoleWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<RoleFormData>({
        name: "",
        code: "",
        overallLevel: "JUNIOR",
        department: "",
        description: "",
    });
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

    // State for competencies (Step 2)
    const [competencies, setCompetencies] = useState<any[]>([]);

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };


    // ... inside component

    const handleSave = async () => {
        try {
            const res = await createRoleWithCompetencies(
                {
                    ...formData,
                    industries: selectedIndustries
                } as any,
                competencies
            );

            if (res.success) {
                toast.success("Role created successfully!");
                router.push("/assessments/admin/roles");
            } else {
                toast.error("Failed to create role: " + res.error);
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Stepper */}
            <div className="mb-8">
                <nav aria-label="Progress">
                    <ol role="list" className="flex items-center">
                        {steps.map((step, stepIdx) => (
                            <li key={step.name} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                                {step.id < currentStep ? (
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-blue-600" />
                                    </div>
                                ) : null}
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-900">
                                    {step.id < currentStep ? (
                                        <Check className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                        <span className={step.id === currentStep ? "text-white" : "text-gray-500"}>{step.id}</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                    {currentStep === 1 && "Start by defining the role"}
                    {currentStep === 2 && "Add Competencies"}
                    {currentStep === 3 && "Review and Save"}
                </h2>
            </div>

            <Card>
                <CardContent className="p-6">
                    {currentStep === 1 && (
                        <RoleBasicInfo
                            data={formData}
                            setData={setFormData}
                            selectedIndustries={selectedIndustries}
                            setSelectedIndustries={setSelectedIndustries}
                        />
                    )}
                    {currentStep === 2 && (
                        <RoleCompetencies
                            roleData={formData}
                            competencies={competencies}
                            setCompetencies={setCompetencies}
                        />
                    )}
                    {currentStep === 3 && (
                        <div className="text-center py-10">
                            <h3 className="text-lg font-medium text-slate-900">Ready to Create Role</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                You are about to create the role <strong>{formData.name}</strong> with {competencies.length} competencies.
                            </p>
                            {/* Review details can go here */}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                    Back
                </Button>
                {currentStep === 3 ? (
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                        Create Role
                    </Button>
                ) : (
                    <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                        Next Step <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Check, ArrowRight, ArrowLeft, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateRoleWizard } from "@/components/assessments/admin/roles/CreateRoleWizard";

export interface Role {
    id: string;
    name: string;
    description: string;
    competencies: { id: string; name: string }[];
}

export interface OnboardingWizardProps {
    /** Where to redirect after completing onboarding. Default: /assessments/individuals/dashboard */
    redirectTo?: string;
}

export function OnboardingWizard({ redirectTo = "/assessments/individuals/dashboard" }: OnboardingWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [currentRoleId, setCurrentRoleId] = useState<string>("");
    const [aspirationalRoleId, setAspirationalRoleId] = useState<string>("");
    const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);

    // For Role Request
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [tenantId, setTenantId] = useState<string>("");

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // First get profile to know the tenantId
                const profileRes = await fetch("/api/profile");
                let currentTenantId = "";

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    if (profileData.tenantId) {
                        currentTenantId = profileData.tenantId;
                        setTenantId(currentTenantId);
                    }
                }

                // Then fetch roles using the unified client scope API if B2B, else fallback for B2C
                const rolesEndpoint = currentTenantId
                    ? `/api/clients/${currentTenantId}/roles?scope=all`
                    : "/api/onboarding/roles";

                const rolesRes = await fetch(rolesEndpoint);

                if (rolesRes.ok) {
                    const data = await rolesRes.json();
                    setRoles(data);
                }
            } catch (error) {
                toast.error("Failed to load onboarding data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleNext = () => {
        if (step === 1 && !currentRoleId) return toast.error("Please select a current role");
        if (step === 2 && !aspirationalRoleId) return toast.error("Please select a career goal");
        if (step === 2 && aspirationalRoleId === currentRoleId) return toast.error("Aspirational role should be different from current role");

        if (step === 2) {
            const targetRole = roles.find(r => r.id === aspirationalRoleId);
            if (targetRole) {
                setSelectedCompetencies(targetRole.competencies.map(c => c.id));
            }
        }

        setStep(s => s + 1);
    };

    const handleBack = () => setStep(s => s - 1);

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/onboarding/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentRoleId,
                    aspirationalRoleId,
                    competencies: selectedCompetencies
                })
            });

            if (res.ok) {
                toast.success("Profile setup complete!");
                router.push(redirectTo);
            } else {
                toast.error("Failed to save profile");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center bg-gray-50 p-4">
            <div className="w-full max-w-2xl">
                <div className="mb-8">
                    <div className="flex justify-between mb-2 text-sm font-medium text-gray-500">
                        <span>Role</span>
                        <span>Goals</span>
                        <span>Skills</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                        <motion.div
                            className="h-full bg-indigo-600 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="border-none shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    {step === 1 && "What is your current role?"}
                                    {step === 2 && "Where do you want to be?"}
                                    {step === 3 && "What skills do you want to improve?"}
                                </CardTitle>
                                <CardDescription>
                                    {step === 1 && "Start by identifying where you are in your career journey."}
                                    {step === 2 && "Select your target role to generate a learning path."}
                                    {step === 3 && "We'll recommend assessments based on these competencies."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px] overflow-y-auto pr-2">
                                {(step === 1 || step === 2) && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {roles.map(role => (
                                            <div
                                                key={role.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${(step === 1 ? currentRoleId : aspirationalRoleId) === role.id
                                                    ? "border-indigo-600 bg-indigo-50"
                                                    : "border-gray-200 hover:bg-gray-50"
                                                    }`}
                                                onClick={() => step === 1 ? setCurrentRoleId(role.id) : setAspirationalRoleId(role.id)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h3 className="font-semibold">{role.name}</h3>
                                                        <p className="text-sm text-gray-500 line-clamp-1">{role.description}</p>
                                                    </div>
                                                    {(step === 1 ? currentRoleId : aspirationalRoleId) === role.id && (
                                                        <Check className="h-5 w-5 text-indigo-600" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
                                            <DialogTrigger asChild>
                                                <div className="p-4 border border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-500 hover:text-indigo-600">
                                                    <PlusCircle className="h-5 w-5" />
                                                    <span className="font-medium">Don't see your role? Request it here</span>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                                                <DialogHeader className="sr-only">
                                                    <DialogTitle>Request a New Role</DialogTitle>
                                                </DialogHeader>
                                                <CreateRoleWizard
                                                    mode="REQUEST"
                                                    onSuccess={() => setIsRoleModalOpen(false)}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
                                            We've pre-selected skills from your target role ({roles.find(r => r.id === aspirationalRoleId)?.name}).
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {roles.find(r => r.id === aspirationalRoleId)?.competencies.map(comp => (
                                                <div
                                                    key={comp.id}
                                                    className={`p-3 border rounded-lg cursor-pointer flex items-start gap-3 ${selectedCompetencies.includes(comp.id)
                                                        ? "border-indigo-600 bg-indigo-50"
                                                        : "border-gray-200"
                                                        }`}
                                                    onClick={() => {
                                                        if (selectedCompetencies.includes(comp.id)) {
                                                            setSelectedCompetencies(prev => prev.filter(id => id !== comp.id));
                                                        } else {
                                                            setSelectedCompetencies(prev => [...prev, comp.id]);
                                                        }
                                                    }}
                                                >
                                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selectedCompetencies.includes(comp.id) ? "bg-indigo-600 border-indigo-600" : "border-gray-400"
                                                        }`}>
                                                        {selectedCompetencies.includes(comp.id) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className="text-sm font-medium">{comp.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between pt-6 border-t bg-gray-50/50">
                                <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>

                                {step < 3 ? (
                                    <Button onClick={handleNext} disabled={!((step === 1 && currentRoleId) || (step === 2 && aspirationalRoleId))}>
                                        Next <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleFinish} disabled={isSubmitting || selectedCompetencies.length === 0} className="bg-indigo-600 hover:bg-indigo-700">
                                        {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Complete Setup"}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

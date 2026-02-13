"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowRight, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { InlineRoleRequestForm } from "@/components/Career/InlineRoleRequestForm";

const SECTIONS = [
    "Employee Info",
    "Current Role",
    "Current Responsibilities",
    "Tech Competencies",
    "Behavioral Competencies",
    "Aspirational Role",
    "Aspirational Tech",
    "Aspirational Behavioral",
    "Learning Preferences",
    "Self-Assessment"
];

export function ProfileWizard({ tenantSlug, tenantId }: { tenantSlug?: string; tenantId?: string }) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [roles, setRoles] = useState<any[]>([]);
    const [competencies, setCompetencies] = useState<any[]>([]);

    // Form Data State
    const [formData, setFormData] = useState<any>({
        // Section A
        phone: "",
        bio: "",
        // Section B - Current Role
        currentRoleId: "",
        // Section C
        responsibilities: "",
        // Section D & E (Competencies)
        techCompetencies: [],
        behavCompetencies: [],
        // Section F
        aspirationalRoleId: "",
        // Section G & H
        aspirationalTech: [],
        aspirationalBehav: [],
        // Section I
        learningPreferences: "",
        // Section J
        selfAssessment: ""
    });

    useEffect(() => {
        Promise.all([fetchProfile(), fetchRoles(), fetchCompetencies()]);
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await fetch('/api/career/roles');
            if (res.ok) setRoles(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchCompetencies = async () => {
        try {
            const res = await fetch('/api/competencies');
            if (res.ok) setCompetencies(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            if (res.ok) {
                setProfile(data);
                // Initialize form data from saved careerFormData or member fields
                const savedForm = data.careerFormData || {};
                setFormData({
                    phone: data.phone || "",
                    bio: data.bio || "",
                    currentRoleId: data.currentRoleId || "",
                    responsibilities: savedForm.responsibilities || "",
                    techCompetencies: savedForm.techCompetencies || [],
                    behavCompetencies: savedForm.behavCompetencies || [],
                    aspirationalRoleId: data.aspirationalRoleId || "",
                    aspirationalTech: savedForm.aspirationalTech || [],
                    aspirationalBehav: savedForm.aspirationalBehav || [],
                    learningPreferences: savedForm.learningPreferences || "",
                    selfAssessment: savedForm.selfAssessment || ""
                });
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (silent = false) => {
        setSaving(true);
        try {
            const payload = {
                phone: formData.phone,
                bio: formData.bio,
                currentRoleId: formData.currentRoleId || null,
                aspirationalRoleId: formData.aspirationalRoleId || null,
                careerFormData: {
                    responsibilities: formData.responsibilities,
                    techCompetencies: formData.techCompetencies,
                    behavCompetencies: formData.behavCompetencies,
                    aspirationalTech: formData.aspirationalTech,
                    aspirationalBehav: formData.aspirationalBehav,
                    learningPreferences: formData.learningPreferences,
                    selfAssessment: formData.selfAssessment
                }
            };

            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (!silent) toast.success("Progress saved successfully");
            } else {
                toast.error("Failed to save progress");
            }
        } catch (error) {
            toast.error("Error saving");
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => {
        handleSave(true);
        if (step < SECTIONS.length - 1) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    const toggleCompetency = (listType: string, compId: string, name: string) => {
        const list = formData[listType] || [];
        const exists = list.find((c: any) => c.id === compId);

        let newList;
        if (exists) {
            newList = list.filter((c: any) => c.id !== compId);
        } else {
            newList = [...list, { id: compId, name, level: 1 }]; // Default level 1
        }
        setFormData({ ...formData, [listType]: newList });
    };

    const updateCompetencyLevel = (listType: string, compId: string, level: number) => {
        const list = formData[listType] || [];
        const newList = list.map((c: any) => c.id === compId ? { ...c, level } : c);
        setFormData({ ...formData, [listType]: newList });
    };

    const handleRoleSelect = (roleId: string) => {
        setFormData({ ...formData, aspirationalRoleId: roleId });
        // Auto-populate aspirational competencies if empty
        const role = roles.find(r => r.id === roleId);
        if (role && role.competencies) {
            const tech = role.competencies
                .filter((rc: any) => rc.competency.category === 'TECHNICAL')
                .map((rc: any) => ({ id: rc.competency.id, name: rc.competency.name, level: 3 })); // Target level default

            const behav = role.competencies
                .filter((rc: any) => rc.competency.category === 'BEHAVIORAL')
                .map((rc: any) => ({ id: rc.competency.id, name: rc.competency.name, level: 3 }));

            // Only overwrite if currently empty to avoid data loss
            if (formData.aspirationalTech.length === 0) setFormData((prev: any) => ({ ...prev, aspirationalTech: tech }));
            if (formData.aspirationalBehav.length === 0) setFormData((prev: any) => ({ ...prev, aspirationalBehav: behav }));
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    const progress = ((step + 1) / SECTIONS.length) * 100;

    const renderCompetencySelector = (listKey: string, category: string, label: string) => {
        const filteredCompetencies = competencies.filter(c => c.category === category);
        const selectedIds = new Set(formData[listKey]?.map((c: any) => c.id));

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>{label}</Label>
                    <span className="text-xs text-gray-500">{formData[listKey]?.length || 0} selected</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto border p-2 rounded-md">
                    {filteredCompetencies.map(comp => (
                        <div key={comp.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedIds.has(comp.id) ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'}`}
                            onClick={() => toggleCompetency(listKey, comp.id, comp.name)}>
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium">{comp.name}</span>
                                {selectedIds.has(comp.id) && <span className="text-indigo-600 text-xs font-bold">✓</span>}
                            </div>
                            {selectedIds.has(comp.id) && (
                                <div className="mt-2" onClick={e => e.stopPropagation()}>
                                    <Label className="text-xs text-gray-500">Proficiency Level (1-5)</Label>
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map(lvl => (
                                            <button
                                                key={lvl}
                                                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${formData[listKey].find((c: any) => c.id === comp.id)?.level === lvl ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                                onClick={() => updateCompetencyLevel(listKey, comp.id, lvl)}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredCompetencies.length === 0 && <p className="text-sm text-gray-500 italic p-4">No competencies found in this category.</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                    <span>Section {step + 1} of {SECTIONS.length}</span>
                    <span>{Math.round(progress)}% Completed</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <Card className="min-h-[500px] flex flex-col">
                <CardHeader>
                    <CardTitle>{SECTIONS[step]}</CardTitle>
                    <CardDescription>
                        Please fill out the details accurately. Changes are auto-saved.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">

                    {/* SECTION A: INFO */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={profile?.name ?? ""} disabled className="bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={profile?.email ?? ""} disabled className="bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input value={formData.phone ?? ""} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Designation</Label>
                                    <Input value={profile?.designation ?? ""} disabled className="bg-gray-50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Professional Bio</Label>
                                <Textarea
                                    className="h-24"
                                    value={formData.bio ?? ""}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Brief summary of your professional background..."
                                />
                            </div>
                        </div>
                    )}

                    {/* SECTION B: CURRENT ROLE */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <Label>Current Role</Label>
                            <p className="text-sm text-gray-500">
                                Your role is assigned by your Team Lead or Department Head. If you don&apos;t have a role yet, request one below.
                            </p>
                            <Select
                                value={formData.currentRoleId ?? ""}
                                onValueChange={(v) => setFormData({ ...formData, currentRoleId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your current role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InlineRoleRequestForm
                                context="current"
                                tenantSlug={tenantSlug}
                                tenantId={tenantId}
                                compact
                            />
                        </div>
                    )}

                    {/* SECTION C: RESPONSIBILITIES */}
                    {step === 2 && (
                        <div className="space-y-2">
                            <Label>Current Responsibilities</Label>
                            <Textarea
                                className="h-64"
                                value={formData.responsibilities ?? ""}
                                onChange={e => setFormData({ ...formData, responsibilities: e.target.value })}
                                placeholder="List your key responsibilities and daily tasks..."
                            />
                        </div>
                    )}

                    {/* SECTION D: TECH COMPETENCIES */}
                    {step === 3 && renderCompetencySelector('techCompetencies', 'TECHNICAL', 'Select your Technical Competencies')}

                    {/* SECTION E: BEHAVIORAL COMPETENCIES */}
                    {step === 4 && renderCompetencySelector('behavCompetencies', 'BEHAVIORAL', 'Select your Behavioral Competencies')}

                    {/* SECTION F: ASPIRATIONAL ROLE */}
                    {step === 5 && (
                        <div className="space-y-4">
                            <Label>Select Aspirational Role</Label>
                            <Select value={formData.aspirationalRoleId ?? ""} onValueChange={handleRoleSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(role => (
                                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-gray-500">Choosing a role will suggest relevant competencies for your development plan.</p>
                            <InlineRoleRequestForm
                                context="aspirational"
                                tenantSlug={tenantSlug}
                                tenantId={tenantId}
                                compact
                            />
                        </div>
                    )}

                    {/* SECTION G: ASPIRATIONAL TECH */}
                    {step === 6 && renderCompetencySelector('aspirationalTech', 'TECHNICAL', 'Technical Competencies to Develop')}

                    {/* SECTION H: ASPIRATIONAL BEHAV */}
                    {step === 7 && renderCompetencySelector('aspirationalBehav', 'BEHAVIORAL', 'Behavioral Competencies to Develop')}

                    {/* SECTION I: LEARNING PREFS */}
                    {step === 8 && (
                        <div className="space-y-2">
                            <Label>Learning Preferences</Label>
                            <Textarea
                                className="h-64"
                                value={formData.learningPreferences ?? ""}
                                onChange={e => setFormData({ ...formData, learningPreferences: e.target.value })}
                                placeholder="How do you prefer to learn? (e.g. Video courses, Workshops, Mentoring)..."
                            />
                        </div>
                    )}

                    {/* SECTION J: SELF ASSESSMENT */}
                    {step === 9 && (
                        <div className="space-y-2">
                            <Label>Self Assessment / Comments</Label>
                            <Textarea
                                className="h-64"
                                value={formData.selfAssessment ?? ""}
                                onChange={e => setFormData({ ...formData, selfAssessment: e.target.value })}
                                placeholder="Any additional comments on your performance and goals..."
                            />
                        </div>
                    )}

                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                    <Button variant="outline" onClick={prevStep} disabled={step === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => handleSave(false)} disabled={saving}>
                            {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 text-gray-500" />}
                        </Button>
                        <Button onClick={nextStep} disabled={step === SECTIONS.length - 1}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        {step === SECTIONS.length - 1 && (
                            <Button onClick={() => handleSave(false)} className="bg-green-600 hover:bg-green-700">
                                Submit Profile
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

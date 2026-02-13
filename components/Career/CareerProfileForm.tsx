"use client";

import { useState } from "react";
import {
    User, GraduationCap, Briefcase, Code, Award,
    Globe, Target, ChevronRight, ChevronLeft, Save,
    Plus, Trash2, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const SECTIONS = [
    { id: 1, title: "Personal & Bio", icon: User },
    { id: 2, title: "Education", icon: GraduationCap },
    { id: 3, title: "Work Experience", icon: Briefcase },
    { id: 4, title: "Technical Skills", icon: Code },
    { id: 5, title: "Certifications", icon: Award },
    { id: 6, title: "Projects", icon: Rocket },
    { id: 7, title: "Awards & Languages", icon: Globe },
    { id: 8, title: "Career Goals", icon: Target },
    { id: 9, title: "Role Selection", icon: Target },
];

export function CareerProfileForm() {
    const [activeSection, setActiveSection] = useState(1);
    const [formData, setFormData] = useState({
        bio: "",
        education: [{ institution: "", degree: "", year: "" }],
        experience: [{ company: "", role: "", duration: "" }],
        skills: [] as string[],
        certifications: [] as string[],
        projects: [] as string[],
        languages: [] as string[],
        goals: "",
        currentRoleId: "",
        aspirationalRoleId: "",
    });

    const progress = (activeSection / SECTIONS.length) * 100;

    const next = () => setActiveSection(s => Math.min(s + 1, SECTIONS.length));
    const prev = () => setActiveSection(s => Math.max(s - 1, 1));

    const handleSave = async () => {
        try {
            // API call would go here
            toast.success("Career profile saved successfully");
        } catch (error) {
            toast.error("Failed to save profile");
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Career Profile</h1>
                <p className="mt-2 text-gray-600">Complete your profile to unlock customized assessment paths and gap analysis.</p>
                <div className="mt-6">
                    <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                        <span>Profile Completion</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-indigo-100" indicatorClassName="bg-indigo-600" />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 space-y-1">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeSection === section.id
                                ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <section.icon className={`mr-3 h-5 w-5 ${activeSection === section.id ? "text-indigo-700" : "text-gray-400"}`} />
                            {section.title}
                        </button>
                    ))}
                </aside>

                {/* Form Content */}
                <Card className="flex-1 shadow-sm border-gray-200">
                    <CardHeader className="border-b bg-gray-50/50">
                        <CardTitle className="text-xl">{SECTIONS[activeSection - 1].title}</CardTitle>
                        <CardDescription>
                            {activeSection === 1 && "Tell us about yourself and your professional background."}
                            {activeSection === 2 && "Add your educational qualifications."}
                            {activeSection === 3 && "List your professional work history."}
                            {activeSection === 8 && "What are your professional aspirations and goals?"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {activeSection === 1 && (
                            <div className="space-y-4">
                                <Label>Professional Bio</Label>
                                <Textarea
                                    className="min-h-[150px]"
                                    placeholder="Briefly describe your professional journey..."
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                                <p className="text-xs text-gray-500">Maximum 500 characters.</p>
                            </div>
                        )}

                        {activeSection === 2 && (
                            <div className="space-y-6">
                                {formData.education.map((edu, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg space-y-4 relative group">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Institution</Label>
                                                <Input placeholder="University Name" value={edu.institution} onChange={() => { }} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Degree</Label>
                                                <Input placeholder="B.Tech, MBA, etc." value={edu.degree} onChange={() => { }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full border-dashed">
                                    <Plus className="mr-2 h-4 w-4" /> Add Education
                                </Button>
                            </div>
                        )}

                        {/* Other sections would follow similar patterns */}
                        {activeSection > 3 && activeSection < 9 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                {(() => {
                                    const CurrentIcon = SECTIONS[activeSection - 1].icon;
                                    return <CurrentIcon className="h-12 w-12 text-gray-300 mb-4" />;
                                })()}
                                <h3 className="text-lg font-medium text-gray-900">{SECTIONS[activeSection - 1].title} Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Section in implementation...</p>
                            </div>
                        )}

                        {activeSection === 9 && (
                            <div className="space-y-6">
                                <div className="p-4 border rounded-lg bg-indigo-50/30 space-y-4">
                                    <Label className="text-indigo-900 font-bold">Current Role</Label>
                                    <Input placeholder="Search for your current role..." />
                                </div>
                                <div className="p-4 border rounded-lg bg-emerald-50/30 space-y-4">
                                    <Label className="text-emerald-900 font-bold">Aspirational Role (Goal)</Label>
                                    <Input placeholder="Search for your target role..." />
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-gray-50/50 flex justify-between py-4 font-bold">
                        <Button variant="ghost" onClick={prev} disabled={activeSection === 1}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4 font-bold" /> Save Progress
                            </Button>
                            {activeSection < SECTIONS.length ? (
                                <Button onClick={next} className="bg-indigo-600 hover:bg-indigo-700 font-bold">
                                    Next <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 font-bold">
                                    Finalize Profile <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

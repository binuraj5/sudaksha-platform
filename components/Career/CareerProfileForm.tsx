"use client";

import { useState, useEffect } from "react";
import {
    User,
    GraduationCap,
    Briefcase,
    Code,
    Award,
    Globe,
    Target,
    ChevronRight,
    ChevronLeft,
    Save,
    Plus,
    Trash2,
    Rocket,
    Pencil,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    { id: 9, title: "Roles", icon: Target },
];

type EducationItem = { institution: string; degree: string; year: string };
type ExperienceItem = { company: string; role: string; duration: string; description?: string };
type CertificationItem = { name: string; issuer?: string; year?: string };
type ProjectItem = { name: string; description: string; duration?: string };

export function CareerProfileForm() {
    const [activeSection, setActiveSection] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [roles, setRoles] = useState<{ id: string; name: string; description?: string }[]>([]);

    const [formData, setFormData] = useState({
        bio: "",
        education: [] as EducationItem[],
        experience: [] as ExperienceItem[],
        skills: [] as string[],
        certifications: [] as CertificationItem[],
        projects: [] as ProjectItem[],
        awards: [] as string[],
        languages: [] as string[],
        goals: "",
        currentRoleId: "",
        aspirationalRoleId: "",
    });

    // Edit/View state: which list and which index (null = none, -1 = add new)
    const [editing, setEditing] = useState<{ section: string; index: number | null }>({ section: "", index: null });
    const [viewing, setViewing] = useState<{ section: string; index: number } | null>(null);

    // Inline edit buffers for add/edit form
    const [editEdu, setEditEdu] = useState<EducationItem>({ institution: "", degree: "", year: "" });
    const [editExp, setEditExp] = useState<ExperienceItem>({ company: "", role: "", duration: "", description: "" });
    const [editSkill, setEditSkill] = useState("");
    const [editCert, setEditCert] = useState<CertificationItem>({ name: "", issuer: "", year: "" });
    const [editProject, setEditProject] = useState<ProjectItem>({ name: "", description: "", duration: "" });
    const [editAward, setEditAward] = useState("");
    const [editLang, setEditLang] = useState("");

    useEffect(() => {
        Promise.all([fetchProfile(), fetchRoles()]);
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/career/roles");
            if (res.ok) setRoles(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();
            if (res.ok && data?.id && !data.error) {
                const cf = (data.careerFormData as Record<string, unknown>) || {};
                setFormData({
                    bio: data.bio ?? "",
                    education: Array.isArray(cf.education) ? cf.education : [],
                    experience: Array.isArray(cf.experience) ? cf.experience : [],
                    skills: Array.isArray(cf.skills) ? cf.skills : [],
                    certifications: Array.isArray(cf.certifications) ? cf.certifications : [],
                    projects: Array.isArray(cf.projects) ? cf.projects : [],
                    awards: Array.isArray(cf.awards) ? cf.awards : [],
                    languages: Array.isArray(cf.languages) ? cf.languages : [],
                    goals: typeof cf.goals === "string" ? cf.goals : "",
                    currentRoleId: data.currentRoleId ?? "",
                    aspirationalRoleId: data.aspirationalRoleId ?? "",
                });
            }
        } catch (e) {
            console.error("Failed to load profile", e);
        } finally {
            setLoading(false);
        }
    };

    const saveToApi = async (payload: {
        careerFormData?: Record<string, unknown>;
        currentRoleId?: string | null;
        aspirationalRoleId?: string | null;
        bio?: string;
    }) => {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                toast.success("Saved successfully");
                return true;
            }
            const err = await res.json().catch(() => ({}));
            toast.error(err?.error || "Failed to save");
            return false;
        } catch {
            toast.error("Failed to save");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        const careerFormData = {
            education: formData.education,
            experience: formData.experience,
            skills: formData.skills,
            certifications: formData.certifications,
            projects: formData.projects,
            awards: formData.awards,
            languages: formData.languages,
            goals: formData.goals,
        };
        await saveToApi({
            bio: formData.bio,
            currentRoleId: formData.currentRoleId || null,
            aspirationalRoleId: formData.aspirationalRoleId || null,
            careerFormData,
        });
    };

    const completedCount =
        (formData.bio.trim() ? 1 : 0) +
        (formData.education.length > 0 ? 1 : 0) +
        (formData.experience.length > 0 ? 1 : 0) +
        (formData.skills.length > 0 ? 1 : 0) +
        (formData.certifications.length > 0 ? 1 : 0) +
        (formData.projects.length > 0 ? 1 : 0) +
        (formData.awards.length > 0 || formData.languages.length > 0 ? 1 : 0) +
        (formData.goals.trim() ? 1 : 0) +
        (formData.currentRoleId || formData.aspirationalRoleId ? 1 : 0);
    const progress = (completedCount / SECTIONS.length) * 100;

    const next = () => setActiveSection((s) => Math.min(s + 1, SECTIONS.length));
    const prev = () => setActiveSection((s) => Math.max(s - 1, 1));

    // --- Education ---
    const isEditingEdu = editing.section === "edu";
    const showEduForm = isEditingEdu && editing.index !== null;
    const addEdu = () => {
        setEditEdu({ institution: "", degree: "", year: "" });
        setEditing({ section: "edu", index: -1 });
        setViewing(null);
    };
    const editEduAt = (idx: number) => {
        setEditEdu({ ...formData.education[idx] });
        setEditing({ section: "edu", index: idx });
        setViewing(null);
    };
    const saveEdu = () => {
        if (editing.index === -1) {
            setFormData((f) => ({ ...f, education: [...f.education, { ...editEdu }] }));
        } else if (typeof editing.index === "number" && editing.index >= 0) {
            setFormData((f) => ({
                ...f,
                education: f.education.map((e, i) => (i === editing.index ? { ...editEdu } : e)),
            }));
        }
        setEditing({ section: "", index: null });
    };
    const deleteEdu = (idx: number) => {
        setFormData((f) => ({ ...f, education: f.education.filter((_, i) => i !== idx) }));
        setEditing({ section: "", index: null });
        setViewing(null);
    };

    // --- Experience ---
    const isEditingExp = editing.section === "exp";
    const addExp = () => {
        setEditExp({ company: "", role: "", duration: "", description: "" });
        setEditing({ section: "exp", index: -1 });
        setViewing(null);
    };
    const editExpAt = (idx: number) => {
        setEditExp({ ...formData.experience[idx], description: formData.experience[idx].description ?? "" });
        setEditing({ section: "exp", index: idx });
        setViewing(null);
    };
    const saveExp = () => {
        if (editing.index === -1) {
            setFormData((f) => ({ ...f, experience: [...f.experience, { ...editExp }] }));
        } else if (typeof editing.index === "number" && editing.index >= 0) {
            setFormData((f) => ({
                ...f,
                experience: f.experience.map((e, i) => (i === editing.index ? { ...editExp } : e)),
            }));
        }
        setEditing({ section: "", index: null });
    };
    const deleteExp = (idx: number) => {
        setFormData((f) => ({ ...f, experience: f.experience.filter((_, i) => i !== idx) }));
        setEditing({ section: "", index: null });
        setViewing(null);
    };

    // --- Skills ---
    const isEditingSkill = editing.section === "skill";
    const addSkill = () => {
        setEditSkill("");
        setEditing({ section: "skill", index: -1 });
        setViewing(null);
    };
    const editSkillAt = (idx: number) => {
        setEditSkill(formData.skills[idx]);
        setEditing({ section: "skill", index: idx });
        setViewing(null);
    };
    const saveSkill = () => {
        const trimmed = editSkill.trim();
        if (!trimmed) {
            setEditing({ section: "", index: null });
            return;
        }
        if (editing.index === -1) {
            setFormData((f) => ({ ...f, skills: [...f.skills, trimmed] }));
        } else if (typeof editing.index === "number" && editing.index >= 0) {
            setFormData((f) => ({
                ...f,
                skills: f.skills.map((s, i) => (i === editing.index ? trimmed : s)),
            }));
        }
        setEditing({ section: "", index: null });
    };
    const deleteSkill = (idx: number) => {
        setFormData((f) => ({ ...f, skills: f.skills.filter((_, i) => i !== idx) }));
        setEditing({ section: "", index: null });
        setViewing(null);
    };

    // --- Certifications ---
    const isEditingCert = editing.section === "cert";
    const addCert = () => {
        setEditCert({ name: "", issuer: "", year: "" });
        setEditing({ section: "cert", index: -1 });
        setViewing(null);
    };
    const editCertAt = (idx: number) => {
        setEditCert({
            name: formData.certifications[idx].name,
            issuer: formData.certifications[idx].issuer ?? "",
            year: formData.certifications[idx].year ?? "",
        });
        setEditing({ section: "cert", index: idx });
        setViewing(null);
    };
    const saveCert = () => {
        if (!editCert.name.trim()) {
            setEditing({ section: "", index: null });
            return;
        }
        if (editing.index === -1) {
            setFormData((f) => ({ ...f, certifications: [...f.certifications, { ...editCert }] }));
        } else if (typeof editing.index === "number" && editing.index >= 0) {
            setFormData((f) => ({
                ...f,
                certifications: f.certifications.map((c, i) => (i === editing.index ? { ...editCert } : c)),
            }));
        }
        setEditing({ section: "", index: null });
    };
    const deleteCert = (idx: number) => {
        setFormData((f) => ({ ...f, certifications: f.certifications.filter((_, i) => i !== idx) }));
        setEditing({ section: "", index: null });
        setViewing(null);
    };

    // --- Projects ---
    const isEditingProject = editing.section === "project";
    const addProject = () => {
        setEditProject({ name: "", description: "", duration: "" });
        setEditing({ section: "project", index: -1 });
        setViewing(null);
    };
    const editProjectAt = (idx: number) => {
        setEditProject({
            name: formData.projects[idx].name,
            description: formData.projects[idx].description,
            duration: formData.projects[idx].duration ?? "",
        });
        setEditing({ section: "project", index: idx });
        setViewing(null);
    };
    const saveProject = () => {
        if (!editProject.name.trim()) {
            setEditing({ section: "", index: null });
            return;
        }
        if (editing.index === -1) {
            setFormData((f) => ({ ...f, projects: [...f.projects, { ...editProject }] }));
        } else if (typeof editing.index === "number" && editing.index >= 0) {
            setFormData((f) => ({
                ...f,
                projects: f.projects.map((p, i) => (i === editing.index ? { ...editProject } : p)),
            }));
        }
        setEditing({ section: "", index: null });
    };
    const deleteProject = (idx: number) => {
        setFormData((f) => ({ ...f, projects: f.projects.filter((_, i) => i !== idx) }));
        setEditing({ section: "", index: null });
        setViewing(null);
    };

    // --- Awards ---
    const isEditingAward = editing.section === "award";
    const addAward = () => {
        setEditAward("");
        setEditing({ section: "award", index: -1 });
        setViewing(null);
    };
    const editAwardAt = (idx: number) => {
        setEditAward(formData.awards[idx]);
        setEditing({ section: "award", index: idx });
        setViewing(null);
    };
    const saveAward = () => {
        const trimmed = editAward.trim();
        if (!trimmed) {
            setEditing({ section: "", index: null });
            return;
        }
        if (editing.index === -1) {
            setFormData((f) => ({ ...f, awards: [...f.awards, trimmed] }));
        } else if (typeof editing.index === "number" && editing.index >= 0) {
            setFormData((f) => ({ ...f, awards: f.awards.map((a, i) => (i === editing.index ? trimmed : a)) }));
        }
        setEditing({ section: "", index: null });
    };
    const deleteAward = (idx: number) => {
        setFormData((f) => ({ ...f, awards: f.awards.filter((_, i) => i !== idx) }));
        setEditing({ section: "", index: null });
        setViewing(null);
    };

    // --- Languages ---
    const isEditingLang = editing.section === "lang";
    const addLang = () => {
        setEditLang("");
        setEditing({ section: "lang", index: -1 });
        setViewing(null);
    };
    const editLangAt = (idx: number) => {
        setEditLang(formData.languages[idx]);
        setEditing({ section: "lang", index: idx });
        setViewing(null);
    };
    const saveLang = () => {
        const trimmed = editLang.trim();
        if (!trimmed) {
            setEditing({ section: "", index: null });
            return;
        }
        if (editing.index === -1) {
            setFormData((f) => ({ ...f, languages: [...f.languages, trimmed] }));
        } else if (typeof editing.index === "number" && editing.index >= 0) {
            setFormData((f) => ({ ...f, languages: f.languages.map((l, i) => (i === editing.index ? trimmed : l)) }));
        }
        setEditing({ section: "", index: null });
    };
    const deleteLang = (idx: number) => {
        setFormData((f) => ({ ...f, languages: f.languages.filter((_, i) => i !== idx) }));
        setEditing({ section: "", index: null });
        setViewing(null);
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4 flex justify-center items-center min-h-[200px] text-gray-500">
                Loading profile...
            </div>
        );
    }

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
                    <Progress value={progress} className="h-2 bg-indigo-100" />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
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

                <Card className="flex-1 shadow-sm border-gray-200">
                    <CardHeader className="border-b bg-gray-50/50">
                        <CardTitle className="text-xl">{SECTIONS[activeSection - 1].title}</CardTitle>
                        <CardDescription>
                            {activeSection === 1 && "Tell us about yourself and your professional background."}
                            {activeSection === 2 && "Add your educational qualifications."}
                            {activeSection === 3 && "List your professional work history."}
                            {activeSection === 4 && "Add technical skills."}
                            {activeSection === 5 && "Add certifications."}
                            {activeSection === 6 && "List projects you have worked on."}
                            {activeSection === 7 && "Add awards and languages."}
                            {activeSection === 8 && "What are your professional aspirations and goals?"}
                            {activeSection === 9 && "Select your current and aspirational role (same roles as My Profile)."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* 1. Personal & Bio */}
                        {activeSection === 1 && (
                            <div className="space-y-4">
                                <Label>Professional Bio</Label>
                                <Textarea
                                    className="min-h-[150px]"
                                    placeholder="Briefly describe your professional journey..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                                <p className="text-xs text-gray-500">Maximum 500 characters.</p>
                            </div>
                        )}

                        {/* 2. Education */}
                        {activeSection === 2 && (
                            <div className="space-y-4">
                                {formData.education.map((edu, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg bg-gray-50/50 flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{edu.institution || "—"}</p>
                                            <p className="text-sm text-gray-600">{edu.degree} {edu.year ? ` · ${edu.year}` : ""}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => editEduAt(idx)}>
                                                <Pencil className="h-4 w-4 mr-1" /> Edit
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteEdu(idx)}>
                                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {showEduForm && (
                                    <div className="p-4 border-2 border-indigo-200 rounded-lg space-y-4 bg-indigo-50/30">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Institution</Label>
                                                <Input
                                                    placeholder="University Name"
                                                    value={editEdu.institution}
                                                    onChange={(e) => setEditEdu({ ...editEdu, institution: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Degree</Label>
                                                <Input
                                                    placeholder="B.Tech, MBA, etc."
                                                    value={editEdu.degree}
                                                    onChange={(e) => setEditEdu({ ...editEdu, degree: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Year</Label>
                                            <Input
                                                placeholder="e.g. 2020"
                                                value={editEdu.year}
                                                onChange={(e) => setEditEdu({ ...editEdu, year: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" onClick={saveEdu}>Save</Button>
                                            <Button type="button" variant="outline" onClick={() => setEditing({ section: "", index: null })}>
                                                <X className="h-4 w-4 mr-1" /> Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <Button type="button" variant="outline" className="w-full border-dashed" onClick={addEdu} disabled={isEditingEdu}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Education
                                </Button>
                            </div>
                        )}

                        {/* 3. Work Experience */}
                        {activeSection === 3 && (
                            <div className="space-y-4">
                                {formData.experience.map((exp, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg bg-gray-50/50 flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{exp.company || "—"}</p>
                                            <p className="text-sm text-gray-600">{exp.role} {exp.duration ? ` · ${exp.duration}` : ""}</p>
                                            {exp.description && <p className="text-sm text-gray-500 mt-1">{exp.description}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => editExpAt(idx)}>
                                                <Pencil className="h-4 w-4 mr-1" /> Edit
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteExp(idx)}>
                                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {isEditingExp && editing.index !== null && (
                                    <div className="p-4 border-2 border-indigo-200 rounded-lg space-y-4 bg-indigo-50/30">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Company</Label>
                                                <Input value={editExp.company} onChange={(e) => setEditExp({ ...editExp, company: e.target.value })} placeholder="Company name" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Role</Label>
                                                <Input value={editExp.role} onChange={(e) => setEditExp({ ...editExp, role: e.target.value })} placeholder="Job title" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Duration</Label>
                                                <Input value={editExp.duration} onChange={(e) => setEditExp({ ...editExp, duration: e.target.value })} placeholder="e.g. 2020 - Present" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Description (optional)</Label>
                                                <Textarea value={editExp.description ?? ""} onChange={(e) => setEditExp({ ...editExp, description: e.target.value })} placeholder="Key responsibilities..." className="min-h-[80px]" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" onClick={saveExp}>Save</Button>
                                            <Button type="button" variant="outline" onClick={() => setEditing({ section: "", index: null })}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                                        </div>
                                    </div>
                                )}
                                <Button type="button" variant="outline" className="w-full border-dashed" onClick={addExp} disabled={isEditingExp}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Work Experience
                                </Button>
                            </div>
                        )}

                        {/* 4. Technical Skills */}
                        {activeSection === 4 && (
                            <div className="space-y-4">
                                {formData.skills.map((skill, idx) => (
                                    <div key={idx} className="p-3 border rounded-lg bg-gray-50/50 flex items-center justify-between">
                                        <span className="font-medium text-gray-900">{skill}</span>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => editSkillAt(idx)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                                            <Button type="button" variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteSkill(idx)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                                        </div>
                                    </div>
                                ))}
                                {isEditingSkill && (
                                    <div className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50/30 flex flex-wrap items-center gap-2">
                                        <Input
                                            placeholder="e.g. JavaScript, React, Python"
                                            value={editSkill}
                                            onChange={(e) => setEditSkill(e.target.value)}
                                            className="max-w-xs"
                                        />
                                        <Button type="button" onClick={saveSkill}>Save</Button>
                                        <Button type="button" variant="outline" onClick={() => setEditing({ section: "", index: null })}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                                    </div>
                                )}
                                <Button type="button" variant="outline" className="w-full border-dashed" onClick={addSkill} disabled={isEditingSkill}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Technical Skill
                                </Button>
                            </div>
                        )}

                        {/* 5. Certifications */}
                        {activeSection === 5 && (
                            <div className="space-y-4">
                                {formData.certifications.map((cert, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg bg-gray-50/50 flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{cert.name}</p>
                                            {(cert.issuer || cert.year) && <p className="text-sm text-gray-600">{[cert.issuer, cert.year].filter(Boolean).join(" · ")}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => editCertAt(idx)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                                            <Button type="button" variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteCert(idx)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                                        </div>
                                    </div>
                                ))}
                                {isEditingCert && editing.index !== null && (
                                    <div className="p-4 border-2 border-indigo-200 rounded-lg space-y-4 bg-indigo-50/30">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Certification Name</Label>
                                                <Input value={editCert.name} onChange={(e) => setEditCert({ ...editCert, name: e.target.value })} placeholder="e.g. AWS Solutions Architect" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Issuer (optional)</Label>
                                                <Input value={editCert.issuer ?? ""} onChange={(e) => setEditCert({ ...editCert, issuer: e.target.value })} placeholder="e.g. AWS" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Year (optional)</Label>
                                                <Input value={editCert.year ?? ""} onChange={(e) => setEditCert({ ...editCert, year: e.target.value })} placeholder="e.g. 2023" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" onClick={saveCert}>Save</Button>
                                            <Button type="button" variant="outline" onClick={() => setEditing({ section: "", index: null })}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                                        </div>
                                    </div>
                                )}
                                <Button type="button" variant="outline" className="w-full border-dashed" onClick={addCert} disabled={isEditingCert}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Certification
                                </Button>
                            </div>
                        )}

                        {/* 6. Projects */}
                        {activeSection === 6 && (
                            <div className="space-y-4">
                                {formData.projects.map((proj, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg bg-gray-50/50 flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{proj.name}</p>
                                            {proj.duration && <p className="text-sm text-gray-600">{proj.duration}</p>}
                                            {proj.description && <p className="text-sm text-gray-500 mt-1">{proj.description}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => editProjectAt(idx)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                                            <Button type="button" variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteProject(idx)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                                        </div>
                                    </div>
                                ))}
                                {isEditingProject && editing.index !== null && (
                                    <div className="p-4 border-2 border-indigo-200 rounded-lg space-y-4 bg-indigo-50/30">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Project Name</Label>
                                                <Input value={editProject.name} onChange={(e) => setEditProject({ ...editProject, name: e.target.value })} placeholder="Project name" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Duration (optional)</Label>
                                                <Input value={editProject.duration ?? ""} onChange={(e) => setEditProject({ ...editProject, duration: e.target.value })} placeholder="e.g. 2022 - 2023" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea value={editProject.description} onChange={(e) => setEditProject({ ...editProject, description: e.target.value })} placeholder="Brief description..." className="min-h-[80px]" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" onClick={saveProject}>Save</Button>
                                            <Button type="button" variant="outline" onClick={() => setEditing({ section: "", index: null })}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                                        </div>
                                    </div>
                                )}
                                <Button type="button" variant="outline" className="w-full border-dashed" onClick={addProject} disabled={isEditingProject}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Project
                                </Button>
                            </div>
                        )}

                        {/* 7. Awards & Languages */}
                        {activeSection === 7 && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Awards</h4>
                                    {formData.awards.map((award, idx) => (
                                        <div key={idx} className="p-3 border rounded-lg bg-gray-50/50 flex items-center justify-between mb-2">
                                            <span className="text-gray-900">{award}</span>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" size="sm" onClick={() => editAwardAt(idx)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                                                <Button type="button" variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteAward(idx)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                                            </div>
                                        </div>
                                    ))}
                                    {isEditingAward && (
                                        <div className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50/30 flex flex-wrap items-center gap-2 mb-4">
                                            <Input placeholder="Award name" value={editAward} onChange={(e) => setEditAward(e.target.value)} className="max-w-xs" />
                                            <Button type="button" onClick={saveAward}>Save</Button>
                                            <Button type="button" variant="outline" onClick={() => setEditing({ section: "", index: null })}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                                        </div>
                                    )}
                                    <Button type="button" variant="outline" size="sm" className="border-dashed" onClick={addAward} disabled={isEditingAward}>
                                        <Plus className="mr-1 h-4 w-4" /> Add Award
                                    </Button>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                                    {formData.languages.map((lang, idx) => (
                                        <div key={idx} className="p-3 border rounded-lg bg-gray-50/50 flex items-center justify-between mb-2">
                                            <span className="text-gray-900">{lang}</span>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" size="sm" onClick={() => editLangAt(idx)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                                                <Button type="button" variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteLang(idx)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                                            </div>
                                        </div>
                                    ))}
                                    {isEditingLang && (
                                        <div className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50/30 flex flex-wrap items-center gap-2 mb-4">
                                            <Input placeholder="e.g. English, Hindi" value={editLang} onChange={(e) => setEditLang(e.target.value)} className="max-w-xs" />
                                            <Button type="button" onClick={saveLang}>Save</Button>
                                            <Button type="button" variant="outline" onClick={() => setEditing({ section: "", index: null })}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                                        </div>
                                    )}
                                    <Button type="button" variant="outline" size="sm" className="border-dashed" onClick={addLang} disabled={isEditingLang}>
                                        <Plus className="mr-1 h-4 w-4" /> Add Language
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 8. Career Goals */}
                        {activeSection === 8 && (
                            <div className="space-y-4">
                                <Label>Career Goals & Aspirations</Label>
                                <Textarea
                                    className="min-h-[150px]"
                                    placeholder="Where do you see yourself in 3–5 years? What skills do you want to develop?"
                                    value={formData.goals}
                                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                />
                            </div>
                        )}

                        {/* 9. Roles (same as My Profile) */}
                        {activeSection === 9 && (
                            <div className="space-y-6">
                                <p className="text-sm text-gray-600">Select your current and aspirational role. These are the same roles available in My Profile.</p>
                                <div className="p-4 border rounded-lg bg-indigo-50/30 space-y-4">
                                    <Label className="text-indigo-900 font-bold">Current Role</Label>
                                    <Select
                                        value={formData.currentRoleId || "__none__"}
                                        onValueChange={(v) => setFormData({ ...formData, currentRoleId: v === "__none__" ? "" : v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your current role..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">— None —</SelectItem>
                                            {roles.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="p-4 border rounded-lg bg-emerald-50/30 space-y-4">
                                    <Label className="text-emerald-900 font-bold">Aspirational Role (Goal)</Label>
                                    <Select
                                        value={formData.aspirationalRoleId || "__none__"}
                                        onValueChange={(v) => setFormData({ ...formData, aspirationalRoleId: v === "__none__" ? "" : v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your target role..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">— None —</SelectItem>
                                            {roles.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-gray-50/50 flex justify-between py-4">
                        <Button variant="ghost" onClick={prev} disabled={activeSection === 1}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleSave} disabled={saving}>
                                <Save className="mr-2 h-4 w-4" /> Save Progress
                            </Button>
                            {activeSection < SECTIONS.length ? (
                                <Button onClick={next} className="bg-indigo-600 hover:bg-indigo-700">
                                    Next <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700" disabled={saving}>
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

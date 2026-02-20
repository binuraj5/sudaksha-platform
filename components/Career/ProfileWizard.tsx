"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowRight, ArrowLeft, Save, Pencil, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { InlineRoleRequestForm } from "@/components/Career/InlineRoleRequestForm";
import { cn } from "@/lib/utils";

const TAB_IDS = [
    "info",
    "current-role",
    "responsibilities",
    "tech",
    "behav",
    "aspirational-role",
    "aspirational-tech",
    "aspirational-behav",
    "learning",
    "self-assessment",
] as const;

/** Placeholder value for Select (Radix disallows empty string as SelectItem value) */
const SELECT_PLACEHOLDER_VALUE = "__none__";

/** Self-assessment: performance rating options */
const SELF_ASSESSMENT_RATINGS = [
    { value: SELECT_PLACEHOLDER_VALUE, label: "Select..." },
    { value: "1", label: "1 - Need significant development" },
    { value: "2", label: "2 - Developing" },
    { value: "3", label: "3 - Meeting expectations" },
    { value: "4", label: "4 - Exceeding expectations" },
    { value: "5", label: "5 - Outstanding" },
] as const;

/** Self-assessment: common strengths (multi-select) */
const SELF_ASSESSMENT_STRENGTHS = [
    "Technical depth", "Communication", "Problem solving", "Leadership",
    "Collaboration", "Time management", "Adaptability", "Domain knowledge",
    "Mentoring others", "Stakeholder management", "Innovation", "Analytical thinking",
] as const;

/** Self-assessment: areas to improve (multi-select) */
const SELF_ASSESSMENT_AREAS = [
    "Technical skills", "Presentation skills", "Project management", "Strategic thinking",
    "Cross-functional collaboration", "Delegation", "Conflict resolution", "Technical breadth",
    "Influence without authority", "Executive communication", "Change management", "Coaching",
] as const;

/** Self-assessment: motivation options */
const SELF_ASSESSMENT_MOTIVATION = [
    { value: SELECT_PLACEHOLDER_VALUE, label: "Select..." },
    { value: "growth", label: "Career growth & advancement" },
    { value: "mastery", label: "Mastering new skills" },
    { value: "impact", label: "Making an impact" },
    { value: "balance", label: "Work-life balance" },
    { value: "recognition", label: "Recognition & visibility" },
    { value: "stability", label: "Job stability & security" },
    { value: "other", label: "Other" },
] as const;

/** Learning preference options for multi-select (stored in careerFormData.learningPreferences) */
const LEARNING_PREFERENCE_OPTIONS = [
    "Video courses",
    "Self-paced online courses",
    "Workshops / bootcamps",
    "Mentoring / coaching",
    "Classroom / instructor-led",
    "Reading / documentation",
    "Hands-on projects / labs",
    "Peer learning / study groups",
    "Certifications",
    "Webinars / live sessions",
    "Microlearning (short modules)",
    "Books / e-books",
] as const;

const TAB_LABELS: Record<(typeof TAB_IDS)[number], string> = {
    info: "Basic Info",
    "current-role": "Current Role",
    responsibilities: "Responsibilities",
    tech: "Tech Competencies",
    behav: "Behavioral Competencies",
    "aspirational-role": "Aspirational Role",
    "aspirational-tech": "Aspirational Tech",
    "aspirational-behav": "Aspirational Behavioral",
    learning: "Learning Preferences",
    "self-assessment": "Self-Assessment",
};

/** Derive which tabs are complete from saved profile/careerFormData (for restore on load) */
function getCompletedTabsFromData(data: any, savedForm: any): Set<string> {
    const completed = new Set<string>();
    if (!data) return completed;
    if (data.phone != null && data.phone !== "" || data.bio != null && data.bio !== "") completed.add("info");
    if (data.currentRoleId) completed.add("current-role");
    const resp = savedForm?.responsibilities;
    if (typeof resp === "string" && resp.trim()) completed.add("responsibilities");
    if (Array.isArray(savedForm?.techCompetencies) && savedForm.techCompetencies.length > 0) completed.add("tech");
    if (Array.isArray(savedForm?.behavCompetencies) && savedForm.behavCompetencies.length > 0) completed.add("behav");
    if (data.aspirationalRoleId) completed.add("aspirational-role");
    if (Array.isArray(savedForm?.aspirationalTech) && savedForm.aspirationalTech.length > 0) completed.add("aspirational-tech");
    if (Array.isArray(savedForm?.aspirationalBehav) && savedForm.aspirationalBehav.length > 0) completed.add("aspirational-behav");
    const lp = savedForm?.learningPreferences;
    const lpSelected = lp && typeof lp === "object" && Array.isArray(lp.selected) ? lp.selected : [];
    const lpOther = lp && typeof lp === "object" && typeof lp.other === "string" ? lp.other : "";
    if (lpSelected.length > 0 || (lpOther && lpOther.trim())) completed.add("learning");
    const sa = savedForm?.selfAssessment;
    if (sa && typeof sa === "object") {
        const hasSa = (sa.performanceRating && sa.performanceRating !== SELECT_PLACEHOLDER_VALUE)
            || (Array.isArray(sa.strengths) && sa.strengths.length > 0)
            || (Array.isArray(sa.areasToImprove) && sa.areasToImprove.length > 0)
            || (sa.motivation && sa.motivation !== SELECT_PLACEHOLDER_VALUE)
            || (typeof sa.vision === "string" && sa.vision.trim());
        if (hasSa) completed.add("self-assessment");
    } else if (typeof sa === "string" && sa.trim()) completed.add("self-assessment");
    return completed;
}

export function ProfileWizard({
    tenantSlug,
    tenantId,
    isB2C,
}: {
    tenantSlug?: string;
    tenantId?: string;
    /** When true (individual profile at /assessments/individuals/profile), show B2C copy and allow role selection/request from global list */
    isB2C?: boolean;
}) {
    const [activeTab, setActiveTab] = useState<string>("info");
    const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());
    const [isViewMode, setIsViewMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [roles, setRoles] = useState<any[]>([]);
    const [competencies, setCompetencies] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        phone: "",
        bio: "",
        currentRoleId: "",
        responsibilities: "",
        techCompetencies: [],
        behavCompetencies: [],
        aspirationalRoleId: "",
        aspirationalTech: [],
        aspirationalBehav: [],
        learningPreferences: { selected: [] as string[], other: "" },
        selfAssessment: {
            performanceRating: "",
            strengths: [] as string[],
            areasToImprove: [] as string[],
            motivation: "",
            motivationOther: "",
            vision: "",
        },
    });

    useEffect(() => {
        Promise.all([fetchProfile(), fetchRoles(), fetchCompetencies()]);
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/career/roles");
            if (res.ok) setRoles(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchCompetencies = async () => {
        try {
            const res = await fetch("/api/competencies");
            if (res.ok) setCompetencies(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();
            if (res.ok) {
                setProfile(data);
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
                    learningPreferences: (() => {
                        const lp = savedForm.learningPreferences;
                        if (lp && typeof lp === "object" && Array.isArray(lp.selected)) {
                            return { selected: lp.selected || [], other: lp.other ?? "" };
                        }
                        if (typeof lp === "string" && lp.trim()) return { selected: [], other: lp };
                        return { selected: [], other: "" };
                    })(),
                    selfAssessment: (() => {
                        const sa = savedForm.selfAssessment;
                        if (sa && typeof sa === "object" && !Array.isArray(sa)) {
                            return {
                                performanceRating: sa.performanceRating ?? "",
                                strengths: Array.isArray(sa.strengths) ? sa.strengths : [],
                                areasToImprove: Array.isArray(sa.areasToImprove) ? sa.areasToImprove : [],
                                motivation: sa.motivation ?? "",
                                motivationOther: sa.motivationOther ?? "",
                                vision: sa.vision ?? "",
                            };
                        }
                        if (typeof sa === "string" && sa.trim()) return { performanceRating: "", strengths: [], areasToImprove: [], motivation: "", motivationOther: "", vision: sa };
                        return { performanceRating: "", strengths: [], areasToImprove: [], motivation: "", motivationOther: "", vision: "" };
                    })(),
                });
                const completed = getCompletedTabsFromData(data, savedForm);
                setCompletedTabs(completed);
                if (completed.size === TAB_IDS.length) setIsViewMode(true);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (silent = false, advanceToNext = false) => {
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
                    learningPreferences:
                        typeof formData.learningPreferences === "object" && formData.learningPreferences != null
                            ? {
                                selected: formData.learningPreferences.selected ?? [],
                                other: formData.learningPreferences.other ?? "",
                            }
                            : { selected: [], other: String(formData.learningPreferences ?? "") },
                    selfAssessment:
                        typeof formData.selfAssessment === "object" && formData.selfAssessment != null
                            ? {
                                performanceRating: formData.selfAssessment.performanceRating ?? "",
                                strengths: formData.selfAssessment.strengths ?? [],
                                areasToImprove: formData.selfAssessment.areasToImprove ?? [],
                                motivation: formData.selfAssessment.motivation ?? "",
                                motivationOther: formData.selfAssessment.motivationOther ?? "",
                                vision: formData.selfAssessment.vision ?? "",
                            }
                            : { performanceRating: "", strengths: [], areasToImprove: [], motivation: "", motivationOther: "", vision: String(formData.selfAssessment ?? "") },
                },
            };

            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const nextCompleted = new Set([...completedTabs, activeTab]);
                setCompletedTabs(nextCompleted);
                if (nextCompleted.size === TAB_IDS.length) setIsViewMode(true);
                if (!silent) toast.success("Progress saved successfully");
                if (advanceToNext) {
                    const idx = TAB_IDS.indexOf(activeTab as any);
                    if (idx < TAB_IDS.length - 1) setActiveTab(TAB_IDS[idx + 1]);
                }
            } else {
                toast.error("Failed to save progress");
            }
        } catch {
            toast.error("Error saving");
        } finally {
            setSaving(false);
        }
    };

    const isTabEnabled = (tabId: string) => {
        const idx = TAB_IDS.indexOf(tabId as any);
        if (idx <= 0) return true;
        const prevTab = TAB_IDS[idx - 1];
        return completedTabs.has(prevTab);
    };

    const toggleCompetency = (listType: string, compId: string, name: string) => {
        const list = formData[listType] || [];
        const exists = list.find((c: any) => c.id === compId);
        const newList = exists
            ? list.filter((c: any) => c.id !== compId)
            : [...list, { id: compId, name, level: 1 }];
        setFormData({ ...formData, [listType]: newList });
    };

    const updateCompetencyLevel = (listType: string, compId: string, level: number) => {
        const list = formData[listType] || [];
        const newList = list.map((c: any) => (c.id === compId ? { ...c, level } : c));
        setFormData({ ...formData, [listType]: newList });
    };

    const handleRoleSelect = (roleId: string) => {
        setFormData({ ...formData, aspirationalRoleId: roleId });
        const role = roles.find((r) => r.id === roleId);
        if (role?.competencies) {
            const tech = role.competencies
                .filter((rc: any) => rc.competency?.category === "TECHNICAL")
                .map((rc: any) => ({ id: rc.competency.id, name: rc.competency.name, level: 3 }));
            const behav = role.competencies
                .filter((rc: any) => rc.competency?.category === "BEHAVIORAL")
                .map((rc: any) => ({ id: rc.competency.id, name: rc.competency.name, level: 3 }));
            if (formData.aspirationalTech.length === 0)
                setFormData((prev: any) => ({ ...prev, aspirationalTech: tech }));
            if (formData.aspirationalBehav.length === 0)
                setFormData((prev: any) => ({ ...prev, aspirationalBehav: behav }));
        }
    };

    const renderCompetencySelector = (listKey: string, category: string, label: string) => {
        const filtered = competencies.filter((c) => c.category === category);
        const selectedIds = new Set(formData[listKey]?.map((c: any) => c.id));

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>{label}</Label>
                    <span className="text-xs text-gray-500">{formData[listKey]?.length || 0} selected</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto border p-2 rounded-md">
                    {filtered.map((comp) => (
                        <div
                            key={comp.id}
                            className={cn(
                                "p-3 rounded-lg border cursor-pointer transition-colors",
                                selectedIds.has(comp.id) ? "bg-indigo-50 border-indigo-200" : "hover:bg-gray-50"
                            )}
                            onClick={() => toggleCompetency(listKey, comp.id, comp.name)}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium">{comp.name}</span>
                                {selectedIds.has(comp.id) && <span className="text-indigo-600 text-xs font-bold">✓</span>}
                            </div>
                            {selectedIds.has(comp.id) && (
                                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                    <Label className="text-xs text-gray-500">Proficiency Level (1-5)</Label>
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((lvl) => (
                                            <button
                                                key={lvl}
                                                className={cn(
                                                    "w-6 h-6 rounded-full text-xs flex items-center justify-center",
                                                    formData[listKey]?.find((c: any) => c.id === comp.id)?.level === lvl
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-gray-200 text-gray-600"
                                                )}
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
                    {filtered.length === 0 && (
                        <p className="text-sm text-gray-500 italic p-4">No competencies found in this category.</p>
                    )}
                </div>
            </div>
        );
    };

    if (loading)
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin" />
            </div>
        );

    const completedCount = completedTabs.size;
    const progress = (completedCount / TAB_IDS.length) * 100;

    if (isViewMode && completedCount === TAB_IDS.length) {
        const currentRole = roles.find((r: any) => r.id === formData.currentRoleId);
        const aspirationalRole = roles.find((r: any) => r.id === formData.aspirationalRoleId);
        const sa = formData.selfAssessment;
        const lp = formData.learningPreferences;
        const lpList = Array.isArray(lp?.selected) ? lp.selected : [];
        const lpOther = lp?.other?.trim() ?? "";
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold">My Career Profile – Complete</span>
                    </div>
                    <Button onClick={() => setIsViewMode(false)} variant="outline" className="gap-2">
                        <Pencil className="h-4 w-4" /> Edit profile
                    </Button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p><span className="text-muted-foreground">Name:</span> {profile?.name ?? "—"}</p>
                            <p><span className="text-muted-foreground">Email:</span> {profile?.email ?? "—"}</p>
                            <p><span className="text-muted-foreground">Phone:</span> {formData.phone || "—"}</p>
                            {formData.bio && <p><span className="text-muted-foreground">Bio:</span> {formData.bio}</p>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Current Role</CardTitle></CardHeader>
                        <CardContent className="text-sm">{currentRole?.name ?? "—"}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Responsibilities</CardTitle></CardHeader>
                        <CardContent className="text-sm whitespace-pre-wrap">{formData.responsibilities || "—"}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Tech Competencies</CardTitle></CardHeader>
                        <CardContent className="text-sm">
                            {Array.isArray(formData.techCompetencies) && formData.techCompetencies.length > 0
                                ? formData.techCompetencies.map((c: any) => c.name).join(", ")
                                : "—"}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Behavioral Competencies</CardTitle></CardHeader>
                        <CardContent className="text-sm">
                            {Array.isArray(formData.behavCompetencies) && formData.behavCompetencies.length > 0
                                ? formData.behavCompetencies.map((c: any) => c.name).join(", ")
                                : "—"}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Aspirational Role</CardTitle></CardHeader>
                        <CardContent className="text-sm">{aspirationalRole?.name ?? "—"}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Aspirational Tech / Behavioral</CardTitle></CardHeader>
                        <CardContent className="text-sm">
                            Tech: {Array.isArray(formData.aspirationalTech) && formData.aspirationalTech.length > 0
                                ? formData.aspirationalTech.map((c: any) => c.name).join(", ") : "—"}
                            <br />
                            Behavioral: {Array.isArray(formData.aspirationalBehav) && formData.aspirationalBehav.length > 0
                                ? formData.aspirationalBehav.map((c: any) => c.name).join(", ") : "—"}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Learning Preferences</CardTitle></CardHeader>
                        <CardContent className="text-sm">
                            {lpList.length > 0 ? lpList.join(", ") : ""}
                            {lpList.length > 0 && lpOther ? " • " : ""}
                            {lpOther || (lpList.length === 0 ? "—" : "")}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Self Assessment</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                            {sa?.performanceRating && sa.performanceRating !== SELECT_PLACEHOLDER_VALUE && (
                                <p><span className="text-muted-foreground">Performance:</span> {SELF_ASSESSMENT_RATINGS.find(r => r.value === sa.performanceRating)?.label ?? sa.performanceRating}</p>
                            )}
                            {Array.isArray(sa?.strengths) && sa.strengths.length > 0 && (
                                <p><span className="text-muted-foreground">Strengths:</span> {sa.strengths.join(", ")}</p>
                            )}
                            {Array.isArray(sa?.areasToImprove) && sa.areasToImprove.length > 0 && (
                                <p><span className="text-muted-foreground">Areas to improve:</span> {sa.areasToImprove.join(", ")}</p>
                            )}
                            {sa?.motivation && sa.motivation !== SELECT_PLACEHOLDER_VALUE && (
                                <p><span className="text-muted-foreground">Motivation:</span> {SELF_ASSESSMENT_MOTIVATION.find(m => m.value === sa.motivation)?.label ?? sa.motivation}{sa?.motivation === "other" && sa.motivationOther ? ` – ${sa.motivationOther}` : ""}</p>
                            )}
                            {sa?.vision?.trim() && <p><span className="text-muted-foreground">Vision:</span> {sa.vision}</p>}
                            {!sa?.performanceRating && !(sa?.strengths?.length) && !(sa?.areasToImprove?.length) && !sa?.motivation && !sa?.vision?.trim() && "—"}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                    <span>
                        {completedCount} of {TAB_IDS.length} sections completed
                    </span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex flex-wrap h-auto gap-1 p-2 bg-gray-100 rounded-xl w-full justify-start">
                    {TAB_IDS.map((tabId, idx) => {
                        const enabled = isTabEnabled(tabId);
                        const isComplete = completedTabs.has(tabId);
                        return (
                            <TabsTrigger
                                key={tabId}
                                value={tabId}
                                disabled={!enabled}
                                className={cn(
                                    "rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm",
                                    !enabled && "opacity-50 cursor-not-allowed",
                                    isComplete && "text-green-600"
                                )}
                            >
                                {idx + 1}. {TAB_LABELS[tabId]}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                <Card className="mt-6 min-h-[420px] flex flex-col">
                    <CardHeader>
                        <CardTitle>{TAB_LABELS[activeTab as keyof typeof TAB_LABELS]}</CardTitle>
                        <CardDescription>
                            Fill out the details and click Save to unlock the next section.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <TabsContent value="info" className="mt-0">
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
                                        <Input
                                            value={formData.phone ?? ""}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
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
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Brief summary of your professional background..."
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="current-role" className="mt-0">
                            <div className="space-y-4">
                                <Label>Current Role</Label>
                                <p className="text-sm text-gray-500">
                                    {isB2C
                                        ? "Select your current role from the list below. If you don't see your role, you can request one to be created for you."
                                        : "Your role is assigned by your Team Lead or Department Head. If you don't have a role yet, request one below."}
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
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InlineRoleRequestForm
                                    context="current"
                                    tenantSlug={tenantSlug}
                                    tenantId={tenantId}
                                    isB2C={isB2C}
                                    compact
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="responsibilities" className="mt-0">
                            <div className="space-y-2">
                                <Label>Current Responsibilities</Label>
                                <Textarea
                                    className="h-64"
                                    value={formData.responsibilities ?? ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, responsibilities: e.target.value })
                                    }
                                    placeholder="List your key responsibilities and daily tasks..."
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="tech" className="mt-0">
                            {renderCompetencySelector("techCompetencies", "TECHNICAL", "Select your Technical Competencies")}
                        </TabsContent>

                        <TabsContent value="behav" className="mt-0">
                            {renderCompetencySelector("behavCompetencies", "BEHAVIORAL", "Select your Behavioral Competencies")}
                        </TabsContent>

                        <TabsContent value="aspirational-role" className="mt-0">
                            <div className="space-y-4">
                                <Label>Select Aspirational Role</Label>
                                <Select
                                    value={formData.aspirationalRoleId ?? ""}
                                    onValueChange={handleRoleSelect}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-500">
                                    {isB2C
                                        ? "Select your aspirational role from the list below, or request one to be created for you."
                                        : "Choosing a role will suggest relevant competencies for your development plan."}
                                </p>
                                <InlineRoleRequestForm
                                    context="aspirational"
                                    tenantSlug={tenantSlug}
                                    tenantId={tenantId}
                                    isB2C={isB2C}
                                    compact
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="aspirational-tech" className="mt-0">
                            {renderCompetencySelector(
                                "aspirationalTech",
                                "TECHNICAL",
                                "Technical Competencies to Develop"
                            )}
                        </TabsContent>

                        <TabsContent value="aspirational-behav" className="mt-0">
                            {renderCompetencySelector(
                                "aspirationalBehav",
                                "BEHAVIORAL",
                                "Behavioral Competencies to Develop"
                            )}
                        </TabsContent>

                        <TabsContent value="learning" className="mt-0">
                            <div className="space-y-4">
                                <Label>Learning Preferences</Label>
                                <p className="text-sm text-muted-foreground">
                                    Select all that apply. How do you prefer to learn?
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {LEARNING_PREFERENCE_OPTIONS.map((option) => {
                                        const selected = (formData.learningPreferences?.selected ?? []).includes(option);
                                        return (
                                            <div
                                                key={option}
                                                className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                                            >
                                                <Checkbox
                                                    id={`lp-${option}`}
                                                    checked={selected}
                                                    onCheckedChange={(checked) => {
                                                        const prev = formData.learningPreferences?.selected ?? [];
                                                        const next = checked
                                                            ? [...prev, option]
                                                            : prev.filter((x: string) => x !== option);
                                                        setFormData({
                                                            ...formData,
                                                            learningPreferences: {
                                                                ...formData.learningPreferences,
                                                                selected: next,
                                                                other: formData.learningPreferences?.other ?? "",
                                                            },
                                                        });
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`lp-${option}`}
                                                    className="text-sm font-medium leading-none cursor-pointer flex-1"
                                                >
                                                    {option}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="learning-other" className="text-muted-foreground">
                                        Other (optional)
                                    </Label>
                                    <Input
                                        id="learning-other"
                                        placeholder="e.g. Podcasts, Conferences..."
                                        value={formData.learningPreferences?.other ?? ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                learningPreferences: {
                                                    ...formData.learningPreferences,
                                                    selected: formData.learningPreferences?.selected ?? [],
                                                    other: e.target.value,
                                                },
                                            })
                                        }
                                        className="max-w-md"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="self-assessment" className="mt-0">
                            <div className="space-y-6">
                                <div>
                                    <Label>Self Assessment</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Reflect on your current performance, strengths, and areas to develop.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sa-rating">How would you rate your current performance?</Label>
                                    <Select
                                        value={formData.selfAssessment?.performanceRating || SELECT_PLACEHOLDER_VALUE}
                                        onValueChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                selfAssessment: {
                                                    ...formData.selfAssessment,
                                                    performanceRating: v === SELECT_PLACEHOLDER_VALUE ? "" : v,
                                                },
                                            })
                                        }
                                    >
                                        <SelectTrigger id="sa-rating" className="max-w-md">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SELF_ASSESSMENT_RATINGS.map((r) => (
                                                <SelectItem key={r.value} value={r.value}>
                                                    {r.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Key strengths (select all that apply)</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {SELF_ASSESSMENT_STRENGTHS.map((option) => {
                                            const selected = (formData.selfAssessment?.strengths ?? []).includes(option);
                                            return (
                                                <div key={option} className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-muted/50">
                                                    <Checkbox
                                                        id={`sa-str-${option}`}
                                                        checked={selected}
                                                        onCheckedChange={(checked) => {
                                                            const prev = formData.selfAssessment?.strengths ?? [];
                                                            const next = checked ? [...prev, option] : prev.filter((x: string) => x !== option);
                                                            setFormData({
                                                                ...formData,
                                                                selfAssessment: { ...formData.selfAssessment, strengths: next },
                                                            });
                                                        }}
                                                    />
                                                    <label htmlFor={`sa-str-${option}`} className="text-sm cursor-pointer flex-1">
                                                        {option}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Areas to improve (select all that apply)</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {SELF_ASSESSMENT_AREAS.map((option) => {
                                            const selected = (formData.selfAssessment?.areasToImprove ?? []).includes(option);
                                            return (
                                                <div key={option} className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-muted/50">
                                                    <Checkbox
                                                        id={`sa-area-${option}`}
                                                        checked={selected}
                                                        onCheckedChange={(checked) => {
                                                            const prev = formData.selfAssessment?.areasToImprove ?? [];
                                                            const next = checked ? [...prev, option] : prev.filter((x: string) => x !== option);
                                                            setFormData({
                                                                ...formData,
                                                                selfAssessment: { ...formData.selfAssessment, areasToImprove: next },
                                                            });
                                                        }}
                                                    />
                                                    <label htmlFor={`sa-area-${option}`} className="text-sm cursor-pointer flex-1">
                                                        {option}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sa-motivation">What motivates you most?</Label>
                                    <Select
                                        value={formData.selfAssessment?.motivation || SELECT_PLACEHOLDER_VALUE}
                                        onValueChange={(v) =>
                                            setFormData({
                                                ...formData,
                                                selfAssessment: {
                                                    ...formData.selfAssessment,
                                                    motivation: v === SELECT_PLACEHOLDER_VALUE ? "" : v,
                                                },
                                            })
                                        }
                                    >
                                        <SelectTrigger id="sa-motivation" className="max-w-md">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SELF_ASSESSMENT_MOTIVATION.map((m) => (
                                                <SelectItem key={m.value} value={m.value}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {(formData.selfAssessment?.motivation === "other") && (
                                        <Input
                                            placeholder="Please specify..."
                                            value={formData.selfAssessment?.motivationOther ?? ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    selfAssessment: { ...formData.selfAssessment, motivationOther: e.target.value },
                                                })
                                            }
                                            className="max-w-md mt-2"
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sa-vision">Career vision / additional comments (optional)</Label>
                                    <Textarea
                                        id="sa-vision"
                                        className="min-h-[120px]"
                                        value={formData.selfAssessment?.vision ?? ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                selfAssessment: { ...formData.selfAssessment, vision: e.target.value },
                                            })
                                        }
                                        placeholder="Where do you see yourself in 2–3 years? Any other comments on your performance and goals..."
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const idx = TAB_IDS.indexOf(activeTab as any);
                                if (idx > 0) setActiveTab(TAB_IDS[idx - 1]);
                            }}
                            disabled={activeTab === "info"}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => handleSave(false)} disabled={saving}>
                                {saving ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4 text-gray-500" />
                                )}
                            </Button>
                            <Button onClick={() => handleSave(true, true)} disabled={saving}>
                                Save & Continue
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </Tabs>
        </div>
    );
}

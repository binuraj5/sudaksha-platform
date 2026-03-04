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
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Save, Pencil, CheckCircle2, BookOpen, Star, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { RoleRequestForm } from "@/components/Roles/RoleRequestForm";
import { cn } from "@/lib/utils";

// ── Tab configuration (now 5 tabs) ─────────────────────────────────────────
const TAB_IDS = [
    "info",
    "current-role",
    "aspirational-role",
    "learning",
    "self-assessment",
] as const;

type TabId = (typeof TAB_IDS)[number];

const TAB_LABELS: Record<TabId, string> = {
    info: "Basic Info",
    "current-role": "Current Role",
    "aspirational-role": "Aspirational Role",
    learning: "Learning Preferences",
    "self-assessment": "Self-Assessment",
};

const SELECT_PLACEHOLDER_VALUE = "__none__";

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

// ── Helpers ─────────────────────────────────────────────────────────────────
function getCompletedTabsFromData(data: any, savedForm: any): Set<string> {
    const completed = new Set<string>();
    if (!data) return completed;
    if (data.phone || data.bio) completed.add("info");
    if (data.currentRoleId) completed.add("current-role");
    if (data.aspirationalRoleId) completed.add("aspirational-role");
    const lp = savedForm?.learningPreferences;
    if ((lp?.selected?.length ?? 0) > 0 || lp?.other?.trim()) completed.add("learning");
    if (Array.isArray(savedForm?.selfAssessmentScores) && savedForm.selfAssessmentScores.length > 0) completed.add("self-assessment");
    return completed;
}

// ── Role Request Dialog ─────────────────────────────────────────────────────
function RoleRequestDialog({ tenantId, label }: { tenantId: string; label: string }) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <PlusCircle className="h-3.5 w-3.5" />
                    Request a new {label}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Request a {label}</DialogTitle>
                </DialogHeader>
                <RoleRequestForm clientId={tenantId} />
            </DialogContent>
        </Dialog>
    );
}

// ── Main component ──────────────────────────────────────────────────────────
export function ProfileWizard({
    tenantSlug,
    tenantId,
    isB2C,
}: {
    tenantSlug?: string;
    tenantId?: string;
    isB2C?: boolean;
}) {
    const [activeTab, setActiveTab] = useState<string>("info");
    const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());
    const [isViewMode, setIsViewMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [roles, setRoles] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        phone: "",
        bio: "",
        currentRoleId: "",
        additionalResponsibilities: "",
        aspirationalRoleId: "",
        aspirationalAdditionalResponsibilities: "",
        learningPreferences: { selected: [] as string[], other: "" },
        selfAssessmentScores: [] as Array<{ competencyId: string; name: string; category: string; rating: number; note: string }>,
    });

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
                    additionalResponsibilities: savedForm.additionalResponsibilities || savedForm.responsibilities || "",
                    aspirationalRoleId: data.aspirationalRoleId || "",
                    aspirationalAdditionalResponsibilities: savedForm.aspirationalAdditionalResponsibilities || "",
                    learningPreferences: (() => {
                        const lp = savedForm.learningPreferences;
                        if (lp && Array.isArray(lp.selected)) return { selected: lp.selected, other: lp.other ?? "" };
                        if (typeof lp === "string" && lp.trim()) return { selected: [], other: lp };
                        return { selected: [], other: "" };
                    })(),
                    selfAssessmentScores: Array.isArray(savedForm.selfAssessmentScores) ? savedForm.selfAssessmentScores : [],
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
            const lp = formData.learningPreferences;
            const payload = {
                phone: formData.phone,
                bio: formData.bio,
                currentRoleId: formData.currentRoleId || null,
                aspirationalRoleId: formData.aspirationalRoleId || null,
                careerFormData: {
                    additionalResponsibilities: formData.additionalResponsibilities,
                    aspirationalAdditionalResponsibilities: formData.aspirationalAdditionalResponsibilities,
                    learningPreferences: lp && typeof lp === "object"
                        ? { selected: lp.selected ?? [], other: lp.other ?? "" }
                        : { selected: [], other: String(lp ?? "") },
                    selfAssessmentScores: formData.selfAssessmentScores ?? [],
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
                    const idx = TAB_IDS.indexOf(activeTab as TabId);
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
        const idx = TAB_IDS.indexOf(tabId as TabId);
        if (idx <= 0) return true;
        return completedTabs.has(TAB_IDS[idx - 1]);
    };

    // ── Self-assessment competency list ───────────────────────────────────
    const getSelfAssessmentCompetencies = () => {
        const seen = new Set<string>();
        const result: Array<{ id: string; name: string; category: string; source: "current" | "aspirational" | "both" }> = [];
        const currentComps: any[] = profile?.currentRole?.competencies ?? [];
        const aspComps: any[] = profile?.aspirationalRole?.competencies ?? [];
        for (const rc of currentComps) {
            const comp = rc.competency ?? rc;
            if (!seen.has(comp.id)) { seen.add(comp.id); result.push({ id: comp.id, name: comp.name, category: comp.category || "TECHNICAL", source: "current" }); }
        }
        for (const rc of aspComps) {
            const comp = rc.competency ?? rc;
            if (!seen.has(comp.id)) { seen.add(comp.id); result.push({ id: comp.id, name: comp.name, category: comp.category || "TECHNICAL", source: "aspirational" }); }
            else { const ex = result.find(r => r.id === comp.id); if (ex) ex.source = "both"; }
        }
        return result;
    };

    const updateSelfAssessmentScore = (competencyId: string, name: string, category: string, rating: number, note?: string) => {
        const scores: any[] = formData.selfAssessmentScores ?? [];
        const existing = scores.find((s: any) => s.competencyId === competencyId);
        const next = existing
            ? scores.map((s: any) => s.competencyId === competencyId ? { ...s, rating, note: note ?? s.note } : s)
            : [...scores, { competencyId, name, category, rating, note: note ?? "" }];
        setFormData((prev: any) => ({ ...prev, selfAssessmentScores: next }));
    };

    const updateSelfAssessmentNote = (competencyId: string, note: string) => {
        setFormData((prev: any) => ({
            ...prev,
            selfAssessmentScores: (prev.selfAssessmentScores ?? []).map((s: any) =>
                s.competencyId === competencyId ? { ...s, note } : s
            ),
        }));
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    const completedCount = completedTabs.size;
    const progress = (completedCount / TAB_IDS.length) * 100;

    // Derive role objects from selected dropdown values (falling back to profile state if not in list)
    const currentRoleObj = roles.find(r => r.id === formData.currentRoleId) || profile?.currentRole;
    const aspirationalRoleObj = roles.find(r => r.id === formData.aspirationalRoleId) || profile?.aspirationalRole;

    // Org responsibilities: prefer keyResponsibilities, fallback to description
    const currentOrgResp = currentRoleObj?.keyResponsibilities || currentRoleObj?.description || null;
    const aspirationalOrgResp = aspirationalRoleObj?.keyResponsibilities || aspirationalRoleObj?.description || null;

    const categoryColor: Record<string, string> = {
        TECHNICAL: "bg-blue-100 text-blue-700",
        BEHAVIORAL: "bg-purple-100 text-purple-700",
        COGNITIVE: "bg-amber-100 text-amber-700",
        DOMAIN_SPECIFIC: "bg-green-100 text-green-700",
    };

    // ── View mode ─────────────────────────────────────────────────────────
    if (isViewMode && completedCount === TAB_IDS.length) {
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
                    <Card><CardHeader className="pb-2"><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p><span className="text-muted-foreground">Name:</span> {profile?.name ?? "—"}</p>
                            <p><span className="text-muted-foreground">Email:</span> {profile?.email ?? "—"}</p>
                            <p><span className="text-muted-foreground">Phone:</span> {formData.phone || "—"}</p>
                            {formData.bio && <p><span className="text-muted-foreground">Bio:</span> {formData.bio}</p>}
                        </CardContent>
                    </Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-base">Current Role</CardTitle></CardHeader>
                        <CardContent className="text-sm">{currentRoleObj?.name ?? "—"}</CardContent>
                    </Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-base">Aspirational Role</CardTitle></CardHeader>
                        <CardContent className="text-sm">{aspirationalRoleObj?.name ?? "—"}</CardContent>
                    </Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-base">Learning Preferences</CardTitle></CardHeader>
                        <CardContent className="text-sm">
                            {lpList.length > 0 ? lpList.join(", ") : ""}{lpList.length > 0 && lpOther ? " • " : ""}{lpOther || (lpList.length === 0 ? "—" : "")}
                        </CardContent>
                    </Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-base">Self-Assessment</CardTitle></CardHeader>
                        <CardContent className="text-sm">{formData.selfAssessmentScores?.length > 0 ? `${formData.selfAssessmentScores.length} competencies rated` : "—"}</CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const selfAssessmentComps = getSelfAssessmentCompetencies();

    // ── Reusable Responsibilities section ─────────────────────────────────
    const ResponsibilitiesSection = ({
        orgRoleObj,
        additionalKey,
        placeholder,
    }: {
        orgRoleObj: any;
        additionalKey: "additionalResponsibilities" | "aspirationalAdditionalResponsibilities";
        placeholder: string;
    }) => {
        const orgResp = orgRoleObj?.keyResponsibilities || orgRoleObj?.description || null;
        return (
            <div className="space-y-5 mt-4 pt-4 border-t">
                {/* Org-assigned (read-only) */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-sm">Org-Assigned Responsibilities</span>
                        <Badge variant="outline" className="text-[10px] border-indigo-200 text-indigo-600">Read-only</Badge>
                    </div>
                    <p className="text-xs text-gray-500">Defined by your organization for <strong>{orgRoleObj?.name || "this role"}</strong>.</p>
                    {orgResp ? (
                        <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap min-h-[72px]">
                            {orgResp}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-dashed rounded-lg p-4 text-sm text-gray-400 italic">
                            {orgRoleObj ? "No org-defined responsibilities have been set for this role." : "Select a role above to see org-defined responsibilities."}
                        </div>
                    )}
                </div>

                {/* Personal additional responsibilities */}
                <div className="space-y-2">
                    <Label htmlFor={`additional-${additionalKey}`} className="font-semibold text-sm">Your Additional Responsibilities</Label>
                    <p className="text-xs text-gray-500">Add responsibilities unique to you — saved to your profile only, does not affect the role definition.</p>
                    <Textarea
                        id={`additional-${additionalKey}`}
                        className="min-h-[120px]"
                        value={formData[additionalKey] ?? ""}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, [additionalKey]: e.target.value }))}
                        placeholder={placeholder}
                    />
                </div>
            </div>
        );
    };

    // ── Main wizard render ────────────────────────────────────────────────
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                    <span>{completedCount} of {TAB_IDS.length} sections completed</span>
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
                        <CardTitle>{TAB_LABELS[activeTab as TabId]}</CardTitle>
                        <CardDescription>Fill out the details and click Save to unlock the next section.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">

                        {/* ── 1. Basic Info ─────────────────────────────────────────────── */}
                        <TabsContent value="info" className="mt-0">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Full Name</Label><Input value={profile?.name ?? ""} disabled className="bg-gray-50" /></div>
                                    <div className="space-y-2"><Label>Email</Label><Input value={profile?.email ?? ""} disabled className="bg-gray-50" /></div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input value={formData.phone ?? ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div className="space-y-2"><Label>Designation</Label><Input value={profile?.designation ?? ""} disabled className="bg-gray-50" /></div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Professional Bio</Label>
                                    <Textarea className="h-24" value={formData.bio ?? ""} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Brief summary of your professional background..." />
                                </div>
                            </div>
                        </TabsContent>

                        {/* ── 2. Current Role (includes Responsibilities) ───────────────── */}
                        <TabsContent value="current-role" className="mt-0">
                            <div className="space-y-4">
                                <div>
                                    <Label className="mb-1 block">Select Current Role</Label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        {isB2C
                                            ? "Select your current role from the list below."
                                            : "Your role is assigned by your Team Lead or Department Head. If you don't have a role yet, request one below."}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Select
                                            value={formData.currentRoleId ?? ""}
                                            onValueChange={(v) => setFormData((prev: any) => ({ ...prev, currentRoleId: v === SELECT_PLACEHOLDER_VALUE ? null : v }))}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select your current role..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={SELECT_PLACEHOLDER_VALUE}>-- None / Clear Role --</SelectItem>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {tenantId && (
                                            <RoleRequestDialog tenantId={tenantId} label="role" />
                                        )}
                                    </div>
                                </div>

                                {/* Responsibilities: only show once a role is selected */}
                                <ResponsibilitiesSection
                                    orgRoleObj={currentRoleObj}
                                    additionalKey="additionalResponsibilities"
                                    placeholder="e.g. Lead weekly team stand-ups, Coordinate with external vendors, Mentor junior staff..."
                                />
                            </div>
                        </TabsContent>

                        {/* ── 3. Aspirational Role (includes its Responsibilities) ─────── */}
                        <TabsContent value="aspirational-role" className="mt-0">
                            <div className="space-y-4">
                                <div>
                                    <Label className="mb-1 block">Select Aspirational Role</Label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        {isB2C
                                            ? "Select your aspirational role from the list below."
                                            : "Choosing a role will suggest relevant competencies for your development plan."}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Select
                                            value={formData.aspirationalRoleId ?? ""}
                                            onValueChange={(v) => setFormData((prev: any) => ({ ...prev, aspirationalRoleId: v }))}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select a role..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {tenantId && (
                                            <RoleRequestDialog tenantId={tenantId} label="aspirational role" />
                                        )}
                                    </div>
                                </div>

                                {/* Aspirational Role Responsibilities */}
                                <ResponsibilitiesSection
                                    orgRoleObj={aspirationalRoleObj}
                                    additionalKey="aspirationalAdditionalResponsibilities"
                                    placeholder="e.g. Skills and responsibilities I am working towards in this aspirational role..."
                                />
                            </div>
                        </TabsContent>

                        {/* ── 4. Learning Preferences ───────────────────────────────────── */}
                        <TabsContent value="learning" className="mt-0">
                            <div className="space-y-4">
                                <div>
                                    <Label className="block mb-1">Learning Preferences</Label>
                                    <p className="text-sm text-muted-foreground">Select all that apply. How do you prefer to learn?</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {LEARNING_PREFERENCE_OPTIONS.map((option) => {
                                        const selected = (formData.learningPreferences?.selected ?? []).includes(option);
                                        return (
                                            <div key={option} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                                                <Checkbox
                                                    id={`lp-${option}`}
                                                    checked={selected}
                                                    onCheckedChange={(checked) => {
                                                        const prev = formData.learningPreferences?.selected ?? [];
                                                        const next = checked ? [...prev, option] : prev.filter((x: string) => x !== option);
                                                        setFormData((f: any) => ({ ...f, learningPreferences: { ...f.learningPreferences, selected: next } }));
                                                    }}
                                                />
                                                <label htmlFor={`lp-${option}`} className="text-sm font-medium leading-none cursor-pointer flex-1">{option}</label>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="learning-other" className="text-muted-foreground">Other (optional)</Label>
                                    <Input
                                        id="learning-other"
                                        placeholder="e.g. Podcasts, Conferences..."
                                        value={formData.learningPreferences?.other ?? ""}
                                        onChange={(e) => setFormData((f: any) => ({ ...f, learningPreferences: { ...f.learningPreferences, selected: f.learningPreferences?.selected ?? [], other: e.target.value } }))}
                                        className="max-w-md"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* ── 5. Self-Assessment (per-competency) ───────────────────────── */}
                        <TabsContent value="self-assessment" className="mt-0">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base block">Self-Assessment</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Rate your current proficiency (1 = beginner, 5 = expert) for each competency in your Current and Aspirational Roles.
                                    </p>
                                </div>

                                {selfAssessmentComps.length === 0 ? (
                                    <div className="rounded-lg border border-dashed p-8 text-center text-gray-400">
                                        <Star className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm">No competencies to rate yet.</p>
                                        <p className="text-xs mt-1">Select your Current Role and Aspirational Role first to see competencies here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                                        {selfAssessmentComps.map((comp) => {
                                            const score = (formData.selfAssessmentScores ?? []).find((s: any) => s.competencyId === comp.id);
                                            return (
                                                <div key={comp.id} className="rounded-lg border bg-white p-4 space-y-3">
                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <span className="font-medium text-sm text-gray-900 truncate">{comp.name}</span>
                                                            <Badge className={cn("text-[10px] shrink-0", categoryColor[comp.category] ?? "bg-gray-100 text-gray-600")}>{comp.category}</Badge>
                                                            <Badge variant="outline" className="text-[10px] shrink-0 text-gray-400">
                                                                {comp.source === "both" ? "Current & Aspirational" : comp.source === "current" ? "Current Role" : "Aspirational Role"}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            {[1, 2, 3, 4, 5].map((lvl) => (
                                                                <button
                                                                    key={lvl}
                                                                    type="button"
                                                                    onClick={() => updateSelfAssessmentScore(comp.id, comp.name, comp.category, lvl, score?.note)}
                                                                    className={cn(
                                                                        "w-8 h-8 rounded-full text-xs font-semibold transition-colors border",
                                                                        score?.rating === lvl
                                                                            ? "bg-indigo-600 text-white border-indigo-600"
                                                                            : "bg-white text-gray-500 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                                                                    )}
                                                                >
                                                                    {lvl}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <Input
                                                        placeholder="Optional note (e.g. 'Led 3 major projects')"
                                                        value={score?.note ?? ""}
                                                        onChange={(e) => {
                                                            if (!score) updateSelfAssessmentScore(comp.id, comp.name, comp.category, 0, e.target.value);
                                                            else updateSelfAssessmentNote(comp.id, e.target.value);
                                                        }}
                                                        className="text-xs h-8"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const idx = TAB_IDS.indexOf(activeTab as TabId);
                                if (idx > 0) setActiveTab(TAB_IDS[idx - 1]);
                            }}
                            disabled={activeTab === "info"}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => handleSave(false)} disabled={saving}>
                                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 text-gray-500" />}
                            </Button>
                            <Button onClick={() => handleSave(true, true)} disabled={saving}>
                                Save &amp; Continue
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </Tabs>
        </div>
    );
}

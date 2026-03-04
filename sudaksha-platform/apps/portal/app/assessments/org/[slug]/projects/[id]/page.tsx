"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save, X } from "lucide-react";

export default function EditProjectPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const projectId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [project, setProject] = useState<any>(null);
    const [clientId, setClientId] = useState<string>("");

    // Form data state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "",
        priority: "",
        startDate: "",
        endDate: "",
        ownerId: "",
        departmentIds: [] as string[]
    });

    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                // First get tenant info to get clientId
                const sessionRes = await fetch('/api/auth/session');
                const session = await sessionRes.json();
                const tid = session?.user?.tenantId || session?.user?.clientId;
                if (!tid) throw new Error("Could not find tenant context");
                setClientId(tid);

                // Fetch options
                const [depsRes, mgrsRes, projRes] = await Promise.all([
                    fetch(`/api/clients/${tid}/departments?status=active`),
                    fetch(`/api/clients/${tid}/employees?simple=true`),
                    fetch(`/api/clients/${tid}/projects/${projectId}`)
                ]);

                if (depsRes.ok) setDepartments(await depsRes.json());
                if (mgrsRes.ok) setManagers(await mgrsRes.json());

                if (projRes.ok) {
                    const data = await projRes.json();
                    setProject(data);

                    setFormData({
                        name: data.name || "",
                        description: data.description || "",
                        status: data.status || "PLANNED",
                        priority: data.priority || "MEDIUM",
                        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "",
                        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "",
                        ownerId: data.ownerId || "",
                        departmentIds: data.orgUnits?.map((ou: any) => ou.orgUnitId) || []
                    });
                } else {
                    toast.error("Failed to load project details");
                }
            } catch (err) {
                console.error(err);
                toast.error("Error loading project data");
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...formData,
                // If the user clears the owner, pass null instead of empty string
                ownerId: formData.ownerId === "unassigned" || !formData.ownerId ? null : formData.ownerId
            };

            const res = await fetch(`/api/clients/${clientId}/projects/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Project updated successfully");
                router.refresh();
                router.push(`/assessments/org/${slug}/projects`);
            } else {
                toast.error("Failed to update project");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error saving changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!project) return <div className="p-8">Project not found.</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/assessments/org/${slug}/projects`)}
                        className="h-10 w-10 bg-gray-100 hover:bg-gray-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 leading-none">Edit Project</h1>
                        <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-wider">ID: {project.code || project.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => router.push(`/assessments/org/${slug}/projects`)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-navy-700 hover:bg-navy-800">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Primary details for this project.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Project Name <span className="text-red-500">*</span></Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Q3 Hiring Drive"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Provide context and goals for this project..."
                                    className="min-h-[120px]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline & Planning</CardTitle>
                            <CardDescription>Schedule and ownership details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Start Date <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Project Manager</Label>
                                <Select
                                    value={formData.ownerId || "unassigned"}
                                    onValueChange={(v) => setFormData({ ...formData, ownerId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Assign a manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {managers.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Current State</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PLANNED">Planned</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Priority Level</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(v) => setFormData({ ...formData, priority: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="LOW">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment</CardTitle>
                            <CardDescription>Departments participating in this project.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Departments</Label>
                                <Select onValueChange={(v) => {
                                    if (!formData.departmentIds.includes(v)) {
                                        setFormData({ ...formData, departmentIds: [...formData.departmentIds, v] })
                                    }
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Link another department..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.departmentIds.length === 0 && (
                                        <span className="text-xs text-gray-400 italic">No departments linked.</span>
                                    )}
                                    {formData.departmentIds.map(id => {
                                        const d = departments.find(x => x.id === id);
                                        return d ? (
                                            <div key={id} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 text-xs rounded-full">
                                                <span>{d.name}</span>
                                                <X
                                                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                                                    onClick={() => setFormData({ ...formData, departmentIds: formData.departmentIds.filter((did) => did !== id) })}
                                                />
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

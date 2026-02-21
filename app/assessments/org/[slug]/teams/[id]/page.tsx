"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save, Trash2, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditTeamPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const teamId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [team, setTeam] = useState<any>(null);
    const [clientId, setClientId] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        managerId: "",
        parentId: "" // For Department
    });

    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [allEmployees, setAllEmployees] = useState<{ id: string; name: string; orgUnitId: string | null }[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    // Project Assignment Mapping
    const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
    const [assigningProjects, setAssigningProjects] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                // Get session context first
                const sessionRes = await fetch('/api/auth/session');
                const session = await sessionRes.json();
                const tid = session?.user?.tenantId || session?.user?.clientId;
                if (!tid) throw new Error("Could not find tenant context");
                setClientId(tid);

                const [teamRes, deptsRes, empRes, projRes] = await Promise.all([
                    fetch(`/api/clients/${tid}/teams/${teamId}`),
                    fetch(`/api/clients/${tid}/departments?status=active`),
                    fetch(`/api/clients/${tid}/employees`),
                    fetch(`/api/clients/${tid}/projects`)
                ]);

                if (deptsRes.ok) setDepartments(await deptsRes.json());

                if (projRes.ok) {
                    const pjData = await projRes.json();
                    if (Array.isArray(pjData)) setProjects(pjData);
                    else if (pjData.data) setProjects(pjData.data);
                }

                if (empRes.ok) {
                    const data = await empRes.json();
                    const emps = Array.isArray(data) ? data : (data.data || []);
                    setAllEmployees(emps.map((e: any) => ({ id: e.id, name: e.name, orgUnitId: e.orgUnitId })));
                }

                if (teamRes.ok) {
                    const data = await teamRes.json();
                    setTeam(data);

                    setFormData({
                        name: data.name || "",
                        code: data.code || "",
                        description: data.description || "",
                        managerId: data.managerId || "unassigned",
                        parentId: data.parentId || "unassigned"
                    });

                    // Seed existing members from the team payload
                    const members = data.members?.map((m: any) => m.id) || [];
                    setSelectedMembers(members);
                } else {
                    toast.error("Failed to load team data");
                }
            } catch (err) {
                console.error(err);
                toast.error("Error loading view");
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTeamData();
        }
    }, [teamId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Patch the main Team object using the central org-units API
            const updatePayload = {
                name: formData.name,
                code: formData.code,
                description: formData.description,
                managerId: formData.managerId === "unassigned" ? null : formData.managerId,
                parentId: formData.parentId === "unassigned" ? null : formData.parentId,
            };

            const res = await fetch(`/api/v1/org-units/${teamId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatePayload)
            });

            if (!res.ok) throw new Error("Failed to update team details");

            // 2. Sync members
            const membersRes = await fetch(`/api/clients/${clientId}/teams/${teamId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberIds: selectedMembers })
            });

            if (!membersRes.ok) throw new Error("Failed to sync team members");

            toast.success("Team updated successfully");
            router.refresh();
            router.push(`/assessments/org/${slug}/teams`);

        } catch (err) {
            console.error(err);
            toast.error("Error saving changes");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this team? All members will be unassigned.")) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/v1/org-units/${teamId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("Team deleted");
                router.refresh();
                router.push(`/assessments/org/${slug}/teams`);
            } else {
                toast.error("Failed to delete team");
            }
        } catch (err) {
            toast.error("Error deleting team");
        } finally {
            setSaving(false);
        }
    };

    const handleAssignTeamToProject = async () => {
        if (!selectedProjectId) return toast.info("Select a project first");
        setAssigningProjects(true);
        try {
            // By API rules, patching project employees replaces the array. We need to fetch it first.
            const pRes = await fetch(`/api/clients/${clientId}/projects/${selectedProjectId}`);
            if (!pRes.ok) throw new Error("Could not find project");
            const projectData = await pRes.json();

            const existingEmployess = projectData.members?.map((m: any) => m.memberId) || [];

            // Merge existing project members with this team's members to prevent data loss
            const combinedMemberIds = Array.from(new Set([...existingEmployess, ...selectedMembers]));

            const patchRes = await fetch(`/api/clients/${clientId}/projects/${selectedProjectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeIds: combinedMemberIds })
            });

            if (patchRes.ok) {
                toast.success("Team members successfully mapped to the project.");
                setSelectedProjectId("");
            } else {
                toast.error("Failed to map team to project.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error mapping team to project");
        } finally {
            setAssigningProjects(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!team) return <div className="p-8">Team not found.</div>;

    const availableEmployees = allEmployees.filter(emp => emp.orgUnitId === null || emp.orgUnitId === teamId);

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/assessments/org/${slug}/teams`)}
                        className="h-10 w-10 bg-gray-100 hover:bg-gray-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 leading-none">Edit Team</h1>
                        <p className="text-gray-500 font-medium mt-1 text-sm tracking-wider">Manage {team.name} operations</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-100" onClick={handleDelete} disabled={saving}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Team
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/assessments/org/${slug}/teams`)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-navy-700 hover:bg-navy-800">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Team Details</CardTitle>
                        <CardDescription>Main configuration for this organizational unit.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Team Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Team Code</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Department Assignment</Label>
                            <Select
                                value={formData.parentId}
                                onValueChange={(v) => setFormData({ ...formData, parentId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned / Top Level</SelectItem>
                                    {departments.map((d: any) => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Team Leader (Manager)</Label>
                            <Select
                                value={formData.managerId}
                                onValueChange={(v) => setFormData({ ...formData, managerId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Team Lead" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {allEmployees.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the focus of this team..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Team Roster</CardTitle>
                                <CardDescription>Manage active members.</CardDescription>
                            </div>
                            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                                <Users className="w-4 h-4" /> {selectedMembers.length}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 border rounded-md p-2 bg-gray-50/50">
                                {availableEmployees.length === 0 && (
                                    <div className="text-center text-sm text-gray-500 py-4">No employees available.</div>
                                )}
                                {availableEmployees.map((emp) => (
                                    <div key={emp.id} className="flex items-center space-x-2 py-1 px-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                                        <Checkbox
                                            id={`emp-${emp.id}`}
                                            checked={selectedMembers.includes(emp.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedMembers(prev => [...prev, emp.id]);
                                                else setSelectedMembers(prev => prev.filter(id => id !== emp.id));
                                            }}
                                        />
                                        <label htmlFor={`emp-${emp.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full">
                                            {emp.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                Note: Employees can only belong to one primary OrgUnit (Team or Department) at a time.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Project Assignments</CardTitle>
                            <CardDescription>Bulk assign this active roster to an existing Project.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Label>Target Project</Label>
                            <div className="flex gap-2">
                                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleAssignTeamToProject}
                                    disabled={assigningProjects || !selectedProjectId}
                                    variant="secondary"
                                >
                                    {assigningProjects ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

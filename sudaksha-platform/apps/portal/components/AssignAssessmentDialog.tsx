"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ClipboardCheck, Info } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Model {
    id: string;
    name: string;
    description: string;
    totalDuration: number;
}

interface Department {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
}

export function AssignAssessmentDialog({
    clientId,
    projectId
}: {
    clientId: string;
    projectId: string;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [models, setModels] = useState<Model[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [projectUsers, setProjectUsers] = useState<User[]>([]);

    const [selectedModel, setSelectedModel] = useState("");
    const [level, setLevel] = useState("PROJECT");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState("");
    const [isMandatory, setIsMandatory] = useState(true);

    const router = useRouter();

    useEffect(() => {
        if (open) {
            fetchInitialData();
        }
    }, [open]);

    const fetchInitialData = async () => {
        try {
            // Fetch Models
            const modelRes = await fetch(`/api/clients/${clientId}/available-models`);
            const modelData = await modelRes.json();
            setModels(modelData);

            // Fetch Departments for the project
            const deptRes = await fetch(`/api/clients/${clientId}/projects/${projectId}/departments`);
            const deptData = await deptRes.json();
            setDepartments(deptData);

            // Fetch Project Users (we might need a specific API for this, 
            // but for now let's assume we fetch all client users or project assigned users)
            const userRes = await fetch(`/api/clients/${clientId}/employees`);
            const userData = await userRes.json();
            // Filter users who are assigned to THIS project
            setProjectUsers(userData.filter((u: any) => u.projectId === projectId));

        } catch (error) {
            toast.error("Failed to load initial data");
        }
    };

    const handleAssign = async () => {
        if (!selectedModel) {
            toast.error("Please select an assessment model");
            return;
        }

        if (level === "DEPARTMENT" && !selectedDept) {
            toast.error("Please select a department");
            return;
        }

        if (level === "INDIVIDUAL" && selectedUsers.length === 0) {
            toast.error("Please select at least one employee");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/projects/${projectId}/assignments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelId: selectedModel,
                    assignmentLevel: level,
                    departmentId: level === "DEPARTMENT" ? selectedDept : null,
                    userIds: level === "INDIVIDUAL" ? selectedUsers : [],
                    dueDate,
                    isMandatory
                })
            });

            if (res.ok) {
                toast.success("Assessment assigned successfully");
                setOpen(false);
                router.refresh(); // Refresh parent view
            } else {
                const data = await res.json();
                toast.error(data.error?.message || data.error || "Failed to assign assessment");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Assessment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-blue-600" />
                        Assign Assessment Model
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Select Assessment Bundle</Label>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a model..." />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map(m => (
                                    <SelectItem key={m.id} value={m.id}>
                                        {m.name} ({m.totalDuration} mins)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedModel && (
                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                {models.find(m => m.id === selectedModel)?.description}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Assignment Target (Level)</Label>
                        <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PROJECT">Whole Project (All assigned employees)</SelectItem>
                                <SelectItem value="DEPARTMENT">Specific Department</SelectItem>
                                <SelectItem value="INDIVIDUAL">Specific Individuals</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {level === "DEPARTMENT" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                            <Label>Select Department</Label>
                            <Select value={selectedDept} onValueChange={setSelectedDept}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose department..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {level === "INDIVIDUAL" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                            <Label>Select Employees ({projectUsers.length} available in project)</Label>
                            <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                                {projectUsers.map(user => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`u-${user.id}`}
                                            checked={selectedUsers.includes(user.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedUsers([...selectedUsers, user.id]);
                                                else setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                            }}
                                        />
                                        <label htmlFor={`u-${user.id}`} className="text-sm cursor-pointer">{user.name}</label>
                                    </div>
                                ))}
                                {projectUsers.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-2">No employees assigned to this project yet.</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Due Date (Optional)</Label>
                            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <Checkbox
                                id="mandatory"
                                checked={isMandatory}
                                onCheckedChange={(c) => setIsMandatory(!!c)}
                            />
                            <Label htmlFor="mandatory" className="cursor-pointer">Mandatory</Label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleAssign}
                        disabled={loading || !selectedModel}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? "Assigning..." : "Assign Assessment"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function AssignSurveyDialog({
    open,
    onOpenChange,
    surveyId,
    surveyName
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    surveyId: string;
    surveyName: string;
}) {
    const params = useParams();
    const clientId = params.clientId as string;
    const [loading, setLoading] = useState(false);
    const [targetType, setTargetType] = useState("ALL");
    const [targetId, setTargetId] = useState("");
    const [dueDate, setDueDate] = useState("");

    // Mock data for dept/teams - in real app, fetch these
    const [departments, setDepartments] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            fetchTargets();
        }
    }, [open]);

    const fetchTargets = async () => {
        try {
            // Fetch depts and teams if needed
            // For now, placeholder or fetch from API if exists
        } catch (error) {
            console.error(error);
        }
    };

    const handleAssign = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/clients/${clientId}/surveys/${surveyId}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetType,
                    targetId,
                    dueDate,
                })
            });

            if (!res.ok) throw new Error("Failed to assign");

            toast.success(`Survey assigned successfully to ${targetType}`);
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to assign survey");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Survey</DialogTitle>
                    <DialogDescription>
                        Choose who should participate in "{surveyName}".
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Select value={targetType} onValueChange={setTargetType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Employees</SelectItem>
                                <SelectItem value="DEPARTMENT">Specific Department</SelectItem>
                                <SelectItem value="TEAM">Specific Team</SelectItem>
                                <SelectItem value="ROLE">Specific Role</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {targetType !== "ALL" && (
                        <div className="space-y-2">
                            <Label>{targetType.charAt(0) + targetType.slice(1).toLowerCase()}</Label>
                            <Select value={targetId} onValueChange={setTargetId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select ${targetType.toLowerCase()}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="placeholder-1">Engineering</SelectItem>
                                    <SelectItem value="placeholder-2">Marketing</SelectItem>
                                    <SelectItem value="placeholder-3">Operations</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={handleAssign}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading ? "Assigning..." : "Confirm Assignment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

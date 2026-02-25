"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AssignViaCSVDialog } from "./AssignViaCSVDialog";

type AssessmentModel = { id: string; name: string; description: string | null; sourceType: string };

export function AssignAssessmentDialog({
    open,
    onOpenChange,
    clientId,
    assessmentModel,
    onAssigned,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string; // Used as tenant slug or ID
    assessmentModel: AssessmentModel;
    onAssigned?: () => void;
}) {
    const [targetType, setTargetType] = useState<"INDIVIDUAL" | "CLASS" | "PROJECT" | "CSV">("INDIVIDUAL");
    const [projectId, setProjectId] = useState("");
    const [memberId, setMemberId] = useState("");
    const [orgUnitId, setOrgUnitId] = useState("");

    const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
    const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
    const [orgUnits, setOrgUnits] = useState<{ id: string; name: string }[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [csvDialogOpen, setCsvDialogOpen] = useState(false);

    useEffect(() => {
        if (!open || !clientId) return;

        // Fetch Projects
        fetch(`/api/clients/${clientId}/projects`)
            .then(r => r.json())
            .then(data => setProjects(Array.isArray(data) ? data : data?.projects || []))
            .catch(() => setProjects([]));

        // Fetch Individuals
        fetch(`/api/clients/${clientId}/employees?simple=true`)
            .then(r => r.json())
            .then(data => setMembers(Array.isArray(data) ? data : []))
            .catch(() => setMembers([]));

        // Fetch OrgUnits / Classes
        fetch(`/api/org/${clientId}/hierarchy`)
            .then(r => r.json())
            .then(data => setOrgUnits(Array.isArray(data) ? data : data?.units || []))
            .catch(() => setOrgUnits([]));

    }, [open, clientId]);

    const handleSubmit = async () => {
        if (targetType === "PROJECT" && !projectId) {
            toast.error("Select a project");
            return;
        }
        if (targetType === "CLASS" && !orgUnitId) {
            toast.error("Select a class/department");
            return;
        }
        if (targetType === "INDIVIDUAL" && !memberId) {
            toast.error("Select an individual");
            return;
        }
        if (targetType === "CSV") {
            setCsvDialogOpen(true);
            return;
        }

        setSubmitting(true);
        try {
            let url = `/api/clients/${clientId}/assessments/assign`;
            let body: any = {
                modelId: assessmentModel.id,
                targetType,
            };

            if (targetType === "PROJECT") {
                body.projectId = projectId;
            } else if (targetType === "CLASS") {
                // Class assignment uses a different endpoint in Phase B
                url = `/api/org/${clientId}/assessments/assign-unit`;
                body = {
                    assessmentModelId: assessmentModel.id,
                    orgUnitId: orgUnitId
                };
            } else {
                body.memberId = memberId;
            }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to assign");
            }

            toast.success("Assessment assigned successfully");
            onOpenChange(false);
            setProjectId("");
            setMemberId("");
            setOrgUnitId("");
            onAssigned?.();
        } catch (e: any) {
            toast.error(e.message || "Failed to assign assessment");
        } finally {
            setSubmitting(false);
        }
    };

    if (!assessmentModel) return null;

    return (
        <>
            <Dialog open={open && !csvDialogOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[550px] rounded-2xl bg-white p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-gray-50/80 p-6 border-b border-gray-100">
                        <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Assign Assessment</DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium">
                            Configure deployment targets for &quot;{assessmentModel.name}&quot;.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6">
                        <Tabs value={targetType} onValueChange={(v) => setTargetType(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 p-1 rounded-xl mb-6">
                                <TabsTrigger value="INDIVIDUAL" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Individual</TabsTrigger>
                                <TabsTrigger value="CLASS" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Class / Unit</TabsTrigger>
                                <TabsTrigger value="PROJECT" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Project</TabsTrigger>
                                <TabsTrigger value="CSV" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">CSV Upload</TabsTrigger>
                            </TabsList>

                            <div className="min-h-[140px]">
                                <TabsContent value="INDIVIDUAL" className="space-y-4 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Select Individual</Label>
                                        <Select value={memberId} onValueChange={setMemberId}>
                                            <SelectTrigger className="h-12 rounded-xl bg-gray-50/50 border-gray-200">
                                                <SelectValue placeholder="Search members..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-lg border-gray-100">
                                                {members.map(m => (
                                                    <SelectItem key={m.id} value={m.id} className="font-medium">{m.name}</SelectItem>
                                                ))}
                                                {members.length === 0 && (
                                                    <SelectItem value="_" disabled>No members found</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TabsContent>

                                <TabsContent value="CLASS" className="space-y-4 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Select Class or Department</Label>
                                        <Select value={orgUnitId} onValueChange={setOrgUnitId}>
                                            <SelectTrigger className="h-12 rounded-xl bg-gray-50/50 border-gray-200">
                                                <SelectValue placeholder="Hierarchy selection..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-lg border-gray-100">
                                                {orgUnits.map(unit => (
                                                    <SelectItem key={unit.id} value={unit.id} className="font-medium">{unit.name}</SelectItem>
                                                ))}
                                                {orgUnits.length === 0 && (
                                                    <SelectItem value="_" disabled>No units available</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 font-medium">This cascades the assignment to all members in the selected unit.</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="PROJECT" className="space-y-4 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Select Project Team</Label>
                                        <Select value={projectId} onValueChange={setProjectId}>
                                            <SelectTrigger className="h-12 rounded-xl bg-gray-50/50 border-gray-200">
                                                <SelectValue placeholder="Choose a project..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-lg border-gray-100">
                                                {projects.map(p => (
                                                    <SelectItem key={p.id} value={p.id} className="font-medium">{p.name}</SelectItem>
                                                ))}
                                                {projects.length === 0 && (
                                                    <SelectItem value="_" disabled>No projects found</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TabsContent>

                                <TabsContent value="CSV" className="space-y-4 animate-in fade-in duration-300">
                                    <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-xl text-center space-y-3">
                                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900">Mass Assignment via CSV</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">Upload a spreadsheet mapping enrollment IDs or emails to automatically queue assignments for hundreds of students simultaneously.</p>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    <div className="p-6 pt-0 flex justify-end gap-3 bg-gray-50/30">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-semibold">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-100"
                        >
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {targetType === "CSV" ? "Open CSV Uploader" : "Confirm Assignment"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {csvDialogOpen && (
                <AssignViaCSVDialog
                    open={csvDialogOpen}
                    onClose={() => {
                        setCsvDialogOpen(false);
                        onOpenChange(false);
                        onAssigned?.();
                    }}
                    assessmentModelId={assessmentModel.id}
                    orgSlug={clientId}
                />
            )}
        </>
    );
}

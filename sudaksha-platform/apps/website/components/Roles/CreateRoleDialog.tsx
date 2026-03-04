"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function CreateRoleDialog({ clientId, isInstitution }: { clientId: string; isInstitution?: boolean }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [competencies, setCompetencies] = useState<any[]>([]);

    // Form Data: institutions (students/fresh graduates) use Junior only
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        overallLevel: "JUNIOR" as string,
        competencyIds: [] as string[],
        submitForApproval: true
    });

    const router = useRouter();

    useEffect(() => {
        if (open) {
            fetch(`/api/clients/${clientId}/competencies`).then(r => r.json()).then(setCompetencies);
        } else {
            setStep(1); // Reset
        }
    }, [open, clientId]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                ...formData,
                overallLevel: isInstitution ? "JUNIOR" : formData.overallLevel
            };
            const res = await fetch(`/api/clients/${clientId}/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(formData.submitForApproval ? "Role submitted for approval" : "Draft role created");
                setOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to create role");
            }
        } catch (error) {
            toast.error("Error");
        } finally {
            setLoading(false);
        }
    };

    const toggleCompetency = (id: string) => {
        if (formData.competencyIds.includes(id)) {
            setFormData({ ...formData, competencyIds: formData.competencyIds.filter(c => c !== id) });
        } else {
            setFormData({ ...formData, competencyIds: [...formData.competencyIds, id] });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Role
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[70vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Create Custom Role (Step {step}/3)</DialogTitle>
                    <DialogDescription>Define a new role for your organization.</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 px-1">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Role Name <span className="text-red-500">*</span></Label>
                                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Senior Java Developer" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Proficiency Level</Label>
                                {isInstitution ? (
                                    <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                                        Junior (students / fresh graduates)
                                    </div>
                                ) : (
                                    <Select value={formData.overallLevel} onValueChange={v => setFormData({ ...formData, overallLevel: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="JUNIOR">Junior</SelectItem>
                                            <SelectItem value="MIDDLE">Middle</SelectItem>
                                            <SelectItem value="SENIOR">Senior</SelectItem>
                                            <SelectItem value="EXPERT">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe responsibilities..." />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <Label>Select Competencies ({formData.competencyIds.length})</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {competencies.map(c => (
                                    <div
                                        key={c.id}
                                        className={`p-3 border rounded cursor-pointer transition-colors ${formData.competencyIds.includes(c.id) ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50'}`}
                                        onClick={() => toggleCompetency(c.id)}
                                    >
                                        <div className="font-medium text-sm flex justify-between items-center">
                                            {c.name}
                                            {formData.competencyIds.includes(c.id) && <Check className="h-4 w-4 text-indigo-600" />}
                                        </div>
                                        <div className="text-xs text-gray-500 line-clamp-1">{c.description}</div>
                                    </div>
                                ))}
                            </div>
                            {competencies.length === 0 && <div className="text-center text-gray-400 py-4">No competencies found.</div>}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg">{formData.name}</h3>
                                <div className="flex gap-2">
                                    <Badge variant="outline">{isInstitution ? "Junior" : formData.overallLevel}</Badge>
                                    <Badge variant="secondary">{formData.competencyIds.length} Competencies</Badge>
                                </div>
                                <p className="text-gray-500 text-sm">{formData.description || "No description provided."}</p>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="approval"
                                        checked={formData.submitForApproval}
                                        onCheckedChange={(c) => setFormData({ ...formData, submitForApproval: !!c })}
                                    />
                                    <Label htmlFor="approval" className="font-medium cursor-pointer">Submit for Sudaksha Approval</Label>
                                </div>
                                <p className="text-xs text-yellow-700 mt-2 ml-6">
                                    If unchecked, role will be saved as DRAFT and can only be used for internal testing.
                                    Verified approval is required for full assessment capabilities.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between items-center mt-4 border-t pt-4">
                    {step > 1 ? (
                        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)} disabled={!formData.name}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                            {formData.submitForApproval ? "Submit Request" : "Save Draft"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

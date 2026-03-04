"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTenantLabels } from "@/hooks/useTenantLabels";

// Types
interface Dept { id: string; name: string; }
interface Emp { id: string; name: string; }

export function CreateEmployeeDialog({ clientId, defaultOpen, redirectBase }: { clientId: string; defaultOpen?: boolean; redirectBase?: string }) {
    const [open, setOpen] = useState(!!defaultOpen);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const labels = useTenantLabels();

    // Data
    const [departments, setDepartments] = useState<Dept[]>([]);
    const [managers, setManagers] = useState<Emp[]>([]);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        orgUnitId: "",
        designation: "",
        reportingToId: "",
        role: "ASSESSOR",
        memberCode: ""
    });

    const router = useRouter();

    useEffect(() => {
        if (open && step === 2) {
            fetch(`/api/clients/${clientId}/departments?status=active`)
                .then(r => r.json())
                .then(data => setDepartments(Array.isArray(data) ? data : []));
            fetch(`/api/clients/${clientId}/employees?simple=true`)
                .then(r => r.json())
                .then(data => setManagers(Array.isArray(data) ? data : []));
        }
    }, [open, step, clientId]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                toast.success(`${labels.member} invited successfully`);
                setOpen(false);
                if (defaultOpen) router.push(redirectBase ? `${redirectBase}/employees` : `/assessments/clients/${clientId}/employees`);
                setFormData({
                    firstName: "", lastName: "", email: "", phone: "",
                    orgUnitId: "", designation: "", reportingToId: "", role: "ASSESSOR", memberCode: ""
                });
                setStep(1);
                router.refresh();
            } else {
                toast.error(data?.details || data?.error || "Failed to create employee");
            }
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setStep(1); }}>
            {!defaultOpen && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add {labels.member}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New {labels.member} (Step {step}/3)</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 && (
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name <span className="text-red-500">*</span></Label>
                                    <Input value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email <span className="text-red-500">*</span></Label>
                                    <Input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>{labels.memberCode}</Label>
                                    <Input value={formData.memberCode} onChange={e => handleChange('memberCode', e.target.value)} placeholder={`Optional`} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>{labels.orgUnit}</Label>
                                <Select value={formData.orgUnitId} onValueChange={v => handleChange('orgUnitId', v)}>
                                    <SelectTrigger><SelectValue placeholder={`Select ${labels.orgUnit}`} /></SelectTrigger>
                                    <SelectContent>
                                        {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Designation</Label>
                                <Input value={formData.designation} onChange={e => handleChange('designation', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Reporting Manager</Label>
                                <Select value={formData.reportingToId} onValueChange={v => handleChange('reportingToId', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Manager" /></SelectTrigger>
                                    <SelectContent>
                                        {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>System Role</Label>
                                <Select value={formData.role} onValueChange={v => handleChange('role', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ASSESSOR">{labels.member} / Learner</SelectItem>
                                        <SelectItem value="TEAM_LEAD">{labels.subUnitLead}</SelectItem>
                                        <SelectItem value="DEPT_HEAD">{labels.orgUnit} Head</SelectItem>
                                        <SelectItem value="TENANT_ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="p-4 bg-gray-50 rounded text-sm text-gray-500">
                                User will receive an email invitation to set their password.
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step > 1 && (
                        <Button variant="outline" onClick={() => setStep(step - 1)}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    )}
                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)}>
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Invitation
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

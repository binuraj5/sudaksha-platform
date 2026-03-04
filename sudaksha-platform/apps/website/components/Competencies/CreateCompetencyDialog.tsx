"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

const CATEGORIES = ["TECHNICAL", "BEHAVIORAL", "LEADERSHIP", "DOMAIN", "SOFT_SKILL"];

export function CreateCompetencyDialog({ clientId, onCreated }: { clientId: string; onCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("TECHNICAL");
    const [submitForApproval, setSubmitForApproval] = useState(true);

    const handleSubmit = async () => {
        if (!name || !description) {
            toast.error("Name and description are required");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/competencies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    category,
                    submitForApproval
                })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to create");
            }
            toast.success(submitForApproval ? "Competency submitted for approval" : "Draft competency created");
            setOpen(false);
            setName("");
            setDescription("");
            setCategory("TECHNICAL");
            setSubmitForApproval(true);
            onCreated?.();
        } catch (e: any) {
            toast.error(e.message || "Failed to create competency");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> New Competency</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Competency</DialogTitle>
                    <DialogDescription>Define a new competency for your organization. Submit for Sudaksha approval for full assessment use.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Name <span className="text-red-500">*</span></Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Problem Solving" />
                    </div>
                    <div className="space-y-2">
                        <Label>Description <span className="text-red-500">*</span></Label>
                        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the competency..." rows={3} />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(c => (
                                    <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="approval" checked={submitForApproval} onCheckedChange={c => setSubmitForApproval(!!c)} />
                        <Label htmlFor="approval" className="cursor-pointer">Submit for Sudaksha Approval</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {submitForApproval ? "Submit Request" : "Save Draft"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

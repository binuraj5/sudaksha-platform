"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateDepartmentDialogProps {
    clientId: string;
    projectId: string; // Keep prop name as projectId for consistency with the page's variable name for Activity ID
    onSuccess?: () => void;
}

export function CreateDepartmentDialog({ clientId, projectId, onSuccess }: CreateDepartmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        code: "",
        description: "",
        headName: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/clients/${clientId}/projects/${projectId}/departments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to create department");
            }

            toast.success("Org Unit created successfully");
            setOpen(false);
            setForm({
                name: "",
                code: "",
                description: "",
                headName: ""
            });
            router.refresh();
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Org Unit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Org Unit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="dept-name">Org Unit Name</Label>
                        <Input
                            id="dept-name"
                            required
                            placeholder="e.g. Sales, Frontend Engineering"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code">Org Unit Code (Unique within activity)</Label>
                        <Input
                            id="code"
                            required
                            placeholder="e.g. SALES, FE_ENG"
                            value={form.code}
                            onChange={e => setForm({ ...form, code: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="head">Head of Org Unit (Optional)</Label>
                        <Input
                            id="head"
                            placeholder="e.g. John Doe"
                            value={form.headName}
                            onChange={e => setForm({ ...form, headName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dept-description">Description</Label>
                        <Textarea
                            id="dept-description"
                            placeholder="Brief description of the department's role"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? "Adding..." : "Add Org Unit"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

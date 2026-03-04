"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
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
    SelectValue
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CreateNodeDialog({
    clientId,
    parentId,
    onSuccess
}: {
    clientId: string;
    parentId?: string;
    onSuccess: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        type: "SUBJECT",
        description: "",
        parentId: parentId || null
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/clients/${clientId}/curriculum`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Node created successfully");
                setOpen(false);
                setFormData({ name: "", code: "", type: "SUBJECT", description: "", parentId: parentId || null });
                onSuccess();
            } else {
                toast.error("Failed to create node");
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
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Node
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Curriculum Node</DialogTitle>
                        <DialogDescription>
                            Create a new node in the curriculum hierarchy.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PROGRAM">Program</SelectItem>
                                        <SelectItem value="DEGREE">Degree</SelectItem>
                                        <SelectItem value="SEMESTER">Semester</SelectItem>
                                        <SelectItem value="DEPARTMENT">Department</SelectItem>
                                        <SelectItem value="SUBJECT">Subject</SelectItem>
                                        <SelectItem value="TOPIC">Topic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Code <span className="text-red-500">*</span></Label>
                                <Input
                                    required
                                    placeholder="e.g. CS101"
                                    value={formData.code}
                                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Name <span className="text-red-500">*</span></Label>
                            <Input
                                required
                                placeholder="e.g. Computer Science"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Optional details..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import React, { useState } from "react";
import { Plus, Trash2, Briefcase, Calendar, Building, Loader2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/_dialog";

interface PreviousRole {
    title: string;
    company: string;
    duration: string;
    description?: string;
}

interface ExperienceSectionProps {
    member: any;
    onUpdate: () => void;
}

export function ExperienceSection({ member, onUpdate }: ExperienceSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [roles, setRoles] = useState<PreviousRole[]>(() => {
        try {
            return (member.previousRoles as PreviousRole[]) || [];
        } catch {
            return [];
        }
    });

    const [newRole, setNewRole] = useState<PreviousRole>({
        title: "",
        company: "",
        duration: "",
        description: "",
    });

    const handleAddRole = () => {
        if (!newRole.title || !newRole.company) {
            toast.error("Title and Company are required");
            return;
        }
        setRoles([...roles, newRole]);
        setNewRole({ title: "", company: "", duration: "", description: "" });
    };

    const handleRemoveRole = (index: number) => {
        setRoles(roles.filter((_, i) => i !== index));
    };

    const saveExperience = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ previousRoles: roles }),
            });
            if (res.ok) {
                toast.success("Experience updated successfully");
                setIsEditing(false);
                onUpdate();
            } else {
                toast.error("Failed to update experience");
            }
        } catch (error) {
            toast.error("An error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Briefcase className="h-6 w-6 text-indigo-600" />
                        Professional Experience
                    </h2>
                    <p className="text-gray-500 text-sm italic">Your work history and past roles.</p>
                </div>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2 border-indigo-100 hover:bg-indigo-50 text-indigo-600">
                            <Pencil className="h-4 w-4" />
                            Manage Work History
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Manage Experience</DialogTitle>
                            <DialogDescription>Add or remove your previous professional roles.</DialogDescription>
                        </DialogHeader>

                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            {/* Current List */}
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Current History</Label>
                                {roles.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic py-4 text-center border rounded-xl border-dashed">No history added yet.</p>
                                ) : (
                                    roles.map((role, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div>
                                                <p className="font-bold text-slate-900">{role.title}</p>
                                                <p className="text-xs text-slate-500">{role.company} • {role.duration}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleRemoveRole(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add New */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <Label className="text-xs font-black uppercase tracking-widest text-indigo-600">Add New Role</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Job Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="Senior Developer"
                                            value={newRole.title}
                                            onChange={e => setNewRole({ ...newRole, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company</Label>
                                        <Input
                                            id="company"
                                            placeholder="Tech Solutions Inc"
                                            value={newRole.company}
                                            onChange={e => setNewRole({ ...newRole, company: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration</Label>
                                        <Input
                                            id="duration"
                                            placeholder="Jan 2020 - Dec 2022"
                                            value={newRole.duration}
                                            onChange={e => setNewRole({ ...newRole, duration: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 flex items-end">
                                        <Button onClick={handleAddRole} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                            <Plus className="h-4 w-4 mr-2" /> Add to List
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={saveExperience} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {roles.length > 0 ? (
                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                    {roles.map((role, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-8 top-1 h-6 w-6 rounded-full bg-white border-4 border-indigo-500 shadow-sm" />
                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors" />
                                <CardContent className="p-6 relative">
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{role.title}</h3>
                                            <div className="flex items-center gap-2 text-indigo-600 font-medium">
                                                <Building className="h-4 w-4" />
                                                <span>{role.company}</span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 font-medium whitespace-nowrap">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {role.duration}
                                        </Badge>
                                    </div>
                                    {role.description && (
                                        <p className="text-gray-600 text-sm mt-3 leading-relaxed">{role.description}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="border-none shadow-sm bg-slate-50/50 border border-dashed border-slate-200">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                            <Briefcase className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 italic">Work history is empty</h3>
                        <p className="text-slate-500 max-w-xs mt-2 mb-6">Record your past professional roles to build a complete career profile.</p>
                        <Button onClick={() => setIsEditing(true)} variant="outline" className="border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                            Add Your First Role
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

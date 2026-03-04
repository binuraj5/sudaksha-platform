"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function MyCompetenciesPage() {
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);

    // Self assign states
    const [availableCompetencies, setAvailableCompetencies] = useState<any[]>([]);
    const [selectedCompetencyId, setSelectedCompetencyId] = useState("");
    const [requestDesc, setRequestDesc] = useState("");
    const [newName, setNewName] = useState("");
    const [newLevel, setNewLevel] = useState("BEGINNER");
    const [posIndicator, setPosIndicator] = useState("");
    const [negIndicator, setNegIndicator] = useState("");
    const [positiveIndicators, setPositiveIndicators] = useState<string[]>([]);
    const [negativeIndicators, setNegativeIndicators] = useState<string[]>([]);

    const fetchProfile = async () => {
        try {
            const [profileRes, compRes] = await Promise.all([
                fetch("/api/profile"),
                fetch("/api/competencies")
            ]);

            if (profileRes.ok) {
                const data = await profileRes.json();
                setMember(data);
            }
            if (compRes.ok) {
                const cData = await compRes.json();
                setAvailableCompetencies(cData || []);
            }
            setLoading(false);
        } catch (err) {
            console.error("Failed to load profile:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleAddExisting = async () => {
        if (!selectedCompetencyId) return;
        const comp = availableCompetencies.find(c => c.id === selectedCompetencyId);
        if (!comp) return;

        setSaving(true);
        try {
            const currentArray = Array.isArray(member?.selfAssignedCompetencies) ? member.selfAssignedCompetencies : [];
            const updated = [...currentArray, { id: comp.id, name: comp.name, level: newLevel, source: "Self-Assigned" }];

            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selfAssignedCompetencies: updated })
            });

            if (res.ok) {
                toast.success("Competency added to your profile!");
                setSelectedCompetencyId("");
                setShowAddDialog(false);
                fetchProfile();
            } else {
                toast.error("Failed to add competency.");
            }
        } catch (error) {
            toast.error("Error occurred.");
        } finally {
            setSaving(false);
        }
    };

    const handleRequestNew = async () => {
        if (!newName.trim() || !requestDesc.trim()) {
            toast.error("Name and description are required for a request.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/individuals/competencies/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    description: requestDesc,
                    positiveIndicators,
                    negativeIndicators
                })
            });

            if (res.ok) {
                const data = await res.json();

                // Add to self-assigned as PENDING
                const currentArray = Array.isArray(member?.selfAssignedCompetencies) ? member.selfAssignedCompetencies : [];
                const updated = [...currentArray, { id: data.newCompetency.id, name: newName, level: newLevel, source: "Self-Assigned", status: "PENDING" }];

                await fetch("/api/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ selfAssignedCompetencies: updated })
                });

                toast.success("Competency request sent to Super Admin!");
                setNewName("");
                setRequestDesc("");
                setPositiveIndicators([]);
                setNegativeIndicators([]);
                setShowAddDialog(false);
                fetchProfile();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to submit request.");
            }
        } catch (error) {
            toast.error("Error occurred.");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveSelfAssigned = async (idToRemove: string) => {
        try {
            const currentArray = Array.isArray(member?.selfAssignedCompetencies) ? member.selfAssignedCompetencies : [];
            const updated = currentArray.filter((c: any) => c.id !== idToRemove);

            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selfAssignedCompetencies: updated })
            });

            if (res.ok) {
                toast.success("Competency removed!");
                fetchProfile();
            }
        } catch (error) {
            toast.error("Error occurred.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    // Role-based competencies
    const currentRoleName = member?.currentRole?.name || "Current Role";
    const currentCompetencies = member?.currentRole?.competencies?.map((rc: any) => ({
        ...rc.competency,
        source: currentRoleName,
        level: rc.targetLevel,
    })) || [];

    const aspirationalRoleName = member?.aspirationalRole?.name || "Aspirational Role";
    const aspirationalCompetencies = member?.aspirationalRole?.competencies?.map((rc: any) => ({
        ...rc.competency,
        source: aspirationalRoleName,
        level: rc.targetLevel,
    })) || [];

    const allCompetencies = [...currentCompetencies, ...aspirationalCompetencies];
    const uniqueRoleCompetencies = Array.from(new Map(allCompetencies.map((c: any) => [c.id, c])).values());

    // Self-assigned competencies
    const selfAssigned = Array.isArray(member?.selfAssignedCompetencies) ? member.selfAssignedCompetencies : [];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Competencies</h1>
                    <p className="text-gray-500 mt-1">Competencies from your roles and self-assigned goals</p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" /> Add Competency</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Self-Assign or Request Competency</DialogTitle></DialogHeader>

                        <div className="border-b border-gray-200 mt-4 mb-4">
                            <div className="flex space-x-4">
                                <button className={`pb-2 text-sm font-medium ${!newName && !requestDesc ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => { setNewName(""); setRequestDesc(""); }}>Select Existing</button>
                                <button className={`pb-2 text-sm font-medium ${newName || requestDesc ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => { setNewName("New Request"); setRequestDesc(" "); }}>Request New</button>
                            </div>
                        </div>

                        {!newName && !requestDesc ? (
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Select from Library</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                        value={selectedCompetencyId}
                                        onChange={e => setSelectedCompetencyId(e.target.value)}
                                    >
                                        <option value="">-- Choose Competency --</option>
                                        {availableCompetencies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Level</label>
                                    <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={newLevel} onChange={e => setNewLevel(e.target.value)}>
                                        <option value="BEGINNER">Junior</option>
                                        <option value="INTERMEDIATE">Middle</option>
                                        <option value="ADVANCED">Senior</option>
                                        <option value="EXPERT">Expert</option>
                                    </select>
                                </div>
                                <Button className="w-full" onClick={handleAddExisting} disabled={saving || !selectedCompetencyId}>
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Save Competency
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Competency Name</label>
                                    <Input value={newName === "New Request" ? "" : newName} onChange={e => setNewName(e.target.value)} placeholder="Proposed name..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input value={requestDesc === " " ? "" : requestDesc} onChange={e => setRequestDesc(e.target.value)} placeholder="Why do you need this?" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Positive Indicators</label>
                                    <div className="flex gap-2">
                                        <Input value={posIndicator} onChange={e => setPosIndicator(e.target.value)} placeholder="e.g. Mastered React Hooks" onKeyDown={e => { if (e.key === 'Enter') { setPositiveIndicators([...positiveIndicators, posIndicator]); setPosIndicator(""); } }} />
                                        <Button type="button" variant="secondary" onClick={() => { if (posIndicator) { setPositiveIndicators([...positiveIndicators, posIndicator]); setPosIndicator(""); } }}>Add</Button>
                                    </div>
                                    {positiveIndicators.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {positiveIndicators.map((pi, idx) => (
                                                <Badge key={idx} variant="outline" className="flex items-center gap-1">
                                                    {pi} <button onClick={() => setPositiveIndicators(positiveIndicators.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 ml-1">&times;</button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Negative Indicators</label>
                                    <div className="flex gap-2">
                                        <Input value={negIndicator} onChange={e => setNegIndicator(e.target.value)} placeholder="e.g. Fails to manage state" onKeyDown={e => { if (e.key === 'Enter') { setNegativeIndicators([...negativeIndicators, negIndicator]); setNegIndicator(""); } }} />
                                        <Button type="button" variant="secondary" onClick={() => { if (negIndicator) { setNegativeIndicators([...negativeIndicators, negIndicator]); setNegIndicator(""); } }}>Add</Button>
                                    </div>
                                    {negativeIndicators.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {negativeIndicators.map((ni, idx) => (
                                                <Badge key={idx} variant="outline" className="flex items-center gap-1">
                                                    {ni} <button onClick={() => setNegativeIndicators(negativeIndicators.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 ml-1">&times;</button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Level</label>
                                    <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={newLevel} onChange={e => setNewLevel(e.target.value)}>
                                        <option value="BEGINNER">Junior</option>
                                        <option value="INTERMEDIATE">Middle</option>
                                        <option value="ADVANCED">Senior</option>
                                        <option value="EXPERT">Expert</option>
                                    </select>
                                </div>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleRequestNew} disabled={saving || !newName || !requestDesc || newName === "New Request" || requestDesc === " "}>
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Submit Request to Admin
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Role-Based Competencies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uniqueRoleCompetencies.map((comp: any) => (
                        <Card key={comp.id}>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold">{comp.name}</h3>
                                    {comp.category && <Badge variant="outline">{comp.category}</Badge>}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Target Level: <strong>{comp.level || "Not specified"}</strong>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    From: {comp.source}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {uniqueRoleCompetencies.length === 0 && (
                        <Card className="col-span-full border-dashed shadow-none">
                            <CardContent className="pt-6 text-center text-gray-500">
                                No role-assigned competencies yet.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Self-Assigned Competencies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selfAssigned.map((comp: any) => (
                        <Card key={comp.id} className="relative group">
                            <CardContent className="pt-6">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemoveSelfAssigned(comp.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="flex justify-between items-start mb-2 pr-6">
                                    <h3 className="font-semibold">{comp.name}</h3>
                                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">Self</Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Target Level: <strong>{comp.level || "Not specified"}</strong>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {selfAssigned.length === 0 && (
                        <Card className="col-span-full border-dashed shadow-none">
                            <CardContent className="pt-6 text-center text-gray-500">
                                No self-assigned competencies yet. Click "Add Competency" to set your own goals.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

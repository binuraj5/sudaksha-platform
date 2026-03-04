"use client";

import React, { useState, useEffect } from "react";
import {
    Award, Search, Plus, Trash2, ShieldCheck,
    Zap, Brain, Code, Cpu, Globe, Loader2, Sparkles,
    CheckCircle2, XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

interface Competency {
    id: string;
    name: string;
    category: string;
    description: string;
}

interface CompetenciesSectionProps {
    member: any;
    onUpdate: () => void;
}

export function CompetenciesSection({ member, onUpdate }: CompetenciesSectionProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [allCompetencies, setAllCompetencies] = useState<Competency[]>([]);
    const [selfAssigned, setSelfAssigned] = useState<Competency[]>(() => {
        try {
            return (member.selfAssignedCompetencies as Competency[]) || [];
        } catch {
            return [];
        }
    });

    // Extract role competencies
    const roleCompetencies = (member.currentRole?.competencies || []).map((rc: any) => rc.competency);

    useEffect(() => {
        if (isAdding) {
            fetch("/api/competencies")
                .then(res => res.json())
                .then(setAllCompetencies);
        }
    }, [isAdding]);

    const handleAdd = async (comp: Competency) => {
        if (selfAssigned.find(c => c.id === comp.id) || roleCompetencies.find((c: any) => c.id === comp.id)) {
            toast.error("Competency already in profile");
            return;
        }

        const newList = [...selfAssigned, comp];
        await saveCompetencies(newList);
    };

    const handleRemove = async (id: string) => {
        const newList = selfAssigned.filter(c => c.id !== id);
        await saveCompetencies(newList);
    };

    const saveCompetencies = async (list: Competency[]) => {
        setLoading(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selfAssignedCompetencies: list }),
            });
            if (res.ok) {
                setSelfAssigned(list);
                toast.success("Competencies updated");
                onUpdate();
            } else {
                toast.error("Failed to update competencies");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const filtered = allCompetencies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        !selfAssigned.find(s => s.id === c.id) &&
        !roleCompetencies.find((r: any) => r.id === c.id)
    );

    const CategoryIcon = ({ cat }: { cat: string }) => {
        switch (cat) {
            case 'TECHNICAL': return <Code className="h-4 w-4" />;
            case 'BEHAVIORAL': return <Brain className="h-4 w-4" />;
            case 'LEADERSHIP': return <ShieldCheck className="h-4 w-4" />;
            default: return <Zap className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 lowercase italic">My <span className="text-indigo-600 font-serif not-italic">Competencies</span></h2>
                    <p className="text-slate-500 italic font-medium mt-1">Manage your unique skill stack and role-required abilities.</p>
                </div>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg gap-2 px-6">
                            <Plus className="h-5 w-5" />
                            Self-Assign Competency
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Search Competencies</DialogTitle>
                            <DialogDescription>Find and add skills that you possess or are developing.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    className="pl-10"
                                    placeholder="Search (e.g. React, Leadership, Project Management)..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                {filtered.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 italic">No matching competencies found.</div>
                                ) : (
                                    filtered.map(c => (
                                        <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900 truncate">{c.name}</p>
                                                    <Badge variant="outline" className="text-[10px] lowercase text-slate-400">{c.category}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">{c.description}</p>
                                            </div>
                                            <Button size="sm" onClick={() => handleAdd(c)} className="bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50 shadow-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                Add
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Done</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ROLE COMPETENCIES */}
                <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <ShieldCheck className="h-6 w-6 text-indigo-300" />
                            </div>
                            <CardTitle className="text-xl font-bold tracking-tight">Role Required</CardTitle>
                        </div>
                        <CardDescription className="text-slate-400 italic">These are mapped to your current role: <span className="text-indigo-300 font-bold">{member.currentRole?.name || "None"}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-4">
                        {roleCompetencies.length > 0 ? roleCompetencies.map((c: any) => (
                            <div key={c.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                                    <CategoryIcon cat={c.category} />
                                </div>
                                <div>
                                    <p className="font-bold text-white leading-tight">{c.name}</p>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center text-slate-500 italic">No competencies mapped to your current role.</div>
                        )}
                    </CardContent>
                </Card>

                {/* SELF ASSIGNED */}
                <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <Sparkles className="h-6 w-6 text-indigo-600" />
                            </div>
                            <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Self-Assigned</CardTitle>
                        </div>
                        <CardDescription className="text-slate-500 italic">Additional skills you have identified beyond your core role.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-4">
                        {selfAssigned.length > 0 ? selfAssigned.map((c: any) => (
                            <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4 group">
                                <div className="h-10 w-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                                    <CategoryIcon cat={c.category} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-slate-900 leading-tight">{c.name}</p>
                                        <Button variant="ghost" size="sm" onClick={() => handleRemove(c.id)} className="h-8 w-8 p-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">{c.description}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-4 bg-slate-50 rounded-2xl mb-4">
                                    <Zap className="h-8 w-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500 text-sm font-medium italic">Your skill stack is ready for expansion.</p>
                                <Button onClick={() => setIsAdding(true)} variant="link" className="text-indigo-600 font-bold p-0 h-auto mt-2">Add your first skill</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

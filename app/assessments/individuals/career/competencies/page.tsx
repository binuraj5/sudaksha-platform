"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Plus,
    Save,
    Sparkles,
    Trash2,
    Search
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Competency {
    id: string;
    name: string;
    category: string;
    description?: string;
}

interface SelfAssignedCompetency {
    id: string;
    name: string;
    category: string;
    selfAssessedLevel: string;
}

export default function SelfAssignedCompetenciesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [allCompetencies, setAllCompetencies] = useState<Competency[]>([]);
    const [myCompetencies, setMyCompetencies] = useState<SelfAssignedCompetency[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const [profileRes, compRes] = await Promise.all([
                    fetch("/api/profile"),
                    fetch("/api/competencies")
                ]);

                if (compRes.ok) {
                    const comps = await compRes.json();
                    setAllCompetencies(comps);
                }

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    const existing = Array.isArray(profileData.selfAssignedCompetencies)
                        ? profileData.selfAssignedCompetencies
                        : [];
                    setMyCompetencies(existing);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load competencies.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selfAssignedCompetencies: myCompetencies })
            });

            if (res.ok) {
                toast.success("Competencies saved successfully!");
                router.refresh();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to save competencies");
            }
        } catch (error) {
            toast.error("An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    const handleAdd = (comp: Competency) => {
        if (myCompetencies.some(c => c.id === comp.id)) return;
        setMyCompetencies(prev => [...prev, {
            id: comp.id,
            name: comp.name,
            category: comp.category,
            selfAssessedLevel: "BEGINNER"
        }]);
    };

    const handleRemove = (id: string) => {
        setMyCompetencies(prev => prev.filter(c => c.id !== id));
    };

    const handleLevelChange = (id: string, level: string) => {
        setMyCompetencies(prev => prev.map(c =>
            c.id === id ? { ...c, selfAssessedLevel: level } : c
        ));
    };

    const unselectedCompetencies = allCompetencies.filter(
        c => !myCompetencies.some(mc => mc.id === c.id)
    ).filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50 p-6 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/assessments/individuals/career">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Self-Assign Competencies</h1>
                            <p className="text-gray-500 mt-1">Proactively add skills to your profile beyond your core role matrix.</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={saving}
                    >
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: My Assigned Competencies */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-md bg-white">
                            <CardHeader className="pb-4 border-b border-gray-100">
                                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    My Selected Skills
                                    <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-none">
                                        {myCompetencies.length} Added
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {myCompetencies.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center">
                                        <Sparkles className="h-12 w-12 text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900">No skills self-assigned</h3>
                                        <p className="text-sm text-gray-500 mt-1 max-w-sm">
                                            Select competencies from the library on the right to start building your personal skill profile.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {myCompetencies.map(comp => (
                                            <div key={comp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{comp.name}</h4>
                                                    <Badge variant="outline" className="mt-1 text-xs">{comp.category}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-32">
                                                        <Select
                                                            value={comp.selfAssessedLevel}
                                                            onValueChange={(val) => handleLevelChange(comp.id, val)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Select level" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                                <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                                <SelectItem value="EXPERT">Expert</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemove(comp.id)}
                                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Competency Library */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-md bg-white">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg text-gray-900">Library</CardTitle>
                                <CardDescription>Search and add new skills.</CardDescription>
                                <div className="relative mt-2">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name or category..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[600px]">
                                    {unselectedCompetencies.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 text-sm">
                                            No competencies found matching "{searchQuery}"
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {unselectedCompetencies.map(comp => (
                                                <div key={comp.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-start gap-2">
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900">{comp.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{comp.category}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleAdd(comp)}
                                                        className="h-7 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" /> Add
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    FileText,
    CheckCircle2,
    Clock,
    Archive,
    Loader2,
    Layout,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AssessmentModel {
    id: string;
    name: string;
    code: string;
    sourceType: string;
    status: string;
    createdAt: string;
    role?: { name: string };
    _count: { components: number };
}

export default function AssessmentModelsPage() {
    const router = useRouter();
    const [models, setModels] = useState<AssessmentModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [modelToDelete, setModelToDelete] = useState<AssessmentModel | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        sourceType: "ROLE_BASED",
        targetLevel: "JUNIOR"
    });

    const fetchModels = async () => {
        try {
            const res = await fetch("/api/assessments/admin/models");
            if (res.ok) {
                const data = await res.json();
                setModels(data.models);
            }
        } catch (error) {
            toast.error("Failed to fetch assessment models");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name) {
            toast.error("Please provide a name for the model");
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch("/api/assessments/admin/models", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Assessment model created successfully");
                setIsCreateOpen(false);
                setFormData({ name: "", description: "", sourceType: "ROLE_BASED", targetLevel: "JUNIOR" });
                fetchModels();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create model");
            }
        } catch (error) {
            toast.error("An error occurred while creating the model");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!modelToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelToDelete.id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Assessment model deleted successfully");
                setModelToDelete(null);
                fetchModels();
            } else {
                toast.error(data.error || "Failed to delete model");
            }
        } catch {
            toast.error("An error occurred while deleting the model");
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PUBLISHED":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Published</Badge>;
            case "DRAFT":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none"><Clock className="w-3 h-3 mr-1" /> Draft</Badge>;
            case "ARCHIVED":
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none shadow-none"><Archive className="w-3 h-3 mr-1" /> Archived</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredModels = models.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Assessment Models</h1>
                    <p className="text-muted-foreground mt-0.5 text-sm">Manage foundation assessment models and standards.</p>
                </div>

                <Link href="/assessments/admin/models/create">
                    <Button className="bg-navy-700 hover:bg-navy-600 shadow-sm transition-all active:scale-95 gap-2 h-9 px-5 text-sm">
                        <Plus className="w-5 h-5" />
                        Create Model
                    </Button>
                </Link>
            </div>

            <Card className="shadow-sm border bg-card overflow-hidden">
                <CardHeader className="border-b bg-muted/30 py-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or code..."
                                className="pl-10 h-9 bg-card border focus:ring-navy-500/20 focus:border-navy-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" className="gap-2 h-10">
                                <Filter className="w-4 h-4" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 text-navy-600 animate-spin" />
                            <p className="text-gray-400 font-medium animate-pulse">Loading assessments...</p>
                        </div>
                    ) : filteredModels.length === 0 ? (
                        <div className="text-center py-24 px-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">No assessment models found</h3>
                            <p className="text-gray-500 mt-1 max-w-sm mx-auto">Start by creating a new evaluation standard to measure skills and competencies.</p>
                            <Button className="mt-6 bg-navy-50 text-navy-700 hover:bg-navy-100 border-navy-100 h-8 text-sm font-medium">
                                Create your first model
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/30 border-b">
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Model</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stats</th>
                                        <th className="px-4 py-3 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredModels.map((model) => (
                                        <tr key={model.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-md bg-navy-50 flex items-center justify-center text-navy-700 font-mono text-xs font-bold ring-1 ring-navy-100">
                                                        {model.code.substring(3)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground line-clamp-1 text-sm">{model.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-mono">{model.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider px-2 py-0">
                                                    {model.sourceType.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-foreground font-medium">
                                                    {model.role?.name || "Global / General"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(model.status)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <span className="text-navy-700 bg-navy-50 px-2 rounded text-xs">
                                                        {model._count.components}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs">components</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-navy-50 hover:text-navy-700">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 shadow-xl border-gray-100 ring-1 ring-black/5">
                                                        <DropdownMenuItem
                                                            className="gap-2 cursor-pointer font-medium py-2 text-sm"
                                                            onClick={() => router.push(`/assessments/admin/models/${model.id}/builder`)}
                                                        >
                                                            <Layout className="w-4 h-4 text-navy-600" /> Open Builder
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 cursor-pointer font-medium py-2 text-sm">
                                                            <FileText className="w-4 h-4 text-navy-600" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 cursor-pointer font-medium py-2">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Publish
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="gap-2 cursor-pointer text-red-600 font-medium py-2 focus:text-red-600 focus:bg-red-50"
                                                            onClick={() => setModelToDelete(model)}
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!modelToDelete} onOpenChange={(open) => !open && setModelToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Assessment Model</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{modelToDelete?.name}</strong>? This will archive the model and it cannot be used for new assessments. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setModelToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Target, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RoleCompetencyRowProps {
    roleId: string;
    mappingId: string;
    competencyName: string;
    competencyCategory: string;
    requiredLevel: string;
    weight: number;
}

export function RoleCompetencyRow({
    roleId,
    mappingId,
    competencyName,
    competencyCategory,
    requiredLevel,
    weight,
}: RoleCompetencyRowProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleRemove = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/roles/${roleId}/competencies/${mappingId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Competency removed from role");
                setDialogOpen(false);
                router.refresh();
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to remove competency");
            }
        } catch {
            toast.error("Failed to remove competency");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Card className="hover:border-blue-100 transition-colors shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6 flex-1">
                    <div className="p-3 bg-red-50 rounded-xl">
                        <Target className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">{competencyName}</h4>
                        <div className="flex gap-2 mt-1">
                            <Badge className="bg-gray-100 text-gray-600 border-none text-[10px]">
                                {competencyCategory}
                            </Badge>
                            <Badge className="bg-red-50 text-red-700 border-none text-[10px]">
                                {requiredLevel} LEVEL
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8 pr-4">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                            Weighting
                        </p>
                        <p className="text-lg font-black text-blue-600">
                            {(weight * 100).toFixed(0)}%
                        </p>
                    </div>
                    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-300 hover:text-red-600"
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove competency?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove &quot;{competencyName}&quot; from this role.
                                    Existing assessment models will not be affected.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                                <Button
                                    onClick={handleRemove}
                                    disabled={deleting}
                                    variant="destructive"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Removing...
                                        </>
                                    ) : (
                                        "Remove"
                                    )}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}

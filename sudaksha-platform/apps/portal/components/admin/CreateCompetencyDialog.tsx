"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { COMPETENCY_CATEGORY_OPTIONS } from "@/lib/competency-categories";
import { useRoleCompetencyPermissions } from "@/hooks/useRoleCompetencyPermissions";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    category: z.string().min(1, "Please select a category"),
    description: z.string().optional(),
});

export function CreateCompetencyDialog({
    trigger,
    onSuccess,
}: { trigger?: React.ReactNode; onSuccess?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const permissions = useRoleCompetencyPermissions();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: "TECHNICAL",
            description: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const response = await fetch("/api/admin/competencies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                toast.error(err.error || "Failed to create competency");
                return;
            }

            toast.success("Competency created successfully");
            setOpen(false);
            form.reset();
            onSuccess?.();
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Competency
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Competency</DialogTitle>
                    <DialogDescription>
                        Define a new skill or behavioral area for assessments.
                        {!permissions.canApproveGlobal && permissions.creatableScope && (
                            <span className="mt-2 block text-blue-800 bg-blue-50 border border-blue-200 p-2 rounded text-sm font-medium">
                                ℹ️ This competency will be created at <strong>{permissions.creatableScope.toLowerCase()}</strong> level.
                                {permissions.canSubmitForGlobal && " You can submit it for global review after saving."}
                            </span>
                        )}
                        {permissions.isInstitution && (
                            <span className="mt-2 block text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded text-sm font-medium">
                                🔒 Note: Institutions can only create competencies at the Junior/Fresher level.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Competency Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. React.js Development" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {COMPETENCY_CATEGORY_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What does this competency represent?"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" className="bg-red-600" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Competency
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

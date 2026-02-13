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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const formSchema = z.object({
    competencyId: z.string().min(1, "Please select a competency"),
    requiredLevel: z.enum(["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"]),
    weight: z.coerce.number().min(0.1).max(1.0),
});

type FormValues = z.infer<typeof formSchema>;

export function MapCompetencyDialog({
    roleId,
    competencies,
    onSuccess,
}: {
    roleId: string;
    competencies: any[];
    onSuccess?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            competencyId: "",
            requiredLevel: "MIDDLE",
            weight: 1.0,
        },
    });

    async function onSubmit(values: FormValues) {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/roles/${roleId}/competencies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) throw new Error("Failed to map competency");

            toast.success("Competency mapped to role");
            setOpen(false);
            form.reset();
            onSuccess?.() ?? router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Map Competency
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Map Role Competency</DialogTitle>
                    <DialogDescription>
                        Select a skill and define its requirement for this role.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="competencyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Competency</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select competency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {competencies.map(comp => (
                                                <SelectItem key={comp.id} value={comp.id}>
                                                    {comp.name} ({comp.category})
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
                            name="requiredLevel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Required Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="JUNIOR">Junior</SelectItem>
                                            <SelectItem value="MIDDLE">Middle</SelectItem>
                                            <SelectItem value="SENIOR">Senior</SelectItem>
                                            <SelectItem value="EXPERT">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Importance Weight (0.1 to 1.0)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" className="bg-red-600" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Link to Role
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

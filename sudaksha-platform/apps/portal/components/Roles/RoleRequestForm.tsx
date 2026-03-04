"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

const ROLE_LEVELS = ["Junior", "Middle", "Senior", "Management", "Executive"] as const;

const roleRequestSchema = z.object({
    title: z.string().min(3, "Role title is required"),
    department: z.string().min(1, "Department is required"),
    level: z.string().min(1, "Level is required"),
    description: z.string().min(20, "Please provide a detailed description"),
    justification: z.string().min(20, "Please provide a justification for this new role"),
    competencies: z.string().optional(),
});

interface RoleRequestFormProps {
    clientId: string;
    autoApprove?: boolean;
    onSuccess?: (roleId: string) => void;
}

export function RoleRequestForm({ clientId, autoApprove, onSuccess }: RoleRequestFormProps) {
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        fetch(`/api/clients/${clientId}/departments?status=active`)
            .then(r => r.json())
            .then(data => setDepartments(Array.isArray(data) ? data : []))
            .catch(() => setDepartments([]));
    }, [clientId]);

    const form = useForm<z.infer<typeof roleRequestSchema>>({
        resolver: zodResolver(roleRequestSchema),
        defaultValues: {
            title: "",
            department: "",
            level: "",
            description: "",
            justification: "",
        },
    });

    async function onSubmit(data: z.infer<typeof roleRequestSchema>) {
        try {
            const res = await fetch(`/api/clients/${clientId}/roles/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: data.title,
                    department: data.department || undefined,
                    level: data.level,
                    description: data.description || undefined,
                    justification: data.justification || undefined,
                    autoApprove: autoApprove || undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                toast.error(json.error || "Failed to submit request");
                return;
            }
            toast.success(autoApprove ? "Role created successfully!" : "Role request submitted for approval");
            form.reset();
            if (onSuccess && json.roleId) {
                onSuccess(json.roleId);
            }
        } catch {
            toast.error("Failed to submit request");
        }
    }

    return (
        <Card className="max-w-2xl mx-auto shadow-none border-0">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Request New Role</CardTitle>
                <CardDescription>
                    {autoApprove
                        ? "Create a new role definition to assign to your profile immediately."
                        : "Submit a proposal for a new role definition to be added to the organization catalog."}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Senior Data Scientist" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select dept" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map(d => (
                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                ))}
                                                {departments.length === 0 && (
                                                    <SelectItem value="_" disabled>No departments</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ROLE_LEVELS.map(l => (
                                                    <SelectItem key={l} value={l.toLowerCase()}>{l}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the primary responsibilities and scope..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="justification"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Justification</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Why is this role needed now? What value does it bring?"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => form.reset()}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

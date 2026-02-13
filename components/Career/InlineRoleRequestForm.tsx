"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const inlineRoleRequestSchema = z.object({
    roleName: z.string().min(2, "Role name must be at least 2 characters"),
    description: z.string().optional(),
    totalExperienceYears: z.coerce
        .number()
        .min(0, "Total experience must be 0 or more")
        .max(50, "Total experience seems too high"),
});

export type InlineRoleRequestValues = z.infer<typeof inlineRoleRequestSchema>;

export interface InlineRoleRequestFormProps {
    /** Context: "current" for current role request, "aspirational" for aspirational role request */
    context: "current" | "aspirational";
    /** Tenant slug for org-scoped requests (e.g. /org/tra-tz/profile) */
    tenantSlug?: string;
    /** Tenant ID for client-scoped requests (e.g. /clients/[clientId]/profile) */
    tenantId?: string;
    /** Callback after successful submission */
    onSubmitted?: () => void;
    /** Optional: collapse into a compact "Request role" trigger instead of always-visible form */
    compact?: boolean;
}

export function InlineRoleRequestForm({
    context,
    tenantSlug,
    tenantId,
    onSubmitted,
    compact = false,
}: InlineRoleRequestFormProps) {
    const [isExpanded, setIsExpanded] = useState(!compact);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<InlineRoleRequestValues>({
        resolver: zodResolver(inlineRoleRequestSchema),
        defaultValues: {
            roleName: "",
            description: "",
            totalExperienceYears: 0,
        },
    });

    async function onSubmit(data: InlineRoleRequestValues) {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/profile/role-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roleName: data.roleName,
                    description: data.description || null,
                    totalExperienceYears: data.totalExperienceYears,
                    context,
                    tenantSlug,
                    tenantId,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || "Failed to submit role request");
                return;
            }

            toast.success("Role request submitted. Your admin will review and assign the role.");
            form.reset({ roleName: "", description: "", totalExperienceYears: 0 });
            onSubmitted?.();
            if (compact) setIsExpanded(false);
        } catch (err) {
            toast.error("Failed to submit role request");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (compact && !isExpanded) {
        return (
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="mt-2"
            >
                Request a role
            </Button>
        );
    }

    return (
        <div className="mt-4 p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50/50">
            <p className="text-sm font-medium text-gray-700 mb-3">
                {context === "current"
                    ? "No role assigned yet. Request a role for your profile."
                    : "Role not in the list? Request a new role."}
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="roleName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role name *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. Senior Data Scientist"
                                        {...field}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="totalExperienceYears"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total experience (years) *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={50}
                                        placeholder="e.g. 5"
                                        {...field}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (optional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Brief description of the role and responsibilities..."
                                        className="min-h-[80px]"
                                        {...field}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Submit request"
                            )}
                        </Button>
                        {compact && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsExpanded(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}

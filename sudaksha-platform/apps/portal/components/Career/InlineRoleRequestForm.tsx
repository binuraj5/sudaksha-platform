"use client";

import React, { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const OTHER_VALUE = "OTHER";
const FALLBACK_PREFIX = "fallback-";

// Fallback options when API returns empty (e.g. before migration/seed)
const FALLBACK_DEPARTMENTS: Option[] = [
    { id: "fallback-hr", name: "HR", slug: "hr" },
    { id: "fallback-sales", name: "Sales", slug: "sales" },
    { id: "fallback-marketing", name: "Marketing", slug: "marketing" },
    { id: "fallback-finance", name: "Finance", slug: "finance" },
    { id: "fallback-operations", name: "Operations", slug: "operations" },
    { id: "fallback-technology", name: "Technology", slug: "technology" },
    { id: "fallback-engineering", name: "Engineering", slug: "engineering" },
    { id: "fallback-customer-success", name: "Customer Success", slug: "customer-success" },
    { id: "fallback-legal", name: "Legal", slug: "legal" },
    { id: "fallback-product", name: "Product", slug: "product" },
];

const FALLBACK_INDUSTRIES: Option[] = [
    { id: "fallback-information-technology", name: "Information Technology", slug: "information-technology" },
    { id: "fallback-healthcare", name: "Healthcare", slug: "healthcare" },
    { id: "fallback-finance", name: "Finance", slug: "finance" },
    { id: "fallback-manufacturing", name: "Manufacturing", slug: "manufacturing" },
    { id: "fallback-education", name: "Education", slug: "education" },
    { id: "fallback-retail", name: "Retail", slug: "retail" },
    { id: "fallback-telecommunications", name: "Telecommunications", slug: "telecommunications" },
    { id: "fallback-government", name: "Government", slug: "government" },
    { id: "fallback-energy", name: "Energy", slug: "energy" },
    { id: "fallback-consulting", name: "Consulting", slug: "consulting" },
];

const inlineRoleRequestSchema = z.object({
    title: z.string().min(3, "Role title is required"),
    department: z.string().min(1, "Department is required"),
    level: z.string().min(1, "Level is required"),
    description: z.string().min(20, "Please provide a detailed description"),
    justification: z.string().min(20, "Please provide a justification for this new role"),
});

const ROLE_LEVELS = ["Junior", "Middle", "Senior", "Management", "Executive"] as const;

export type InlineRoleRequestValues = z.infer<typeof inlineRoleRequestSchema>;

export interface InlineRoleRequestFormProps {
    /** Context: "current" for current role request, "aspirational" for aspirational role request */
    context: "current" | "aspirational";
    /** Tenant slug for org-scoped requests (e.g. /org/tra-tz/profile) */
    tenantSlug?: string;
    /** Tenant ID for client-scoped requests (e.g. /clients/[clientId]/profile) */
    tenantId?: string;
    /** When true (individual profile), API will use B2C tenant for role request */
    isB2C?: boolean;
    /** Callback after successful submission */
    onSubmitted?: () => void;
    /** Optional: collapse into a compact "Request role" trigger instead of always-visible form */
    compact?: boolean;
}

interface Option {
    id: string;
    name: string;
    slug: string;
}

export function InlineRoleRequestForm({
    context,
    tenantSlug,
    tenantId,
    isB2C,
    onSubmitted,
    compact = false,
}: InlineRoleRequestFormProps) {
    const [isExpanded, setIsExpanded] = useState(!compact);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [departments, setDepartments] = useState<Option[]>([]);
    const [industries, setIndustries] = useState<Option[]>([]);

    useEffect(() => {
        fetch("/api/profile/role-request-options")
            .then((r) => r.ok ? r.json() : { departments: [], industries: [] })
            .then((data) => {
                const dept = data.departments ?? [];
                const ind = data.industries ?? [];
                setDepartments(dept.length > 0 ? dept : FALLBACK_DEPARTMENTS);
                setIndustries(ind.length > 0 ? ind : FALLBACK_INDUSTRIES);
            })
            .catch(() => {
                setDepartments(FALLBACK_DEPARTMENTS);
                setIndustries(FALLBACK_INDUSTRIES);
            });
    }, []);

    const form = useForm<InlineRoleRequestValues>({
        resolver: zodResolver(inlineRoleRequestSchema),
        defaultValues: {
            title: "",
            department: "",
            level: "",
            description: "",
            justification: "",
        },
    });

    async function onSubmit(data: InlineRoleRequestValues) {
        setIsSubmitting(true);
        try {
            const compiledDescription = `Level: ${data.level}\nJustification: ${data.justification}\n\nDescription: ${data.description}`;

            const res = await fetch("/api/profile/role-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roleName: data.title,
                    description: compiledDescription,
                    totalExperienceYears: 0,
                    context,
                    tenantSlug,
                    tenantId,
                    isB2C: isB2C ?? false,
                    departmentId: data.department || null,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || "Failed to submit role request");
                return;
            }

            toast.success("Role request submitted for approval");
            form.reset({
                title: "",
                department: "",
                level: "",
                description: "",
                justification: "",
            });
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
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role Title *</FormLabel>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}
                                        disabled={isSubmitting}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select dept" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {departments.map((d) => (
                                                <SelectItem key={d.id} value={d.id}>
                                                    {d.name}
                                                </SelectItem>
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
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isSubmitting}
                                    >
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
                                        disabled={isSubmitting}
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

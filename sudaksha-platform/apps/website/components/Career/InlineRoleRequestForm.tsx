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

const inlineRoleRequestSchema = z
    .object({
        roleName: z.string().min(2, "Role name must be at least 2 characters"),
        description: z.string().optional(),
        totalExperienceYears: z.coerce
            .number()
            .min(0, "Total experience must be 0 or more")
            .max(50, "Total experience seems too high"),
        departmentId: z.string().optional(),
        departmentOtherText: z.string().optional(),
        industryId: z.string().optional(),
        industryOtherText: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.departmentId === OTHER_VALUE) return (data.departmentOtherText?.trim().length ?? 0) >= 2;
            return true;
        },
        { message: "Please specify your department (at least 2 characters)", path: ["departmentOtherText"] }
    )
    .refine(
        (data) => {
            if (data.industryId === OTHER_VALUE) return (data.industryOtherText?.trim().length ?? 0) >= 2;
            return true;
        },
        { message: "Please specify your industry (at least 2 characters)", path: ["industryOtherText"] }
    );

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
            roleName: "",
            description: "",
            totalExperienceYears: 0,
            departmentId: "",
            departmentOtherText: "",
            industryId: "",
            industryOtherText: "",
        },
    });

    async function onSubmit(data: InlineRoleRequestValues) {
        setIsSubmitting(true);
        try {
            const isDeptFallback = data.departmentId?.startsWith(FALLBACK_PREFIX);
            const departmentId = data.departmentId === OTHER_VALUE || isDeptFallback
                ? undefined
                : data.departmentId || undefined;
            const departmentOtherText = data.departmentId === OTHER_VALUE
                ? data.departmentOtherText?.trim() || undefined
                : isDeptFallback
                    ? (departments.find((d) => d.id === data.departmentId)?.name ?? undefined)
                    : undefined;

            const isIndFallback = data.industryId?.startsWith(FALLBACK_PREFIX);
            const industryId = data.industryId === OTHER_VALUE || isIndFallback
                ? undefined
                : data.industryId || undefined;
            const industryOtherText = data.industryId === OTHER_VALUE
                ? data.industryOtherText?.trim() || undefined
                : isIndFallback
                    ? (industries.find((i) => i.id === data.industryId)?.name ?? undefined)
                    : undefined;

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
                    isB2C: isB2C ?? false,
                    departmentId: departmentId || null,
                    departmentOtherText: departmentOtherText || null,
                    industryId: industryId || null,
                    industryOtherText: industryOtherText || null,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || "Failed to submit role request");
                return;
            }

            toast.success("Role request submitted. Your admin will review and assign the role.");
            form.reset({
                roleName: "",
                description: "",
                totalExperienceYears: 0,
                departmentId: "",
                departmentOtherText: "",
                industryId: "",
                industryOtherText: "",
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
                        name="departmentId"
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
                                            <SelectValue placeholder="Select department (e.g. HR, Sales, Marketing)..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {departments.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value={OTHER_VALUE}>Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {form.watch("departmentId") === OTHER_VALUE && (
                        <FormField
                            control={form.control}
                            name="departmentOtherText"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Specify department *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your department"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="industryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Industry</FormLabel>
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                    disabled={isSubmitting}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select industry..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {industries.map((i) => (
                                            <SelectItem key={i.id} value={i.id}>
                                                {i.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value={OTHER_VALUE}>Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {form.watch("industryId") === OTHER_VALUE && (
                        <FormField
                            control={form.control}
                            name="industryOtherText"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Specify industry *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your industry"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

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

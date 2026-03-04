"use client";

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Plus, Trash2, Save, Send } from "lucide-react";

// --- Schema Definitions ---

const responsibilitySchema = z.object({
    description: z.string().min(5, "Description is required"),
    frequency: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "Annually"]),
    timeAllocation: z.number().min(0).max(100),
    criticality: z.enum(["High", "Medium", "Low"]),
    proficiency: z.enum(["Expert", "Advanced", "Intermediate", "Beginner", "None"]),
});

// Section C: Technical Competencies (Dynamic)
// Note: In a real app, these would come from the database based on Role.
// For now, we'll model them as a fixed set or allow adding custom ones.
const competencySchema = z.object({
    name: z.string(),
    level: z.number().min(1).max(5), // 1-5 scale
    category: z.string(),
});

const myJobSchema = z.object({
    // Section A: Employee Info (Read only)
    employeeId: z.string(),
    department: z.string(),
    designation: z.string(),
    reportingManager: z.string(),
    dateOfJoining: z.string(),
    yearsInCurrentRole: z.number(),
    education: z.string(),
    certifications: z.array(z.string()),

    // Section B: Responsibilities
    primaryFunction: z.string().min(10, "Primary function description required"),
    responsibilities: z.array(responsibilitySchema).refine((items) => {
        const total = items.reduce((sum, item) => sum + item.timeAllocation, 0);
        return Math.abs(total - 100) < 1; // Allow small float error
    }, "Time allocation must total 100%"),

    // Section C & D: Competencies
    technicalCompetencies: z.array(competencySchema),
    behavioralCompetencies: z.array(competencySchema),
});

type MyJobFormValues = z.infer<typeof myJobSchema>;

interface MyJobFormProps {
    initialData?: Partial<MyJobFormValues>;
}

export function MyJobForm({ initialData }: MyJobFormProps) {
    // Mock initial data handling
    const defaultValues: Partial<MyJobFormValues> = {
        employeeId: initialData?.employeeId || "EMP-001",
        department: initialData?.department || "Engineering",
        designation: initialData?.designation || "Senior Developer",
        reportingManager: initialData?.reportingManager || "Jane Manager",
        dateOfJoining: initialData?.dateOfJoining || "2023-01-01",
        yearsInCurrentRole: initialData?.yearsInCurrentRole || 1,
        education: initialData?.education || "B.Tech Computer Science",
        certifications: initialData?.certifications || ["AWS Certified", "Scrum Master"],
        primaryFunction: initialData?.primaryFunction || "",
        responsibilities: initialData?.responsibilities || [
            { description: "Lead frontend development", frequency: "Daily", timeAllocation: 50, criticality: "High", proficiency: "Expert" }
        ],
        technicalCompetencies: initialData?.technicalCompetencies || [
            { name: "React", level: 4, category: "Frontend" },
            { name: "TypeScript", level: 4, category: "Frontend" },
            { name: "Node.js", level: 3, category: "Backend" }
        ],
        behavioralCompetencies: initialData?.behavioralCompetencies || [
            { name: "Communication", level: 4, category: "Leadership" },
            { name: "Team Work", level: 5, category: "Core" }
        ]
    };

    const form = useForm<MyJobFormValues>({
        resolver: zodResolver(myJobSchema),
        defaultValues: defaultValues as MyJobFormValues, // Cast for simplicity in mock
        mode: "onChange",
    });

    const { fields: respFields, append: appendResp, remove: removeResp } = useFieldArray({
        control: form.control,
        name: "responsibilities",
    });

    const totalAllocation = form.watch("responsibilities").reduce((sum, item) => sum + (Number(item.timeAllocation) || 0), 0);

    async function onSubmit(data: MyJobFormValues) {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: 'Saving job details...',
                success: 'Job details updated successfully!',
                error: 'Failed to update job details',
            }
        );
        console.log("Submitted:", data);
    }

    // Helper for star rating
    const StarRating = ({ value, onChange, label }: { value: number, onChange: (val: number) => void, label: string }) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium">{label}</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`h-6 w-6 rounded-full border text-xs flex items-center justify-center transition-colors ${value >= star ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-muted-foreground/30"
                            }`}
                        title={`Level ${star}`}
                    >
                        {star}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Section A: Employee Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>A. Employee Information</CardTitle>
                        <CardDescription>Verify your current employment details.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Employee ID</span>
                            <div className="font-medium">{form.getValues("employeeId")}</div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Department</span>
                            <div className="font-medium">{form.getValues("department")}</div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Designation</span>
                            <div className="font-medium">{form.getValues("designation")}</div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Reporting Manager</span>
                            <div className="font-medium">{form.getValues("reportingManager")}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section B: Responsibilities */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>B. Current Role Responsibilities</CardTitle>
                            <CardDescription>Define your key responsibilities and time allocation.</CardDescription>
                        </div>
                        <Badge variant={totalAllocation === 100 ? "default" : "destructive"}>
                            Total: {totalAllocation}%
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="primaryFunction"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Primary Job Function</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe the main purpose of your role..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">Key Responsibilities</h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendResp({
                                        description: "",
                                        frequency: "Daily",
                                        timeAllocation: 0,
                                        criticality: "Medium",
                                        proficiency: "Intermediate"
                                    })}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Add
                                </Button>
                            </div>

                            {respFields.map((field, index) => (
                                <Card key={field.id} className="p-4 bg-muted/20">
                                    <div className="grid gap-4">
                                        <div className="flex gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`responsibilities.${index}.description`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input placeholder="Responsibility description" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeResp(index)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`responsibilities.${index}.frequency`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Frequency</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {["Daily", "Weekly", "Monthly", "Quarterly", "Annually"].map(opt => (
                                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`responsibilities.${index}.timeAllocation`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Allocation (%)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={e => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`responsibilities.${index}.criticality`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Criticality</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {["High", "Medium", "Low"].map(opt => (
                                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`responsibilities.${index}.proficiency`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Proficiency</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {["Expert", "Advanced", "Intermediate", "Beginner", "None"].map(opt => (
                                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Section C: Technical Competencies */}
                <Card>
                    <CardHeader>
                        <CardTitle>C. Technical Competencies</CardTitle>
                        <CardDescription>Rate your proficiency in key technical skills (1-5).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {["Frontend", "Backend", "Database"].map((category, idx) => (
                                <AccordionItem key={category} value={category}>
                                    <AccordionTrigger>{category}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 pt-2">
                                            {form.watch("technicalCompetencies")
                                                .map((comp, index) => {
                                                    if (comp.category !== category && idx !== 0) return null; // Simple filter for demo
                                                    // Note: In real app, proper filtering logic needed
                                                    if (idx === 0 && comp.category !== "Frontend") return null;
                                                    if (idx === 1 && comp.category !== "Backend") return null;

                                                    return (
                                                        <FormField
                                                            key={index}
                                                            control={form.control}
                                                            name={`technicalCompetencies.${index}.level`}
                                                            render={({ field }) => (
                                                                <StarRating
                                                                    label={comp.name}
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                />
                                                            )}
                                                        />
                                                    )
                                                })}
                                            {/* Add Mock items if empty filter to show UI */}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4 sticky bottom-4 p-4 bg-background/80 backdrop-blur border rounded-lg shadow-lg">
                    <div className="flex items-center text-sm text-muted-foreground mr-auto">
                        Last saved: Just now
                    </div>
                    <Button type="button" variant="outline">
                        <Save className="mr-2 h-4 w-4" /> Save Draft
                    </Button>
                    <Button type="submit">
                        Submit Details <Send className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Form>
    );
}

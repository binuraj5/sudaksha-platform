"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save, Send, Target, TrendingUp, BookOpen, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Schema Definitions ---

const aspirationalRoleSchema = z.object({
    roleId: z.string().min(1, "Please select a role"),
    timeline: z.enum(["1 Year", "2-3 Years", "3-5 Years"]),
    careerTrack: z.enum(["Technical Leadership", "Management", "Specialist", "Cross-functional"]),
});

const learningPreferencesSchema = z.object({
    methods: z.array(z.string()).min(1, "Select at least one learning method"),
    hoursPerWeek: z.number().min(1).max(40),
    preferredTiming: z.enum(["Working hours", "After hours", "Weekends"]),
    barriers: z.string().optional(),
});

const selfAssessmentSchema = z.object({
    strengths: z.array(z.string()).min(1), // Basic string array for now
    improvements: z.array(z.string()).min(1),
    motivation: z.string().max(500),
    vision: z.string().max(500),
});

// Gap Analysis Mock Data
const MOCK_GAPS = [
    { competency: "System Design", current: 3, required: 5, gap: "HIGH" },
    { competency: "Cloud Architecture", current: 2, required: 4, gap: "MEDIUM" },
    { competency: "Team Leadership", current: 4, required: 4, gap: "NONE" },
];

export function CareerAspirationsForm() {
    const [activeTab, setActiveTab] = useState("role");

    const form = useForm({
        defaultValues: {
            role: {
                roleId: "",
                timeline: "2-3 Years",
                careerTrack: "Technical Leadership",
            },
            learning: {
                methods: [],
                hoursPerWeek: 5,
                preferredTiming: "Working hours",
                barriers: "",
            },
            assessment: {
                strengths: ["", "", ""],
                improvements: ["", "", ""],
                motivation: "",
                vision: "",
            }
        }
    });

    const onSubmit = (data: any) => {
        console.log("Submitted Career Plan:", data);
        toast.success("Career plan saved successfully!");
    };

    // Helper to render gap visualization
    const GapVisual = ({ gap }: { gap: string }) => {
        const colors = {
            HIGH: "bg-red-500",
            MEDIUM: "bg-yellow-500",
            LOW: "bg-green-500",
            NONE: "bg-gray-300"
        };
        const width = {
            HIGH: "w-24",
            MEDIUM: "w-16",
            LOW: "w-8",
            NONE: "w-4"
        };

        return (
            <div className="flex items-center gap-2">
                <div className={`h-2 rounded-full ${colors[gap as keyof typeof colors]} ${width[gap as keyof typeof width]}`} />
                <span className={`text-xs font-bold ${gap === 'HIGH' ? 'text-red-600' : gap === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {gap}
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="role">Target Role</TabsTrigger>
                            <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
                            <TabsTrigger value="learning">Learning Plan</TabsTrigger>
                            <TabsTrigger value="assessment">Self Assessment</TabsTrigger>
                        </TabsList>

                        {/* Section E: Aspirational Role */}
                        <TabsContent value="role" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-primary" />
                                        Aspirational Role
                                    </CardTitle>
                                    <CardDescription>
                                        Define your career north star and timeline.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        name="role.roleId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Target Role</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a role..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="role-1">Principal Software Engineer</SelectItem>
                                                        <SelectItem value="role-2">Engineering Manager</SelectItem>
                                                        <SelectItem value="role-3">Product Manager</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField
                                            name="role.timeline"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Target Timeline</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="1 Year">Within 1 Year</SelectItem>
                                                            <SelectItem value="2-3 Years">2-3 Years</SelectItem>
                                                            <SelectItem value="3-5 Years">3-5 Years</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            name="role.careerTrack"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Preferred Track</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Technical Leadership">Technical Leadership</SelectItem>
                                                            <SelectItem value="Management">Management</SelectItem>
                                                            <SelectItem value="Specialist">Specialist / Expert</SelectItem>
                                                            <SelectItem value="Cross-functional">Cross-functional</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex justify-end">
                                <Button type="button" onClick={() => setActiveTab("gaps")}>
                                    Next: Gap Analysis
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Section F & G: Gap Analysis */}
                        <TabsContent value="gaps" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Competency Gap Analysis
                                    </CardTitle>
                                    <CardDescription>
                                        Here is how your current profile compares to the Principal Software Engineer role.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {MOCK_GAPS.map((item, idx) => (
                                            <div key={idx} className="border p-4 rounded-lg flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold">{item.competency}</h4>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                        <span>Current: {item.current}/5</span>
                                                        <span>Required: {item.required}/5</span>
                                                    </div>
                                                </div>
                                                <GapVisual gap={item.gap} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex justify-between">
                                <Button variant="outline" type="button" onClick={() => setActiveTab("role")}>
                                    Back
                                </Button>
                                <Button type="button" onClick={() => setActiveTab("learning")}>
                                    Next: Learning Plan
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Section H: Learning Preferences */}
                        <TabsContent value="learning" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                        Learning Preferences
                                    </CardTitle>
                                    <CardDescription>
                                        How do you prefer to close your skill gaps?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        name="learning.methods"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="mb-4 block">Preferred Methods</FormLabel>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {["Classroom Training", "Online / E-learning", "Mentoring", "Workshops", "Certification", "Self-study"].map((method) => (
                                                        <FormItem key={method} className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    // Simple mock checked logic since we are using untyped form for speed
                                                                    checked={field.value?.includes(method)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...(field.value || []), method])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value: any) => value !== method
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {method}
                                                            </FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField
                                            name="learning.hoursPerWeek"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Hours Available / Week</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="learning.preferredTiming"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Preferred Timing</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Working hours">Working hours</SelectItem>
                                                            <SelectItem value="After hours">After hours</SelectItem>
                                                            <SelectItem value="Weekends">Weekends</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        name="learning.barriers"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Barriers to Learning</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Any constraints? e.g. Time, budget..." {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            <div className="flex justify-between">
                                <Button variant="outline" type="button" onClick={() => setActiveTab("gaps")}>
                                    Back
                                </Button>
                                <Button type="button" onClick={() => setActiveTab("assessment")}>
                                    Next: Self Assessment
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Section I: Self Assessment */}
                        <TabsContent value="assessment" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-primary" />
                                        Self Assessment
                                    </CardTitle>
                                    <CardDescription>
                                        Reflect on your motivation and vision.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <FormLabel>Top 3 Strengths</FormLabel>
                                            {[0, 1, 2].map(i => (
                                                <Input key={i} placeholder={`Strength ${i + 1}`} {...form.register(`assessment.strengths.${i}`)} />
                                            ))}
                                        </div>
                                        <div className="space-y-4">
                                            <FormLabel>Top 3 Areas for Improvement</FormLabel>
                                            {[0, 1, 2].map(i => (
                                                <Input key={i} placeholder={`Improvement ${i + 1}`} {...form.register(`assessment.improvements.${i}`)} />
                                            ))}
                                        </div>
                                    </div>

                                    <FormField
                                        name="assessment.motivation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Career Motivation</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="What drives you?" className="min-h-[100px]" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        name="assessment.vision"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>5-Year Vision</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Where do you see yourself in 5 years?" className="min-h-[100px]" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            <div className="flex justify-between">
                                <Button variant="outline" type="button" onClick={() => setActiveTab("learning")}>
                                    Back
                                </Button>
                                <Button type="submit">
                                    Save Career Plan <Save className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>
        </div>
    );
}

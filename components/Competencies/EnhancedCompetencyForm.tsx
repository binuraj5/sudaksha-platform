"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Sparkles,
    Save,
    Eye,
    Check,
    AlertCircle,
    Hash,
    Briefcase,
    Tag
} from "lucide-react";
import { IndicatorType, ProficiencyLevel, CompetencyCategory, Industry } from "@prisma/client";
import { COMPETENCY_CATEGORIES } from "@/lib/competency-categories";
import { IndicatorManager } from "./IndicatorManager";
import { CompetencyPreview } from "./CompetencyPreview";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const indicatorSchema = z.object({
    text: z.string().min(5, "Indicator text is too short"),
    type: z.nativeEnum(IndicatorType),
    level: z.nativeEnum(ProficiencyLevel),
});

const competencyFormSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100),
    code: z.string().optional(),
    category: z.nativeEnum(CompetencyCategory),
    description: z.string().min(20, "Description should be detailed (min 20 chars)").max(1000),
    industries: z.array(z.nativeEnum(Industry)).min(1, "Select at least one industry"),
    indicators: z.array(indicatorSchema).min(12, "Please add at least 3 indicators for each of the 4 levels (12 total minimum)"),
});

type CompetencyFormValues = z.infer<typeof competencyFormSchema>;

export function EnhancedCompetencyForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const form = useForm<CompetencyFormValues>({
        resolver: zodResolver(competencyFormSchema),
        defaultValues: {
            name: "",
            code: "",
            category: "TECHNICAL",
            description: "",
            industries: ["GENERIC"],
            indicators: [],
        },
    });

    const onSubmit = async (data: CompetencyFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/assessments/admin/competencies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to create competency");

            toast.success("Competency created successfully!");
            router.push("/assessments/admin/competencies");
        } catch (error) {
            toast.error("An error occurred. Please check the form data.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleIndustry = (industry: Industry) => {
        const current = form.getValues("industries");
        if (current.includes(industry)) {
            form.setValue("industries", current.filter(i => i !== industry));
        } else {
            form.setValue("industries", [...current, industry]);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                {/* Header Section */}
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 lowercase">Create <span className="text-indigo-600">Competency</span></h1>
                        <p className="text-slate-500 font-medium italic">Define domain expertise, performance indicators, and proficiency benchmarks.</p>
                    </div>
                    <div className="flex gap-3">
                        <Dialog open={showPreview} onOpenChange={setShowPreview}>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl font-bold italic h-12 px-6 border-slate-200"
                                >
                                    <Eye className="w-4 h-4 mr-2" /> Live Preview
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-0">
                                <div className="p-10">
                                    <DialogHeader className="mb-8">
                                        <DialogTitle className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Competency Preview Mode</DialogTitle>
                                    </DialogHeader>
                                    <CompetencyPreview data={form.getValues()} />
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button
                            type="submit"
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black italic h-12 px-8 shadow-lg shadow-indigo-100"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Publish Competency"} <Save className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Metrics & Basic Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-slate-50 p-6 rounded-[2rem] space-y-6">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Basic Configuration</h2>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold italic text-slate-700">Competency Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Full Stack Development" {...field} className="rounded-xl border-white shadow-sm h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold italic text-slate-700 flex items-center">
                                            <Hash className="w-3 h-3 mr-1" /> Reference Code
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="COMP-001" {...field} className="rounded-xl border-white shadow-sm h-12" />
                                        </FormControl>
                                        <FormDescription className="text-[10px] font-medium italic">Auto-generated if left blank.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold italic text-slate-700 flex items-center">
                                            <Briefcase className="w-3 h-3 mr-1" /> Category
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-white shadow-sm h-12 bg-white">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-slate-100">
                                                {Object.entries(COMPETENCY_CATEGORIES).map(([key, config]: [string, { label: string; description: string; icon: string; examples: string[] }]) => (
                                                    <SelectItem key={key} value={key} className="py-3 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <span>{config.icon}</span>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold italic text-sm">{config.label}</span>
                                                                <span className="text-[10px] text-slate-400">{config.description}</span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="bg-slate-50 p-6 rounded-[2rem] space-y-6">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Industry Context</h2>
                            <div className="flex flex-wrap gap-2">
                                {(Object.values(Industry) as Industry[]).map((ind: Industry) => (
                                    <Badge
                                        key={ind}
                                        variant={(form.watch("industries") as Industry[]).includes(ind) ? "default" : "outline"}
                                        className={cn(
                                            "rounded-lg px-3 py-1 cursor-pointer transition-all border-slate-200",
                                            (form.watch("industries") as Industry[]).includes(ind)
                                                ? "bg-indigo-600 text-white border-transparent"
                                                : "bg-white text-slate-500 hover:bg-slate-100"
                                        )}
                                        onClick={() => toggleIndustry(ind)}
                                    >
                                        {ind.replace(/_/g, " ").toLowerCase()}
                                    </Badge>
                                ))}
                            </div>
                            <FormMessage>{form.formState.errors.industries?.message}</FormMessage>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info & Indicators */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white ring-1 ring-slate-100/50">
                            <CardContent className="p-10 space-y-10">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xl font-black italic tracking-tight lowercase">Description & <span className="text-indigo-600 font-serif not-italic">Scope</span></FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Define the scope of this competency..."
                                                    className="min-h-[150px] rounded-3xl border-slate-100 focus:ring-indigo-100 focus:border-indigo-200 resize-none p-6 text-slate-600 font-medium leading-relaxed"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="italic text-slate-400 font-medium">Be precise. This helps AI generate accurate assessment questions.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black italic tracking-tight lowercase">Proficiency <span className="text-indigo-600 font-serif not-italic">Indicators</span></h2>
                                        <Badge variant="outline" className="rounded-full font-bold italic text-indigo-600 bg-indigo-50 border-indigo-100 px-4 py-1">
                                            {form.watch("indicators").length} Total
                                        </Badge>
                                    </div>

                                    <IndicatorManager
                                        indicators={form.watch("indicators") as { text: string; type: IndicatorType; level: ProficiencyLevel }[]}
                                        onChange={(newIndicators: { text: string; type: IndicatorType; level: ProficiencyLevel }[]) => form.setValue("indicators", newIndicators, { shouldValidate: true })}
                                    />
                                    {form.formState.errors.indicators && (
                                        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold italic animate-in fade-in zoom-in duration-300">
                                            <AlertCircle className="w-5 h-5" />
                                            {form.formState.errors.indicators.message}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}

"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { ProficiencyLevel, IndicatorType } from "@sudaksha/db-core";
import { cn } from "@/lib/utils";

interface Indicator {
    id?: string;
    text: string;
    type: IndicatorType;
    level: ProficiencyLevel;
}

interface IndicatorManagerProps {
    indicators: Indicator[];
    onChange: (indicators: Indicator[]) => void;
}

export function IndicatorManager({ indicators, onChange }: IndicatorManagerProps) {
    const [activeTab, setActiveTab] = useState<ProficiencyLevel>("JUNIOR");

    const addIndicator = (type: IndicatorType) => {
        const newIndicator: Indicator = {
            text: "",
            type,
            level: activeTab
        };
        onChange([...indicators, newIndicator]);
    };

    const removeIndicator = (index: number) => {
        const newIndicators = [...indicators];
        const indicatorToRemove = getLevelIndicators(activeTab).filter((_, i) => i === index)[0];
        const globalIndex = indicators.findIndex(ind => ind === indicatorToRemove);
        if (globalIndex > -1) {
            newIndicators.splice(globalIndex, 1);
            onChange(newIndicators);
        }
    };

    const updateIndicator = (index: number, text: string) => {
        const newIndicators = [...indicators];
        const indicatorToUpdate = getLevelIndicators(activeTab).filter((_, i) => i === index)[0];
        const globalIndex = indicators.findIndex(ind => ind === indicatorToUpdate);
        if (globalIndex > -1) {
            newIndicators[globalIndex] = { ...newIndicators[globalIndex], text };
            onChange(newIndicators);
        }
    };

    const getLevelIndicators = (level: ProficiencyLevel) => {
        return indicators.filter(i => i.level === level);
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="JUNIOR" className="w-full" onValueChange={(v) => setActiveTab(v as ProficiencyLevel)}>
                <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl h-12">
                    <TabsTrigger value="JUNIOR" className="rounded-lg font-bold italic data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Junior</TabsTrigger>
                    <TabsTrigger value="MIDDLE" className="rounded-lg font-bold italic data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Middle</TabsTrigger>
                    <TabsTrigger value="SENIOR" className="rounded-lg font-bold italic data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Senior</TabsTrigger>
                    <TabsTrigger value="EXPERT" className="rounded-lg font-bold italic data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Expert</TabsTrigger>
                </TabsList>

                {(["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"] as ProficiencyLevel[]).map((level) => (
                    <TabsContent key={level} value={level} className="mt-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Positive Indicators */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h3 className="font-black italic text-slate-800 lowercase tracking-tight">Positive <span className="text-green-600 font-serif not-italic">Indicators</span></h3>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addIndicator("POSITIVE")}
                                    className="rounded-xl font-bold italic border-green-100 text-green-600 bg-green-50 hover:bg-green-100 h-9"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {getLevelIndicators(level).filter(i => i.type === "POSITIVE").map((ind, i) => (
                                    <div key={i} className="flex gap-3 items-center group">
                                        <span className="text-slate-300 font-black italic text-xs w-4">0{i + 1}</span>
                                        <Input
                                            placeholder="e.g., Consistently write clean, documented code..."
                                            value={ind.text}
                                            onChange={(e) => updateIndicator(indicators.indexOf(ind), e.target.value)}
                                            className="rounded-xl border-slate-100 focus:ring-green-100 focus:border-green-200 transition-all shadow-sm"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeIndicator(indicators.indexOf(ind))}
                                            className="rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 h-10 w-10 shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {getLevelIndicators(level).filter(i => i.type === "POSITIVE").length === 0 && (
                                    <p className="text-slate-400 text-sm italic font-medium py-4 text-center border-2 border-dashed border-slate-50 rounded-2xl">
                                        No positive indicators defined for this level.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Negative Indicators */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <h3 className="font-black italic text-slate-800 lowercase tracking-tight">Negative <span className="text-red-600 font-serif not-italic">Indicators</span></h3>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addIndicator("NEGATIVE")}
                                    className="rounded-xl font-bold italic border-red-100 text-red-600 bg-red-50 hover:bg-red-100 h-9"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {getLevelIndicators(level).filter(i => i.type === "NEGATIVE").map((ind, i) => (
                                    <div key={i} className="flex gap-3 items-center group">
                                        <span className="text-slate-300 font-black italic text-xs w-4">0{i + 1}</span>
                                        <Input
                                            placeholder="e.g., Fails to handle basic errors or follows poor patterns..."
                                            value={ind.text}
                                            onChange={(e) => updateIndicator(indicators.indexOf(ind), e.target.value)}
                                            className="rounded-xl border-slate-100 focus:ring-red-100 focus:border-red-200 transition-all shadow-sm"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeIndicator(indicators.indexOf(ind))}
                                            className="rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 h-10 w-10 shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {getLevelIndicators(level).filter(i => i.type === "NEGATIVE").length === 0 && (
                                    <p className="text-slate-400 text-sm italic font-medium py-4 text-center border-2 border-dashed border-slate-50 rounded-2xl">
                                        No negative indicators defined. Red flags help in accurate evaluation.
                                    </p>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

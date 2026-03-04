"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedCompetencyForm } from "@/components/Competencies/EnhancedCompetencyForm";

export default function CreateCompetencyPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <div className="max-w-[1400px] mx-auto p-8 space-y-12">
                {/* Navigation & Context */}
                <div className="flex justify-between items-center">
                    <Link href="/assessments/admin/competencies">
                        <Button variant="ghost" className="rounded-xl font-black italic text-slate-400 hover:text-indigo-600 hover:bg-white gap-2 px-4 shadow-sm">
                            <ChevronLeft className="w-4 h-4" /> Back to Library
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-bold italic text-sm border border-indigo-100/50">
                        <Info className="w-4 h-4" /> Super Admin Control
                    </div>
                </div>

                {/* Main Form Area */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <EnhancedCompetencyForm />
                </div>
            </div>
        </div>
    );
}

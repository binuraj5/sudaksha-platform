"use client";

import { useState } from "react";
import { Briefcase, GraduationCap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ModeSwitcherProps {
    currentMode: "PROFESSIONAL" | "STUDENT";
    onModeChange: (mode: "PROFESSIONAL" | "STUDENT") => void;
}

export function ModeSwitcher({ currentMode, onModeChange }: ModeSwitcherProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSwitch = async () => {
        setIsLoading(true);
        const newMode = currentMode === "PROFESSIONAL" ? "STUDENT" : "PROFESSIONAL";

        try {
            const res = await fetch("/api/individuals/profile/mode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userMode: newMode }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to switch mode");
            }

            onModeChange(newMode);
            toast.success(`Switched to ${newMode === "PROFESSIONAL" ? "Professional" : "Student"} Mode`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to switch mode");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentMode === "PROFESSIONAL" ? "bg-indigo-100 text-indigo-700" : "text-gray-500"}`}>
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Professional</span>
            </div>

            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={handleSwitch} disabled={isLoading}>
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentMode === "STUDENT" ? "bg-indigo-100 text-indigo-700" : "text-gray-500"}`}>
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">Student</span>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface StartAssessmentButtonProps {
    modelId: string;
    children?: React.ReactNode;
    variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

/**
 * M15 B2C: Start self-selected assessment
 * Calls API to create MemberAssessment (checks free tier), then redirects to take page
 */
export function StartAssessmentButton({
    modelId,
    children,
    variant = "ghost",
    size = "sm",
    className = "",
}: StartAssessmentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleStart = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch("/api/individuals/assessments/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ modelId }),
            });
            const data = await res.json().catch(() => ({}));

            // SEPL/INT/2026/IMPL-GAPS-01 Step G14 — friendly retake-lockout messaging
            if (res.status === 403 && data?.error === "RETAKE_LOCKED") {
                const when = data.retakeAvailableAt
                    ? new Date(data.retakeAvailableAt).toLocaleDateString(undefined, {
                          day: "numeric", month: "long", year: "numeric",
                      })
                    : null;
                toast.error(
                    when
                        ? `Retake locked. You can retake this assessment on ${when}.`
                        : data.message || "This assessment is currently locked for retake."
                );
                return;
            }
            if (res.status === 403 && data?.error === "RETAKE_LIMIT_REACHED") {
                toast.error(
                    data.message ||
                        `Maximum attempts reached (${data.maxAttempts ?? "limit"}). No further retakes available.`
                );
                return;
            }

            if (!res.ok) {
                throw new Error(data.error || "Failed to start assessment");
            }

            const memberAssessmentId = data.memberAssessmentId ?? data.assessmentId;
            if (memberAssessmentId) {
                router.push(`/assessments/take/${memberAssessmentId}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to start assessment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleStart}
            disabled={isLoading}
            asChild={false}
        >
            {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
                children ?? (
                    <>
                        Start <ArrowRight className="w-3 h-3 ml-1" />
                    </>
                )
            )}
        </Button>
    );
}

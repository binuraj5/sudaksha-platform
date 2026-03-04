"use client";

/**
 * LevelSelector — Phase B #5: Student Experience Level Restrictions
 *
 * Renders a 4-button level picker (JUNIOR | MIDDLE | SENIOR | EXPERT).
 * Polymorphic behaviour:
 *   - Corporate Employees, B2C Individuals, Institution Admins → all 4 levels enabled
 *   - Institution Students (not graduated) → SENIOR and EXPERT grayed out with tooltip
 *   - Institution Students (graduated) → all 4 levels enabled
 *
 * API-level enforcement already exists in:
 *   - /api/org/[slug]/assessments/assign-csv
 *   - /api/clients/[clientId]/assessments/assign
 *   - /api/org/[slug]/assessments/assign-unit
 *
 * This component is the UX guard layer only.
 */

import { STUDENT_LEVEL_TOOLTIP } from "@/lib/assessment-student-restrictions";

export type ProficiencyLevelStr = "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";

interface LevelOption {
    value: ProficiencyLevelStr;
    label: string;
    description: string;
}

const LEVEL_OPTIONS: LevelOption[] = [
    { value: "JUNIOR", label: "Junior", description: "Entry-level proficiency" },
    { value: "MIDDLE", label: "Middle", description: "Intermediate proficiency" },
    { value: "SENIOR", label: "Senior", description: "Advanced proficiency" },
    { value: "EXPERT", label: "Expert", description: "Expert-level mastery" },
];

const RESTRICTED_LEVELS: ProficiencyLevelStr[] = ["SENIOR", "EXPERT"];

interface LevelSelectorProps {
    value: ProficiencyLevelStr;
    onChange: (level: ProficiencyLevelStr) => void;
    /** Pass 'STUDENT' to potentially restrict levels; any other value = no restriction */
    memberType?: string;
    /** If the student has graduated, all levels become available again */
    hasGraduated?: boolean;
    disabled?: boolean;
    className?: string;
}

export function LevelSelector({
    value,
    onChange,
    memberType,
    hasGraduated = false,
    disabled = false,
    className = "",
}: LevelSelectorProps) {
    const isStudentRestricted = memberType === "STUDENT" && !hasGraduated;

    const isRestricted = (level: ProficiencyLevelStr) =>
        isStudentRestricted && RESTRICTED_LEVELS.includes(level);

    return (
        <div className={`space-y-3 ${className}`}>
            {isStudentRestricted && (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span>{STUDENT_LEVEL_TOOLTIP}</span>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {LEVEL_OPTIONS.map((level) => {
                    const locked = isRestricted(level.value);
                    const selected = value === level.value;

                    return (
                        <button
                            key={level.value}
                            type="button"
                            onClick={() => !locked && !disabled && onChange(level.value)}
                            disabled={locked || disabled}
                            title={locked ? STUDENT_LEVEL_TOOLTIP : level.description}
                            aria-label={`${level.label}${locked ? " (locked)" : ""}`}
                            className={[
                                "relative p-3 rounded-xl border-2 text-center transition-all select-none",
                                selected && !locked
                                    ? "border-indigo-600 bg-indigo-50 shadow-sm"
                                    : locked
                                        ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50/50 cursor-pointer",
                                disabled && !locked ? "opacity-60 cursor-not-allowed" : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            <div
                                className={`text-sm font-bold ${selected && !locked ? "text-indigo-700" : locked ? "text-gray-400" : "text-gray-700"}`}
                            >
                                {level.label}
                            </div>
                            <div className="text-xs mt-0.5 text-gray-400">
                                {locked ? "🔒 Locked" : level.description}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Competency proficiency level options — matches the level values used in
 * CompetencyDevelopmentRequest.level and Competency.allowedLevels.
 */
export const COMPETENCY_LEVEL_OPTIONS = [
    { value: "JUNIOR", label: "Junior / Fresher" },
    { value: "MIDDLE", label: "Middle" },
    { value: "SENIOR", label: "Senior" },
    { value: "EXPERT", label: "Expert" },
] as const;

export type CompetencyLevelKey = (typeof COMPETENCY_LEVEL_OPTIONS)[number]["value"];

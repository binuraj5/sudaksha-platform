import { TenantType } from "@prisma/client";

export interface TenantFeatures {
    hasCurriculum: boolean;
    hasProjects: boolean;
    hasBulkUpload: boolean;
    hasAIInterviews: boolean;
}

export function getTenantFeatures(type: TenantType): TenantFeatures {
    switch (type) {
        case "INSTITUTION":
            return {
                hasCurriculum: true,
                hasProjects: false, // Institutions use Curriculums instead of Projects
                hasBulkUpload: true,
                hasAIInterviews: true,
            };
        case "CORPORATE":
        default:
            return {
                hasCurriculum: false, // Corporates use Projects
                hasProjects: true,
                hasBulkUpload: true,
                hasAIInterviews: true,
            };
    }
}

export function isInstitution(type: TenantType) {
    return type === "INSTITUTION";
}

export function isCorporate(type: TenantType) {
    return type === "CORPORATE";
}

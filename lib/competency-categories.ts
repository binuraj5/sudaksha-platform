/**
 * Unified competency category source - matches Prisma CompetencyCategory enum.
 * Use this for all competency forms (manual, AI, bulk upload) to ensure consistency.
 */
export const COMPETENCY_CATEGORIES = {
    TECHNICAL: {
        label: 'Technical',
        description: 'Hard skills specific to a domain or technology',
        icon: '🔧',
        examples: ['Programming', 'Data Analysis', 'Design', 'Network Security']
    },
    BEHAVIORAL: {
        label: 'Behavioral',
        description: 'Soft skills and personality traits that drive success',
        icon: '🧠',
        examples: ['Problem Solving', 'Adaptability', 'Teamwork', 'Emotional Intelligence']
    },
    COGNITIVE: {
        label: 'Cognitive',
        description: 'Mental abilities for analysis, reasoning, and decision-making',
        icon: '🧩',
        examples: ['Critical Thinking', 'Analytical Reasoning', 'Problem Solving', 'Strategic Planning']
    },
    DOMAIN_SPECIFIC: {
        label: 'Domain Specific',
        description: 'Expertise in a particular industry or business function',
        icon: '🏢',
        examples: ['Supply Chain', 'Financial Compliance', 'Sales Strategy']
    }
} as const;

export type CompetencyCategoryKey = keyof typeof COMPETENCY_CATEGORIES;

/** Category keys in display order - use for dropdowns */
export const COMPETENCY_CATEGORY_OPTIONS: { value: CompetencyCategoryKey; label: string }[] = Object.entries(
    COMPETENCY_CATEGORIES
).map(([key, config]) => ({ value: key as CompetencyCategoryKey, label: config.label }));

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
    LEADERSHIP: {
        label: 'Leadership',
        description: 'Abilities related to managing people, strategy, and vision',
        icon: '👔',
        examples: ['Decision Making', 'Delegation', 'Visionary Thinking', 'Strategic Planning']
    },
    COMMUNICATION: {
        label: 'Communication',
        description: 'Interpersonal skills and effective data transmission',
        icon: '💬',
        examples: ['Public Speaking', 'Writing', 'Active Listening', 'Conflict Resolution']
    },
    DOMAIN_SPECIFIC: {
        label: 'Domain Specific',
        description: 'Expertise in a particular industry or business function',
        icon: '🏢',
        examples: ['Supply Chain', 'Financial Compliance', 'Sales Strategy']
    }
};

export type CompetencyCategoryKey = keyof typeof COMPETENCY_CATEGORIES;

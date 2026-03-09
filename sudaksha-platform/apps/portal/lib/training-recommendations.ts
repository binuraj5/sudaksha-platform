/**
 * Static competency → training programme mapping for TNI auto-generation.
 * Key: competency name (lowercase, normalised for matching).
 * Value: recommended programme with level-specific guidance.
 */

export interface TrainingProgramme {
    title: string;
    provider: string;
    format: "Classroom" | "Online" | "Blended" | "On-the-Job";
    durationDays: number;
    targetLevels: string[];  // Which gap priorities this addresses
    description: string;
}

export const COMPETENCY_TRAINING_MAP: Record<string, TrainingProgramme[]> = {
    // ── ICT / Technical ───────────────────────────────────────────────────
    "network administration": [
        { title: "CompTIA Network+ Certification", provider: "CompTIA", format: "Blended", durationDays: 5, targetLevels: ["HIGH", "MEDIUM"], description: "Foundational network administration, TCP/IP, routing, and troubleshooting." },
        { title: "Cisco CCNA Routing & Switching", provider: "Cisco", format: "Classroom", durationDays: 10, targetLevels: ["HIGH"], description: "Enterprise-grade routing and switching for mid-level network engineers." },
    ],
    "cybersecurity": [
        { title: "CompTIA Security+ Certification", provider: "CompTIA", format: "Blended", durationDays: 5, targetLevels: ["HIGH", "MEDIUM"], description: "Core cybersecurity principles, threat detection, and incident response." },
        { title: "Certified Ethical Hacker (CEH)", provider: "EC-Council", format: "Classroom", durationDays: 10, targetLevels: ["HIGH"], description: "Advanced penetration testing and ethical hacking methodologies." },
    ],
    "database management": [
        { title: "Oracle Database Administration", provider: "Oracle University", format: "Blended", durationDays: 5, targetLevels: ["HIGH", "MEDIUM"], description: "DB architecture, administration, backup, and performance tuning." },
        { title: "PostgreSQL Advanced Administration", provider: "2ndQuadrant", format: "Online", durationDays: 3, targetLevels: ["MEDIUM"], description: "Advanced PostgreSQL features, replication, and high availability." },
    ],
    "systems analysis": [
        { title: "Systems Analysis and Design Fundamentals", provider: "Sudaksha", format: "Classroom", durationDays: 3, targetLevels: ["HIGH", "MEDIUM"], description: "Requirements gathering, process modelling, and solution design." },
        { title: "Business Analysis Professional (CBAP Prep)", provider: "IIBA", format: "Blended", durationDays: 5, targetLevels: ["HIGH"], description: "Advanced business analysis techniques and stakeholder management." },
    ],
    "it project management": [
        { title: "PMP Certification Preparation", provider: "PMI", format: "Blended", durationDays: 5, targetLevels: ["HIGH", "MEDIUM"], description: "Project lifecycle, risk management, and PMI methodology." },
        { title: "Agile & Scrum Fundamentals", provider: "Scrum Alliance", format: "Online", durationDays: 2, targetLevels: ["MEDIUM"], description: "Agile principles, Scrum ceremonies, and sprint planning." },
    ],
    "software development": [
        { title: "Full-Stack Web Development Bootcamp", provider: "Sudaksha", format: "Blended", durationDays: 10, targetLevels: ["HIGH", "MEDIUM"], description: "Modern web development with JavaScript, React, Node.js, and databases." },
        { title: "Clean Code & Software Design Patterns", provider: "Sudaksha", format: "Online", durationDays: 3, targetLevels: ["MEDIUM"], description: "SOLID principles, refactoring, and enterprise design patterns." },
    ],
    "cloud computing": [
        { title: "AWS Solutions Architect Associate", provider: "Amazon Web Services", format: "Blended", durationDays: 5, targetLevels: ["HIGH", "MEDIUM"], description: "Cloud architecture on AWS — compute, storage, networking, and security." },
        { title: "Microsoft Azure Fundamentals (AZ-900)", provider: "Microsoft", format: "Online", durationDays: 2, targetLevels: ["MEDIUM"], description: "Azure cloud concepts, services, pricing, and support." },
    ],
    // ── Behavioural / Management ──────────────────────────────────────────
    "leadership": [
        { title: "Leadership Essentials Programme", provider: "Sudaksha", format: "Classroom", durationDays: 3, targetLevels: ["HIGH", "MEDIUM"], description: "Situational leadership, team motivation, and decision-making under pressure." },
        { title: "Executive Leadership Masterclass", provider: "Sudaksha", format: "Blended", durationDays: 5, targetLevels: ["HIGH"], description: "Strategic leadership, organisational change, and stakeholder influence." },
    ],
    "communication": [
        { title: "Business Communication & Presentation Skills", provider: "Sudaksha", format: "Classroom", durationDays: 2, targetLevels: ["HIGH", "MEDIUM"], description: "Written and verbal communication, report writing, and executive presentations." },
    ],
    "problem solving": [
        { title: "Critical Thinking & Problem-Solving Workshop", provider: "Sudaksha", format: "Classroom", durationDays: 2, targetLevels: ["HIGH", "MEDIUM"], description: "Structured problem analysis, root cause identification, and solution design." },
    ],
    "data analysis": [
        { title: "Data Analysis with Excel & Power BI", provider: "Sudaksha", format: "Blended", durationDays: 3, targetLevels: ["HIGH", "MEDIUM"], description: "Data modelling, visualisation, and business reporting." },
        { title: "Python for Data Analysis", provider: "Sudaksha", format: "Online", durationDays: 5, targetLevels: ["HIGH"], description: "Pandas, NumPy, and data pipeline development in Python." },
    ],
};

export type GapPriority = "HIGH" | "MEDIUM" | "NONE" | "EXCEEDS";

export interface TNIRecommendation {
    competencyName: string;
    gap: number;
    priority: GapPriority;
    requiredLevel: string;
    achievedLevel: string;
    programmes: TrainingProgramme[];
}

/**
 * Given a list of gap analysis items, returns training recommendations
 * for all competencies with HIGH or MEDIUM priority gaps.
 */
export function generateTNI(
    gapItems: Array<{
        name: string;
        gap: number;
        priority: GapPriority;
        requiredLevel: string;
        achievedLevel: string;
    }>
): TNIRecommendation[] {
    return gapItems
        .filter(item => item.priority === "HIGH" || item.priority === "MEDIUM")
        .map(item => {
            const key = item.name.toLowerCase().trim();
            // Try exact match first, then partial match
            const programmes =
                COMPETENCY_TRAINING_MAP[key] ??
                Object.entries(COMPETENCY_TRAINING_MAP).find(([k]) => key.includes(k) || k.includes(key))?.[1] ??
                [{
                    title: `Competency Development: ${item.name}`,
                    provider: "Sudaksha",
                    format: "Blended" as const,
                    durationDays: 3,
                    targetLevels: ["HIGH", "MEDIUM"],
                    description: `Structured development programme to bridge the ${item.name} competency gap from ${item.achievedLevel} to ${item.requiredLevel}.`,
                }];

            return {
                competencyName: item.name,
                gap: item.gap,
                priority: item.priority,
                requiredLevel: item.requiredLevel,
                achievedLevel: item.achievedLevel,
                programmes: programmes.filter(p => p.targetLevels.includes(item.priority)),
            };
        })
        .filter(r => r.programmes.length > 0);
}

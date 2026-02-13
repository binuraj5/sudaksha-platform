/**
 * Optional: Seed ComponentSuggestion table with predefined suggestions.
 * Run with: npx tsx scripts/seed-component-suggestions.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const suggestions = [
    // TECHNICAL
    { competencyCategory: "TECHNICAL", targetLevel: "JUNIOR", suggestedType: "MCQ", priority: "HIGH", reason: "Fundamental knowledge verification" },
    { competencyCategory: "TECHNICAL", targetLevel: "JUNIOR", suggestedType: "CODE", priority: "MEDIUM", reason: "Basic coding skill validation" },
    { competencyCategory: "TECHNICAL", targetLevel: "MIDDLE", suggestedType: "MCQ", priority: "HIGH", reason: "Core technical knowledge" },
    { competencyCategory: "TECHNICAL", targetLevel: "MIDDLE", suggestedType: "CODE", priority: "HIGH", reason: "Practical coding assessment" },
    { competencyCategory: "TECHNICAL", targetLevel: "SENIOR", suggestedType: "CODE", priority: "HIGH", reason: "Advanced technical implementation" },
    { competencyCategory: "TECHNICAL", targetLevel: "SENIOR", suggestedType: "SITUATIONAL", priority: "MEDIUM", reason: "Technical architecture decisions" },

    // BEHAVIORAL
    { competencyCategory: "BEHAVIORAL", targetLevel: "JUNIOR", suggestedType: "MCQ", priority: "HIGH", reason: "Basic behavioral awareness" },
    { competencyCategory: "BEHAVIORAL", targetLevel: "JUNIOR", suggestedType: "SITUATIONAL", priority: "MEDIUM", reason: "Everyday scenario responses" },
    { competencyCategory: "BEHAVIORAL", targetLevel: "SENIOR", suggestedType: "SITUATIONAL", priority: "HIGH", reason: "Leadership decision-making" },
    { competencyCategory: "BEHAVIORAL", targetLevel: "EXPERT", suggestedType: "VIDEO", priority: "HIGH", reason: "Executive presence assessment" },

    // COGNITIVE
    { competencyCategory: "COGNITIVE", targetLevel: "JUNIOR", suggestedType: "MCQ", priority: "HIGH", reason: "Conceptual understanding" },
    { competencyCategory: "COGNITIVE", targetLevel: "MIDDLE", suggestedType: "ESSAY", priority: "MEDIUM", reason: "Analytical thinking" },
    { competencyCategory: "COGNITIVE", targetLevel: "SENIOR", suggestedType: "ESSAY", priority: "HIGH", reason: "Strategic analysis" },

    // DOMAIN_SPECIFIC
    { competencyCategory: "DOMAIN_SPECIFIC", targetLevel: "JUNIOR", suggestedType: "MCQ", priority: "HIGH", reason: "Domain knowledge check" },
    { competencyCategory: "DOMAIN_SPECIFIC", targetLevel: "MIDDLE", suggestedType: "SITUATIONAL", priority: "MEDIUM", reason: "Domain-specific scenarios" },
];

async function seedComponentSuggestions() {
    console.log("Seeding ComponentSuggestion...");

    // Clear existing and re-seed (idempotent when re-run)
    await prisma.componentSuggestion.deleteMany({});
    await prisma.componentSuggestion.createMany({ data: suggestions });

    console.log(`✅ Seeded ${suggestions.length} component suggestions`);
}

seedComponentSuggestions()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

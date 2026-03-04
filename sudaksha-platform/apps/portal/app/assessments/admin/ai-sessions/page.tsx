import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AISessionsDashboard } from "@/components/assessments/admin/AISessionsDashboard";

export const metadata = {
    title: "AI Assessment Sessions | Admin",
    description: "Monitor adaptive AI, voice interview, and video interview assessment sessions.",
};

export default async function AISessionsPage() {
    const session = await getApiSession();
    if (!session?.user) redirect("/assessments/admin/login");

    // Fetch adaptive sessions with related data
    const adaptiveSessions = await prisma.adaptiveSession.findMany({
        take: 50,
        orderBy: { startedAt: "desc" },
        include: {
            member: { select: { id: true, name: true, email: true } },
            competency: { select: { id: true, name: true } },
            questions: {
                select: {
                    id: true,
                    sequenceNumber: true,
                    difficulty: true,
                    isCorrect: true,
                    timeTakenSeconds: true,
                    questionType: true,
                },
                orderBy: { sequenceNumber: "asc" },
            },
        },
    });

    // Fetch voice and video responses from ComponentQuestionResponse
    // Filter responses where responseData.type is VOICE_INTERVIEW or VIDEO_INTERVIEW
    const allResponses = await prisma.componentQuestionResponse.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
            userComponent: {
                include: {
                    component: { select: { id: true, componentType: true } },
                },
            },
            question: { select: { id: true, questionType: true } },
        },
        where: {
            question: {
                questionType: { in: ["VOICE_RESPONSE", "VIDEO_RESPONSE"] },
            },
        },
    });

    // Serialize/parse Decimal values from adaptive sessions
    const serializedAdaptiveSessions = adaptiveSessions.map((s) => ({
        ...s,
        currentAbility: Number(s.currentAbility),
        initialAbility: Number(s.initialAbility),
        finalScore: s.finalScore ? Number(s.finalScore) : null,
        abilityEstimate: s.abilityEstimate ? Number(s.abilityEstimate) : null,
        questions: s.questions.map((q) => ({
            ...q,
            difficulty: Number(q.difficulty),
        })),
    }));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">AI Assessment Sessions</h1>
                <p className="text-gray-500 mt-1">
                    Monitor adaptive AI, voice interview, and video interview sessions in real-time.
                </p>
            </header>

            <AISessionsDashboard
                adaptiveSessions={serializedAdaptiveSessions as any[]}
                aiResponses={allResponses as any[]}
            />
        </div>
    );
}

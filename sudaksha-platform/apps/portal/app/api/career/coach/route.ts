import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { getApiSession } from '@/lib/get-session';

/**
 * Career coach API — POST { memberId, message, conversationHistory }
 * SEPL/INT/2026/IMPL-STEPS-01 Step 21
 * Uses Anthropic Claude with the user's assessment profile as context.
 */
export async function POST(req: Request) {
    const session = await getApiSession();
    if (!session) return Response.json({ error: 'Unauthorised' }, { status: 401 });

    const { memberId, message, conversationHistory = [] } = await req.json();

    // Security check
    const requestingUser = session.user as any;
    const isSelf = requestingUser.memberId === memberId || requestingUser.id === memberId;
    const isAdmin = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN"].includes(requestingUser.role ?? "");
    if (!isSelf && !isAdmin) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // Fetch member's top competency scores for context (max 5 to limit tokens)
        const scores = await prisma.competencyScore.findMany({
            where: { memberAssessment: { memberId } },
            orderBy: { proficiencyLevel: 'asc' },
            take: 5,
            select: { competencyCode: true, proficiencyLevel: true, assessmentType: true },
        });

        const careerFit = await prisma.careerFitScore.findMany({
            where: { memberId },
            orderBy: { fitScore: 'desc' },
            take: 3,
            select: { role: { select: { name: true } }, fitScore: true },
        });

        const scipScores = await prisma.sCIPDimensionScore.findMany({
            where: { memberAssessment: { memberId } },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        
        const riasec = scipScores.find(s => s.dimension === 'RIASEC');
        const ocean = scipScores.find(s => s.dimension === 'OCEAN');

        const hollandCode = riasec ? (riasec.subScores as any)?.hollandCode : null;
        let oceanTraits = null;
        if (ocean && typeof ocean.subScores === 'object' && ocean.subScores !== null) {
            // Find top 2 traits by score if it's an object of { TraitName: score }
            const entries = Object.entries(ocean.subScores).filter(([k]) => k !== 'componentCode');
            if (entries.length > 0) {
                 entries.sort((a, b) => (b[1] as number) - (a[1] as number));
                 oceanTraits = entries.slice(0, 2).map(([k]) => k).join(', ');
            }
        }
        const scipContext = hollandCode || oceanTraits ? ` Personality: ${oceanTraits || 'N/A'}. Career interests: ${hollandCode || 'N/A'}.` : '';

        const context = scores.length
            ? `Member profile: lowest competencies: ${scores.map(s => `${s.competencyCode}=L${s.proficiencyLevel}`).join(', ')}. Top career fits: ${careerFit.map(c => `${c.role?.name ?? 'Unknown Role'} (${Math.round(c.fitScore)}%)`).join(', ')}.${scipContext}`
            : 'Member has not yet completed an assessment.';

        const client = new Anthropic();
        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 300,
            system: `You are a concise, encouraging career coach. You have access to this person's assessment data: ${context}. Give specific, actionable advice in 2-3 sentences max. Never ask for more information — work with what you have.`,
            messages: [
                ...conversationHistory.slice(-4),  // Keep last 4 for context, limit tokens
                { role: 'user', content: message },
            ],
        });

        const block = response.content.find(b => b.type === 'text');
        const text = block && 'text' in block ? block.text : '';
        
        return Response.json({ response: text });
    } catch (err: any) {
        console.error("[CAREER_COACH_API]", err);
        return Response.json({ response: "I'm currently unable to access my coaching system. Focus on improving your lowest-scoring competencies, and check back later!" });
    }
}

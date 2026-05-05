import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { getApiSession } from '@/lib/get-session';
// SEPL/INT/2026/IMPL-GAPS-01 Step G19 — Redis caching (24h TTL)
import { cacheGet, cacheSet, cacheKey } from '@/lib/redis';

const FUTURE_SIGNALS_TTL_SECONDS = 86400; // 24 hours

const MARKET_TRENDS_CONTEXT = `
Current job market signals (India, 2026):
- AI + Product Management convergence: 40% salary premium for AI-fluent PMs
- GCC expansion: 200+ new GCCs planned, highest demand in data, cloud, cybersecurity
- Domain D (Digital Fluency) is the #1 skill gap across industries
- Leadership roles requiring EI scores are 34% higher paid than technical-equivalent
- L&D and talent roles growing 28% YoY in GCC sector
`;

export async function POST(req: Request) {
    const session = await getApiSession();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { memberId } = await req.json();

    const requestingUser = session.user as any;
    const isSelf = requestingUser.memberId === memberId || requestingUser.id === memberId;
    const isAdmin = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN"].includes(requestingUser.role ?? "");
    if (!isSelf && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // SEPL/INT/2026/IMPL-GAPS-01 Step G19 — Redis cache lookup (24h TTL).
    // Replaces previous Member.metadata.futureSignals timestamp-based caching.
    const cacheK = cacheKey('future-signals', memberId);
    const cachedSignals = await cacheGet<unknown[]>(cacheK);
    if (cachedSignals) {
        return NextResponse.json({ signals: cachedSignals });
    }

    try {
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { currentRole: true, aspirationalRole: true }
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const scores = await prisma.competencyScore.findMany({
            where: { memberAssessment: { memberId } },
            orderBy: { proficiencyLevel: 'asc' },
            take: 5,
            select: { competencyCode: true, proficiencyLevel: true },
        });

        const profileContext = `
Member Role: ${member.currentRole?.name ?? 'Unknown'}
Target Role: ${member.aspirationalRole?.name ?? 'Unknown'}
Lowest Competencies: ${scores.map(s => `${s.competencyCode}=L${s.proficiencyLevel}`).join(', ')}
`;

        const client = new Anthropic();
        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            system: `You are an expert career strategist. Output exactly a JSON array of 2 to 3 objects.
Each object must have the following keys:
- "timeframe" (string: "6 months", "18 months", or "3 years")
- "urgency" (string: "opportunity", "caution", or "watch")
- "headline" (string: max 10 words)
- "insight" (string: max 2 sentences)

Context:
${MARKET_TRENDS_CONTEXT}
${profileContext}

Do not include markdown blocks or any other text outside the JSON array.
`,
            messages: [
                { role: 'user', content: 'Generate my career signals based on my profile and market trends.' },
            ],
        });

        const block = response.content.find(b => b.type === 'text');
        const text = block && 'text' in block ? block.text : '';

        let signals = [];
        try {
            // Claude sometimes wraps in markdown even when instructed not to
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            signals = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        } catch (parseError) {
            console.error("Failed to parse Claude JSON response:", text);
            return NextResponse.json({ signals: [] });
        }

        if (!Array.isArray(signals)) {
            signals = [];
        }

        // SEPL/INT/2026/IMPL-GAPS-01 Step G19 — populate Redis cache (24h TTL).
        // Only cache non-empty results so a transient parse failure doesn't
        // poison the next 24 hours of requests.
        if (signals.length > 0) {
            await cacheSet(cacheK, signals, FUTURE_SIGNALS_TTL_SECONDS);
        }

        return NextResponse.json({ signals });
    } catch (err: any) {
        console.error("[FUTURE_SIGNALS_API]", err);
        return NextResponse.json({ signals: [] });
    }
}

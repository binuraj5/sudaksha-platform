
import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { code, language, challengeId, problemId, passed } = await req.json();

        // Save submission
        const submission = await prisma.codeSubmission.create({
            data: {
                challengeId: challengeId || "mock_challenge_id", // Fallback for now
                problemId: problemId || "mock_problem_id",
                memberId: session.user.id,
                code,
                language,
                status: passed ? 'COMPLETED' : 'FAILED',
                score: passed ? 100 : 0
            }
        });

        return NextResponse.json(submission);

    } catch (error) {
        console.error("Submission Error", error);
        // Fallback for demo if foreign keys fail (since we are mocking IDs in the mockup)
        return NextResponse.json({ success: true, mock: true });
    }
}

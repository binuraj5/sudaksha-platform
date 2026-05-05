/**
 * Micro-Assessment Submission API
 * SEPL/INT/2026/IMPL-GAPS-01 Step G17
 * Patent claims C-04, C-06 — milestone micro-assessment submission + score blending
 *
 * POST /api/lms/micro/[microId]/submit
 *   Body: { responses: [{ questionId: string, answer: string | number | boolean }] }
 *
 *   1. Scores each response against the question's correctAnswer / options.
 *   2. Computes the micro score (0–100).
 *   3. Persists score + responses on MicroAssessment.
 *   4. Updates the member's most recent CompetencyScore for the same competency
 *      with a weighted blend: 80% existing + 20% micro (delta-aware boost).
 *
 * The blend ratio (80/20) prefers the structured assessment as the primary
 * signal — micro-assessments are intentionally short and noisier, so they
 * contribute a smaller share to the running competency average.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

interface SubmittedResponse {
  questionId: string;
  answer: unknown;
}

interface StoredQuestion {
  id: string;
  text: string;
  type: string;
  options?: unknown;
}

const MICRO_BLEND_WEIGHT = 0.2; // micro-assessments contribute 20% to the running score

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ microId: string }> },
) {
  try {
    const session = await getApiSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { microId } = await params;
    const body = await req.json().catch(() => ({}));
    const responses: SubmittedResponse[] = Array.isArray(body?.responses) ? body.responses : [];

    // Resolve member from session
    const member = await prisma.member.findFirst({
      where: { email: (session.user as { email?: string }).email ?? "" },
      select: { id: true },
    });
    if (!member) {
      return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
    }

    // Load the micro-assessment + ownership check
    const micro = await prisma.microAssessment.findUnique({
      where: { id: microId },
      select: {
        id: true, memberId: true, activityId: true, competencyCode: true,
        questions: true, completedAt: true,
      },
    });
    if (!micro) {
      return NextResponse.json({ error: "Micro-assessment not found" }, { status: 404 });
    }
    if (micro.memberId !== member.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (micro.completedAt) {
      return NextResponse.json({ error: "Already submitted" }, { status: 409 });
    }

    // Score each response against its source question
    const storedQuestions = (micro.questions as unknown as StoredQuestion[]) ?? [];
    const questionIds = storedQuestions.map(q => q.id);
    const sourceQuestions = await prisma.componentQuestion.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, questionType: true, correctAnswer: true, options: true, points: true },
    });
    const sourceMap = new Map(sourceQuestions.map(q => [q.id, q]));

    let earned = 0;
    let total = 0;
    const evaluatedResponses = responses.map(r => {
      const src = sourceMap.get(r.questionId);
      const points = src?.points ?? 1;
      total += points;

      // Score MULTIPLE_CHOICE / TRUE_FALSE / SCENARIO_BASED via correctAnswer or option.isCorrect.
      let isCorrect = false;
      if (src) {
        const type = String(src.questionType).toUpperCase();
        if (["MULTIPLE_CHOICE", "TRUE_FALSE", "SCENARIO_BASED", "SJT"].includes(type)) {
          const answer = String(r.answer ?? "").trim();
          if (src.correctAnswer && src.correctAnswer.length > 0) {
            isCorrect = answer.toLowerCase() === src.correctAnswer.trim().toLowerCase();
          } else if (Array.isArray(src.options)) {
            const opts = src.options as Array<{ text?: string; isCorrect?: boolean }>;
            const chosen = opts.find(o => String(o?.text ?? "").trim() === answer);
            isCorrect = chosen?.isCorrect === true;
          }
        } else if (type === "LIKERT" || type === "RATING") {
          // Rating items don't have a "correct" answer — treat any submitted value as engaged.
          isCorrect = r.answer != null && r.answer !== "";
        }
      }
      const pointsAwarded = isCorrect ? points : 0;
      earned += pointsAwarded;
      return { questionId: r.questionId, answer: r.answer, isCorrect, pointsAwarded };
    });

    const microScore = total > 0 ? Math.round((earned / total) * 100) : 0;

    // Persist the submission on MicroAssessment
    await prisma.microAssessment.update({
      where: { id: microId },
      data: {
        responses: evaluatedResponses as any,
        score: microScore,
        completedAt: new Date(),
      },
    });

    // ── Score blend into existing CompetencyScore (most recent assessment) ──
    // Find the member's most recent CompetencyScore for this competency.
    const recentScore = await prisma.competencyScore.findFirst({
      where: {
        competencyCode: micro.competencyCode,
        memberAssessment: { member: { id: member.id }, status: "COMPLETED" },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        compositeRawScore: true,
        proficiencyLevel: true,
        normalisedScore: true,
      },
    });

    let blendedScore: number | null = null;
    if (recentScore) {
      const existing = recentScore.normalisedScore ?? recentScore.compositeRawScore ?? 0;
      blendedScore = Math.round(
        existing * (1 - MICRO_BLEND_WEIGHT) + microScore * MICRO_BLEND_WEIGHT,
      );

      // Recompute proficiency level from the blended 0–100 score
      const proficiencyLevel =
        blendedScore >= 85 ? 4 :
        blendedScore >= 65 ? 3 :
        blendedScore >= 40 ? 2 : 1;

      await prisma.competencyScore.update({
        where: { id: recentScore.id },
        data: {
          normalisedScore: blendedScore,
          proficiencyLevel,
        },
      });
    }

    return NextResponse.json({
      success: true,
      microScore,
      blendedScore,
      earnedPoints: earned,
      totalPoints: total,
      message:
        microScore >= 70
          ? "Excellent — keep going!"
          : microScore >= 50
            ? "Progress check complete — keep going!"
            : "Progress check recorded. Review the module again before the next milestone.",
    });
  } catch (error) {
    console.error("[LMS/Micro] Submit error:", error);
    return NextResponse.json({ error: "Failed to submit micro-assessment" }, { status: 500 });
  }
}

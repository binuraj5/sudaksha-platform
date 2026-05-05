import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { generateChatCompletion } from "@/lib/ai/providers";

/**
 * POST /api/assessments/runner/response/evaluate
 * SEPL/INT/2026/IMPL-STEPS-01 Step 9
 *
 * Evaluates an open-text (ADAPT-16 reflective writing) response across 6 psychometric
 * dimensions using the configured AI provider, then stores the result in
 * ComponentQuestionResponse.aiScore and ComponentQuestionResponse.aiEvaluation.
 *
 * Body: { userComponentId, questionId }
 * - userComponentId: the UserAssessmentComponent the response belongs to
 * - questionId: the ComponentQuestion the response answers
 *
 * The response text is read from the existing ComponentQuestionResponse.responseData
 * so the client does NOT re-send the text, preventing double-submission issues.
 *
 * Returns: the parsed 6-dimension evaluation object.
 */

const ADAPT16_NLP_PROMPT = `You are an expert psychometric evaluator assessing competency expression in professional reflective writing.

Evaluate the response below. Return ONLY a valid JSON object — no preamble, no markdown, no explanation.

{
  "specificity_of_behavioural_example": <0-100>,
  "outcome_orientation": <0-100>,
  "self_reflective_depth": <0-100>,
  "complexity_of_thinking": <0-100>,
  "linguistic_confidence_clarity": <0-100>,
  "ethical_values_language": <0-100>,
  "overall_nlp_score": <0-100>,
  "primary_competencies_evidenced": ["<code>"],
  "narrative_summary": "<2 sentences max — plain language interpretation>",
  "scoring_confidence": <0-100>
}

Scoring guide:
- specificity_of_behavioural_example: concrete STAR-method indicators vs vague generalities
- outcome_orientation: articulated outcomes, consequences, learnings
- self_reflective_depth: genuine self-examination, personal limitations identified
- complexity_of_thinking: multi-causal reasoning, perspective-taking, analytical depth
- linguistic_confidence_clarity: coherence, precision, structural clarity
- ethical_values_language: principles-based language, values-congruent framing

Response to evaluate:
"""
{RESPONSE_TEXT}
"""`;

export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { userComponentId, questionId } = body;

        if (!userComponentId || !questionId) {
            return NextResponse.json(
                { error: "userComponentId and questionId are required" },
                { status: 400 }
            );
        }

        // Fetch the existing response — we read responseData from DB, not from the request body
        const responseRecord = await prisma.componentQuestionResponse.findFirst({
            where: { userComponentId, questionId },
            select: { id: true, responseData: true, aiFinished: true },
        });

        if (!responseRecord) {
            return NextResponse.json({ error: "Response not found" }, { status: 404 });
        }

        // Idempotency guard — don't re-evaluate if already scored
        if (responseRecord.aiFinished) {
            return NextResponse.json({ ok: true, alreadyEvaluated: true });
        }

        // Extract the plain text from responseData (may be string or { text: string })
        const rd = responseRecord.responseData;
        let responseText: string;
        if (typeof rd === "string") {
            responseText = rd;
        } else if (rd && typeof rd === "object" && "text" in (rd as object)) {
            responseText = String((rd as { text: unknown }).text);
        } else {
            responseText = JSON.stringify(rd);
        }

        if (!responseText?.trim()) {
            return NextResponse.json({ error: "Response text is empty" }, { status: 400 });
        }

        // Build the prompt with the actual response interpolated
        const filledPrompt = ADAPT16_NLP_PROMPT.replace("{RESPONSE_TEXT}", responseText);

        const aiResponse = await generateChatCompletion([
            { role: "system", content: filledPrompt },
            { role: "user", content: "Evaluate the response provided in the system prompt." },
        ]);

        const rawText = aiResponse.choices[0].message.content ?? "{}";

        let evaluation: Record<string, unknown>;
        try {
            evaluation = JSON.parse(rawText);
        } catch {
            // Extract JSON from markdown fences if LLM disobeys the instruction
            const match = rawText.match(/\{[\s\S]*\}/);
            evaluation = match ? JSON.parse(match[0]) : {};
        }

        const aiScore = typeof evaluation.overall_nlp_score === "number"
            ? evaluation.overall_nlp_score
            : Number(evaluation.overall_nlp_score ?? 0);

        // Persist aiScore, aiEvaluation, and mark aiFinished so we don't re-evaluate
        await prisma.componentQuestionResponse.update({
            where: { id: responseRecord.id },
            data: {
                aiScore,
                aiEvaluation: evaluation as any,
                aiFinished: true,
                // Flag for human review if confidence is low (<= 50) or score is borderline (40-60)
                humanReviewRequired:
                    (typeof evaluation.scoring_confidence === "number" && evaluation.scoring_confidence <= 50) ||
                    (aiScore >= 40 && aiScore <= 60),
            },
        });

        return NextResponse.json({
            ok: true,
            aiScore,
            evaluation,
        });

    } catch (error: any) {
        console.error("[NLP Evaluate] Error:", error);
        return NextResponse.json(
            { error: error.message || "Evaluation failed" },
            { status: 500 }
        );
    }
}

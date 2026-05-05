/**
 * Micro-Assessment Page
 * SEPL/INT/2026/IMPL-GAPS-01 Step G17
 * Patent claims C-04, C-06 — milestone progress check at module completion
 */

import { getApiSession } from "@/lib/get-session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MicroAssessmentForm } from "@/components/LMS/MicroAssessmentForm";

export default async function MicroAssessmentPage({
  params,
}: {
  params: Promise<{ microId: string }>;
}) {
  const session = await getApiSession();
  if (!session) redirect("/assessments/login");

  const { microId } = await params;

  const member = await prisma.member.findFirst({
    where: { email: session.user.email ?? "" },
    select: { id: true },
  });
  if (!member) notFound();

  const micro = await prisma.microAssessment.findUnique({
    where: { id: microId },
    select: {
      id: true,
      memberId: true,
      activityId: true,
      competencyCode: true,
      questions: true,
      completedAt: true,
      score: true,
      activity: { select: { id: true, name: true } },
    },
  });
  if (!micro) notFound();
  if (micro.memberId !== member.id) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center">
        <p className="text-gray-700 font-medium mb-2">You don't have access to this progress check.</p>
        <Link href="/assessments/lms" className="text-sm text-indigo-600 hover:underline">
          ← Back to my modules
        </Link>
      </div>
    );
  }

  // If already submitted, show summary read-only
  if (micro.completedAt) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="bg-white border-b px-6 py-3">
          <Link
            href="/assessments/lms"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to modules
          </Link>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-2xl font-black text-gray-900 mb-2">Progress check already complete</h1>
            <p className="text-sm text-gray-500 mb-1">
              {micro.activity?.name ? `Module: ${micro.activity.name}` : null}
            </p>
            <p className="text-base text-gray-700 mt-4">
              Score:{" "}
              <span className="font-semibold text-gray-900">
                {micro.score != null ? `${micro.score}%` : "—"}
              </span>
            </p>
            <Link
              href="/assessments/lms"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Modules
            </Link>
          </div>
        </div>
      </div>
    );
  }

  type StoredQ = { id: string; text: string; type: string; options?: { text: string; isCorrect?: boolean }[] | null };
  const storedQuestions = (micro.questions as unknown as StoredQ[]) ?? [];

  // Sanitise options shape (remove isCorrect from client payload)
  const sanitisedQuestions = storedQuestions.map(q => ({
    id: q.id,
    text: q.text,
    type: q.type,
    options: Array.isArray(q.options)
      ? q.options.map(o => ({ text: o.text }))
      : null,
  }));

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b px-6 py-3">
        <Link
          href="/assessments/lms"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to modules
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <MicroAssessmentForm
          microId={micro.id}
          competencyName={micro.competencyCode}
          questions={sanitisedQuestions}
        />
      </div>
    </div>
  );
}

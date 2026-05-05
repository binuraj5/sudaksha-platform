/**
 * LMS Module Content Page
 * SEPL/INT/2026/IMPL-GAPS-01 Step G16
 * Patent claims C-04, C-05 — module delivery + competency-tagged content
 *
 * Renders the module's content (iframe/video/doc) plus the linked competencies
 * the module develops. The Mark Complete button posts to the completion API.
 */

import { getApiSession } from "@/lib/get-session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, BookOpen, Target } from "lucide-react";
import Link from "next/link";
import { MarkCompleteButton } from "@/components/LMS/MarkCompleteButton";

export default async function LMSModulePage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const session = await getApiSession();
  if (!session) redirect("/assessments/login");

  const { activityId } = await params;

  const member = await prisma.member.findFirst({
    where: { email: session.user.email ?? "" },
    select: { id: true },
  });
  if (!member) notFound();

  // Fetch activity + linked assessment models + their competencies (via components)
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      contentUrl: true,
      estimatedMinutes: true,
      moduleOrder: true,
      completionCriteria: true,
      assessments: {
        select: {
          assessmentModel: {
            select: {
              id: true,
              name: true,
              components: {
                select: {
                  competency: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!activity) notFound();

  // Caller must be enrolled
  const enrollment = await prisma.activityMember.findUnique({
    where: { activityId_memberId: { activityId, memberId: member.id } },
    select: { id: true, status: true, completedAt: true, progressPct: true },
  });

  if (!enrollment) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center">
        <p className="text-gray-700 font-medium mb-2">You're not enrolled in this module.</p>
        <Link href="/assessments/lms" className="text-sm text-indigo-600 hover:underline">
          ← Back to my modules
        </Link>
      </div>
    );
  }

  // Flatten unique competencies
  const competencyMap = new Map<string, { id: string; name: string }>();
  for (const a of activity.assessments) {
    for (const c of a.assessmentModel.components) {
      if (c.competency) competencyMap.set(c.competency.id, c.competency);
    }
  }
  const competencies = Array.from(competencyMap.values());

  const isCompleted = enrollment.status === "COMPLETED";

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Back nav */}
      <div className="bg-white border-b px-6 py-3">
        <Link
          href="/assessments/lms"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to modules
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Module {activity.moduleOrder > 0 ? `#${activity.moduleOrder}` : ""}
          </p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{activity.name}</h1>
          {activity.description && (
            <p className="text-gray-600 text-sm mt-2 max-w-2xl">{activity.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {activity.estimatedMinutes} min
            </span>
            <span className="flex items-center gap-1 text-xs uppercase tracking-wide">
              <BookOpen className="h-3 w-3" /> {activity.completionCriteria.replace(/_/g, " ").toLowerCase()}
            </span>
            {isCompleted && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Completed
              </Badge>
            )}
          </div>
        </header>

        {/* Linked competencies */}
        {competencies.length > 0 && (
          <Card className="border-none shadow-sm bg-indigo-50/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-indigo-900">
                <Target className="h-4 w-4" />
                This module develops
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {competencies.map(c => (
                  <Badge
                    key={c.id}
                    variant="outline"
                    className="bg-white border-indigo-200 text-indigo-700 font-medium"
                  >
                    {c.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content delivery */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Module content</CardTitle>
            <CardDescription className="text-xs">
              {activity.contentUrl
                ? "Watch / read through the content below, then mark this module complete."
                : "Content will be available soon. Reach out to your learning coordinator for materials."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.contentUrl ? (
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <iframe
                  src={activity.contentUrl}
                  title={activity.name}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-gray-100 rounded-lg flex flex-col items-center justify-center text-center gap-3 px-6">
                <BookOpen className="h-10 w-10 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">Content will be available soon</p>
                <p className="text-xs text-gray-400 max-w-sm">
                  Your administrator hasn't published the content URL for this module yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mark Complete */}
        <div className="pt-2">
          <MarkCompleteButton activityId={activity.id} alreadyCompleted={isCompleted} />
        </div>

      </div>
    </div>
  );
}

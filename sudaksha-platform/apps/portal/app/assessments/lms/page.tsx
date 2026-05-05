/**
 * LMS Learner Module List
 * SEPL/INT/2026/IMPL-GAPS-01 Step G16
 * Patent claims C-04, C-05 — curriculum module delivery
 *
 * Shows all CURRICULUM-type activities the authenticated member is enrolled in,
 * with progress %, estimated time, and status badge.
 */

import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CheckCircle2, PlayCircle } from "lucide-react";
import Link from "next/link";

export default async function LMSListPage() {
  const session = await getApiSession();
  if (!session) redirect("/assessments/login");

  const member = await prisma.member.findFirst({
    where: { email: session.user.email ?? "" },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!member) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center">
        <p className="text-gray-500">Member profile not found.</p>
      </div>
    );
  }

  // Fetch enrolled CURRICULUM activities for this member
  const enrollments = await prisma.activityMember.findMany({
    where: { memberId: member.id },
    select: {
      id: true,
      status: true,
      progressPct: true,
      completedAt: true,
      activity: {
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          status: true,
          estimatedMinutes: true,
          moduleOrder: true,
          contentUrl: true,
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  // Filter to CURRICULUM-type only
  const modules = enrollments
    .filter(e => e.activity.type === "CURRICULUM")
    .sort((a, b) => a.activity.moduleOrder - b.activity.moduleOrder);

  const completedCount = modules.filter(m => m.status === "COMPLETED").length;
  const totalEstimatedMinutes = modules.reduce((s, m) => s + m.activity.estimatedMinutes, 0);

  // SEPL/INT/2026/IMPL-GAPS-01 Step G17 — pending micro-assessments per activity
  const moduleActivityIds = modules.map(m => m.activity.id);
  const pendingMicros = moduleActivityIds.length > 0
    ? await prisma.microAssessment.findMany({
        where: {
          memberId: member.id,
          activityId: { in: moduleActivityIds },
          completedAt: null,
        },
        orderBy: { createdAt: "asc" },
        select: { id: true, activityId: true },
      })
    : [];
  const pendingByActivity = new Map<string, string>();
  for (const m of pendingMicros) {
    if (!pendingByActivity.has(m.activityId)) pendingByActivity.set(m.activityId, m.id);
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Learning · Your Pathway
          </p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Modules</h1>
          <p className="text-gray-500 text-sm mt-1">
            {modules.length === 0
              ? "No modules enrolled yet"
              : `${completedCount} of ${modules.length} modules complete · ${totalEstimatedMinutes} min total`}
          </p>
        </header>

        {/* Module list */}
        {modules.length === 0 ? (
          <Card className="border-dashed border-gray-200 bg-white">
            <CardContent className="py-16 flex flex-col items-center text-center gap-3">
              <BookOpen className="h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No curriculum modules yet</p>
              <p className="text-xs text-gray-400 max-w-sm">
                Curriculum modules will appear here once your administrator enrols you.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modules.map(({ activity, status, progressPct }) => {
              const isCompleted = status === "COMPLETED";
              const isInProgress = status === "IN_PROGRESS" || progressPct > 0;
              const pendingMicroId = pendingByActivity.get(activity.id);

              const cardHref = pendingMicroId
                ? `/assessments/lms/micro/${pendingMicroId}`
                : `/assessments/lms/${activity.id}`;

              return (
                <Link
                  key={activity.id}
                  href={cardHref}
                  className="block group"
                >
                  <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base group-hover:text-indigo-600 transition-colors">
                          {activity.name}
                        </CardTitle>
                        {pendingMicroId ? (
                          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 shrink-0">
                            Progress check ready
                          </Badge>
                        ) : isCompleted ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
                          </Badge>
                        ) : isInProgress ? (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 shrink-0">
                            <PlayCircle className="h-3 w-3 mr-1" /> In progress
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 border-gray-200 shrink-0">
                            Not started
                          </Badge>
                        )}
                      </div>
                      {activity.description && (
                        <CardDescription className="line-clamp-2 text-xs">
                          {activity.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                          <span>Progress</span>
                          <span className="tabular-nums">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${isCompleted ? "bg-green-500" : "bg-indigo-500"}`}
                            style={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }}
                          />
                        </div>
                      </div>
                      {/* Footer meta */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.estimatedMinutes} min
                        </span>
                        <span className="text-indigo-600 font-medium group-hover:underline">
                          {pendingMicroId ? "Take progress check →" : isCompleted ? "Review →" : "Open module →"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canTakeAssessment } from "@/lib/b2c/free-tier";
import { getRecommendedAssessments } from "@/lib/b2c/recommendation-engine";
import { ModeSwitcher } from "@/components/individuals/ModeSwitcher";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, PlayCircle, Star, Award, Target } from "lucide-react";
import { StartAssessmentButton } from "@/components/individuals/StartAssessmentButton";
import { ThreeLensSummary } from "@/components/Individual/ThreeLensSummary";
import { CareerFitMatches, CareerFitMatchesSkeleton } from "@/components/Individual/CareerFitMatches";
import { ProgressTimeline, ProgressTimelineSkeleton } from "@/components/Individual/ProgressTimeline";
import { CareerCoachChat, CareerCoachChatSkeleton } from "@/components/Individual/CareerCoachChat";
import { FutureIntelligence, FutureIntelligenceSkeleton } from "@/components/Individual/FutureIntelligence";
import { BeforeAfterPanel, BeforeAfterPanelSkeleton } from "@/components/Individual/BeforeAfterPanel";
import { ADAPT16RadarChart } from "@/components/Individual/ADAPT16RadarChart";
import { Suspense } from "react";

export default async function IndividualDashboard() {
    const session = await getApiSession();

    if (!session) {
        redirect("/assessments/login");
    }

    const member = await prisma.member.findFirst({
        where: { email: session.user.email ?? "" },
        include: {
            assessments: true,
            currentRole: true,
            aspirationalRole: true
        }
    });

    if (!member) {
        return <div>Profile not found. Please contact support.</div>;
    }

    // Enforce Onboarding (individuals onboarding is in nav sidebar)
    if (!member.currentRoleId || !member.aspirationalRoleId) {
        redirect("/assessments/individuals/onboarding");
    }

    const metadata = (member.metadata as any) || { userMode: 'PROFESSIONAL', freeAssessmentsUsed: 0 };
    const userMode = metadata.userMode || 'PROFESSIONAL';

    // Usage Stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const assessmentsThisMonth = member.assessments.filter(
        a => new Date(a.createdAt) >= thisMonth
    ).length;

    const limit = 10;
    const remaining = Math.max(0, limit - assessmentsThisMonth);
    const usagePercentage = (assessmentsThisMonth / limit) * 100;

    // Recommendations
    const recommendations = await getRecommendedAssessments(member.id, 3);

    // Progress (Mock for now, can be real calculation)
    const careerProgress = 62;
    const interviewReadiness = 68;

    // ── SEPL/INT/2026/IMPL-STEPS-01 Step 18 — Three-Lens Summary data ────────
    // CompetencyScore is scoped by memberAssessmentId → join via MemberAssessment
    const memberAssessmentIds = member.assessments.map((a: { id: string }) => a.id);
    const competencyScores = memberAssessmentIds.length > 0
        ? await prisma.competencyScore.findMany({
            where: { memberAssessmentId: { in: memberAssessmentIds } },
            orderBy: { createdAt: "desc" },
        }).catch(() => [])
        : [];

    // RBCA lens: use compositeRawScore as the role-fit proxy
    const rbcaScores = competencyScores.filter((s: any) => s.compositeRawScore != null && s.compositeRawScore > 0);
    const rbcaLens = rbcaScores.length > 0 ? (() => {
        const TARGET = 85;
        const avg = Math.round(
            rbcaScores.reduce((sum: number, s: any) => sum + (s.compositeRawScore ?? 0), 0) / rbcaScores.length
        );
        const gaps = rbcaScores.filter((s: any) => (s.compositeRawScore ?? 0) < TARGET).length;
        return { score: avg, target: TARGET, gaps };
    })() : null;

    // ADAPT-16 lens: use layerScores JSON { L1: n, L2: n, ... } to derive avgLevel
    // proficiencyLevel (1-6) is the direct level field per competency
    const adapt16Scores = competencyScores.filter((s: any) => s.proficiencyLevel != null);
    const adapt16Lens = adapt16Scores.length > 0 ? (() => {
        const levels = adapt16Scores.map((s: any) => s.proficiencyLevel as number);
        const avgLevel = levels.reduce((a: number, b: number) => a + b, 0) / levels.length;

        // Strong/weak domain: group by competencyCode prefix (A, AL, P, D, T)
        const byCode = [...adapt16Scores].sort((a: any, b: any) =>
            (b.proficiencyLevel ?? 0) - (a.proficiencyLevel ?? 0)
        );
        const strongDomain = byCode[0]?.competencyCode ?? "—";
        const weakDomain = byCode[byCode.length - 1]?.competencyCode ?? "—";

        return {
            avgLevel: parseFloat(avgLevel.toFixed(1)),
            strongDomain,
            weakDomain,
        };
    })() : null;

    // SCIP lens: Step 24 integration
    const scipScores = await prisma.sCIPDimensionScore.findMany({
        where: { memberAssessment: { member: { id: member.id } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });
    
    const riasecScore = scipScores.find(s => s.dimension === 'RIASEC');
    const cogScore = scipScores.find(s => s.dimension === 'COG');
    
    const scipLens = riasecScore ? {
        hollandCode: (riasecScore.subScores as any)?.hollandCode ?? '???',
        cognitivePercentile: cogScore?.percentileRank ?? 0,
    } : null;

    const lensData = { rbca: rbcaLens, adapt16: adapt16Lens, scip: scipLens };
    // ── End Step 18 data ─────────────────────────────────────────────────────

    const radarData = await prisma.competencyScore.findMany({
        where: {
            memberAssessment: { member: { id: member.id } },
            assessmentType: 'ADAPT_16',
        },
        orderBy: { competencyCode: 'asc' },
        select: { competencyCode: true, proficiencyLevel: true },
        take: 16,
    });

    const radarScores = radarData.map((s) => ({
        code: s.competencyCode,
        name: s.competencyCode,
        level: s.proficiencyLevel,
    }));

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">

            {/* ── Step 18: Three-Lens Summary — additive, before all existing sections ── */}
            <ThreeLensSummary data={lensData} />

            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        ADAPT-16 competency radar
                    </h2>
                    <span className="text-xs text-gray-400">16-axis learner profile</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <ADAPT16RadarChart scores={radarScores} />
                </div>
            </section>

            {/* ── Step 19: Career Fit Matches — additive section ── */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Top career matches
                    </h2>
                    <span className="text-xs text-gray-400">Ranked by role fit score</span>
                </div>
                <Suspense fallback={<CareerFitMatchesSkeleton />}>
                    <CareerFitMatches memberId={member.id} />
                </Suspense>
            </section>

            {/* ── Step 20: Progress Timeline — additive section ── */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Progress timeline
                    </h2>
                    <span className="text-xs text-gray-400">Lifelong career tracking</span>
                </div>
                <Suspense fallback={<ProgressTimelineSkeleton />}>
                    <ProgressTimeline memberId={member.id} />
                </Suspense>
            </section>

            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Before/after comparison
                    </h2>
                    <span className="text-xs text-gray-400">Training ROI evidence</span>
                </div>
                <Suspense fallback={<BeforeAfterPanelSkeleton />}>
                    <BeforeAfterPanel memberId={member.id} />
                </Suspense>
            </section>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome, {member.firstName}! {userMode === 'STUDENT' ? '📚' : '👋'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {userMode === 'STUDENT'
                            ? `Track your academic progress and interview readiness`
                            : `Manage your professional growth and career path`
                        }
                    </p>
                </div>

                <ModeSwitcher currentMode={userMode} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Progress & Usage */}
                <div className="space-y-6">

                    {/* Progress Card */}
                    <Card className="border-none shadow-md bg-white overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-lg">
                                {userMode === 'STUDENT' ? 'Interview Readiness' : 'Career Progress'}
                                <span className="text-2xl font-bold text-indigo-600">
                                    {userMode === 'STUDENT' ? interviewReadiness : careerProgress}%
                                </span>
                            </CardTitle>
                            <CardDescription>
                                {userMode === 'STUDENT'
                                    ? 'Based on algorithm and data structure skills'
                                    : 'Progress towards your aspirational role'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Progress value={userMode === 'STUDENT' ? interviewReadiness : careerProgress} className="h-3" />

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <Target className="w-4 h-4 text-indigo-500" /> Target
                                    </span>
                                    <span className="font-medium">
                                        {member.aspirationalRole?.name || (userMode === 'STUDENT' ? 'Software Engineer' : 'Senior Role')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <Award className="w-4 h-4 text-amber-500" /> Current
                                    </span>
                                    <span className="font-medium">
                                        {member.currentRole?.name || (userMode === 'STUDENT' ? 'Student' : 'Junior Role')}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">View Detailed Plan</Button>
                        </CardFooter>
                    </Card>

                    {/* Usage Card */}
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-gray-700">Monthly Usage</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-3xl font-bold text-gray-900">{assessmentsThisMonth}<span className="text-base font-normal text-gray-400">/{limit}</span></span>
                                    <Badge variant={remaining < 3 ? "destructive" : "secondary"}>
                                        {remaining} left
                                    </Badge>
                                </div>
                                <Progress value={usagePercentage} className="h-2" />
                                <p className="text-xs text-gray-500 mt-2">Resets on 1st of next month</p>
                            </div>

                            {remaining === 0 && (
                                <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-md border border-amber-100">
                                    You've reached your limit. <Link href="/pricing" className="underline font-semibold">Upgrade to Premium</Link> for unlimited access.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Middle & Right: Actions & Recommendations */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Button size="lg" className="h-24 flex flex-col items-center justify-center gap-2 bg-white text-indigo-600 hover:bg-slate-50 border shadow-sm transition-all hover:scale-105" asChild>
                            <Link href="/assessments/individuals/browse">
                                <PlayCircle className="w-8 h-8" />
                                <span>Take Assessment</span>
                            </Link>
                        </Button>
                        <Button size="lg" className="h-24 flex flex-col items-center justify-center gap-2 bg-white text-gray-700 hover:bg-slate-50 border shadow-sm transition-all hover:scale-105" asChild>
                            <Link href="/assessments/individuals/results">
                                <Clock className="w-8 h-8 text-blue-500" />
                                <span>View Results</span>
                            </Link>
                        </Button>
                        <Button size="lg" className="h-24 flex flex-col items-center justify-center gap-2 bg-white text-gray-700 hover:bg-slate-50 border shadow-sm transition-all hover:scale-105" asChild>
                            <Link href="/assessments/individuals/career">
                                <Target className="w-8 h-8 text-green-500" />
                                <span>My Career</span>
                            </Link>
                        </Button>
                    </div>

                    {/* Recommendations */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Recommended for You</h2>
                            <Link href="/assessments/individuals/browse" className="text-sm text-indigo-600 hover:underline">View All</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendations.length > 0 ? recommendations.map(assessment => (
                                <Card key={assessment.id} className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                                                {assessment.targetLevel || 'General'}
                                            </Badge>
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        </div>
                                        <CardTitle className="text-lg mt-2 line-clamp-1">{assessment.name}</CardTitle>
                                        <CardDescription className="line-clamp-2">{assessment.description ?? ''}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="pt-2 flex justify-between items-center text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {assessment.durationMinutes ?? 30} min</span>
                                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {(assessment as { _count?: { memberAssessments?: number } })._count?.memberAssessments ?? 0} taken</span>
                                        <StartAssessmentButton
                                            modelId={assessment.id}
                                            variant="ghost"
                                            size="sm"
                                            className="text-indigo-600 hover:text-indigo-700 p-0 h-auto hover:bg-transparent"
                                        >
                                            Start <ArrowRight className="w-3 h-3 ml-1" />
                                        </StartAssessmentButton>
                                    </CardFooter>
                                </Card>
                            )) : (
                                <div className="col-span-2 p-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
                                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900">No recommendations yet</h3>
                                    <p className="text-gray-500 mb-4">Update your profile to get personalized suggestions.</p>
                                    <Button variant="outline">Update Profile</Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Learning Path Summary */}
                    <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-2">Your Learning Path</h3>
                            <p className="text-indigo-200 text-sm mb-4">
                                {userMode === 'STUDENT'
                                    ? "3 steps remaining to complete your 'Full Stack Developer' track."
                                    : "You are on track to become a Senior Developer."}
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-indigo-800/50 rounded-full h-2">
                                    <div className="bg-indigo-400 h-2 rounded-full w-2/3"></div>
                                </div>
                                <span className="text-sm font-medium">66%</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Step 25: Future Intelligence Signals ── */}
                    <Suspense fallback={<FutureIntelligenceSkeleton />}>
                        <FutureIntelligence memberId={member.id} />
                    </Suspense>

                    {/* ── Step 21: AI Career Coach Chat ── */}
                    <Suspense fallback={<CareerCoachChatSkeleton />}>
                        <CareerCoachChat memberId={member.id} />
                    </Suspense>

                </div>
            </div>
        </div>
    );
}

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

export default async function IndividualDashboard() {
    const session = await getApiSession();

    if (!session || session.user.role !== 'INDIVIDUAL') {
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

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
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
                            <Link href="/assessments/individuals/my-assessments">
                                <PlayCircle className="w-8 h-8" />
                                <span>My Assessments</span>
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

                </div>
            </div>
        </div>
    );
}

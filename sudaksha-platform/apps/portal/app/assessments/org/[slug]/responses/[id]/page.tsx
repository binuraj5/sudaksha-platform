import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trophy, FileText, BrainCircuit, CheckCircle2, AlertCircle, Headphones, Video, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getDetailedResponse } from "@/lib/assessment-responses-actions";
import { ResponseDetailViewer } from "@/components/assessments/ResponseDetailViewer";
import { AudioResponseViewer } from "@/components/assessments/AudioResponseViewer";
import { VideoResponseViewer } from "@/components/assessments/VideoResponseViewer";

export default async function AdminResponseDetailPage({
    params,
}: {
    params: Promise<{ slug: string; id: string }>;
}) {
    const session = await getApiSession();
    const { slug, id } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    const u = session.user as { tenantSlug?: string; role?: string; userType?: string };
    const isSuperAdmin = u.userType === "SUPER_ADMIN" || u.role === "SUPER_ADMIN";
    const isTenantAdmin = u.role === "TENANT_ADMIN" || u.role === "DEPARTMENT_HEAD";
    const isAdmin = isSuperAdmin || isTenantAdmin;
    const hasAccess = isSuperAdmin || u.tenantSlug === slug;

    if (!hasAccess) {
        redirect(u.tenantSlug ? `/assessments/org/${u.tenantSlug}/dashboard` : "/assessments");
    }

    if (!isAdmin) {
        redirect(u.tenantSlug ? `/assessments/org/${u.tenantSlug}/dashboard` : "/assessments");
    }

    const basePath = `/assessments/org/${slug}`;

    try {
        const assessment = await getDetailedResponse(slug, id);

        if (!assessment) {
            notFound();
        }

        const { member, assessmentModel, overallScore, passed, completedAt, totalTimeSpent } = assessment;

        // Calculate metrics
        const totalQuestions = assessmentModel.components.reduce(
            (sum: number, comp: any) => sum + (comp.component.questions?.length || 0),
            0
        );

        const answeredQuestions = assessmentModel.components.reduce((sum: number, comp: any) => {
            const answered = comp.component.questions?.filter(
                (q: any) => (q.responses && q.responses.length > 0) || false
            ).length || 0;
            return sum + answered;
        }, 0);

        return (
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                {/* Header Navigation */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="rounded-lg" asChild>
                        <Link href={`${basePath}/responses`}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Link>
                    </Button>
                    <div className="text-sm text-gray-500">
                        Assessment Responses - {assessmentModel.name}
                    </div>
                </div>

                {/* Respondent Info Card */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none rounded-3xl">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{member.name}</CardTitle>
                                <CardDescription className="mt-2 space-y-1">
                                    <div className="text-sm font-mono">{member.email}</div>
                                    <div className="text-sm">
                                        <span className="font-semibold text-gray-700">{member.currentRole?.name || "—"}</span>
                                        {member.orgUnit && (
                                            <span className="text-gray-500"> • {member.orgUnit.name}</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Completed on {formatDate(completedAt)} • Total time: {
                                            (() => {
                                                const seconds = totalTimeSpent || 0;
                                                if (!seconds || seconds <= 0) return "0s";
                                                const hours = Math.floor(seconds / 3600);
                                                const minutes = Math.floor((seconds % 3600) / 60);
                                                const secs = seconds % 60;
                                                if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
                                                if (minutes > 0) return `${minutes}m ${secs}s`;
                                                return `${secs}s`;
                                            })()
                                        }
                                    </div>
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-5xl font-black text-gray-900">{Math.round(overallScore || 0)}%</div>
                                {passed ? (
                                    <Badge className="mt-2 bg-emerald-500 text-white">PASSED</Badge>
                                ) : (
                                    <Badge className="mt-2 bg-rose-500 text-white">BELOW TARGET</Badge>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-6 grid grid-cols-4 gap-4 pt-6 border-t border-blue-200/50">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Questions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-indigo-600">{answeredQuestions}</div>
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Answered</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {Math.round((answeredQuestions / totalQuestions) * 100)}%
                                </div>
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Completion</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-cyan-600">{assessmentModel.components.length}</div>
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sections</div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Detailed Responses by Component */}
                <div className="space-y-6">
                    {assessmentModel.components.map((modelComponent: any, componentIndex: number) => (
                        <div key={modelComponent.id}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                    {componentIndex + 1}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {modelComponent.component.name}
                                </h2>
                                <Badge variant="outline" className="ml-auto">
                                    {modelComponent.component.componentType}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                {modelComponent.component.questions &&
                                    modelComponent.component.questions.map((question: any, qIndex: number) => {
                                        const response = question.responses?.[0];
                                        const isAnswered = !!response;
                                        const responseType = response?.responseData?.type || question.questionType;
                                        const isAudio = responseType === "VOICE_INTERVIEW" || responseType === "AUDIO";
                                        const isVideo = responseType === "VIDEO_INTERVIEW" || responseType === "VIDEO";
                                        const isText = responseType === "TEXT" || responseType === "MULTIPLE_CHOICE";

                                        return (
                                            <Card key={question.id} className="border-l-4 border-l-blue-500 rounded-xl">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <CardTitle className="text-base font-semibold text-gray-900">
                                                                Question {qIndex + 1}: {question.questionText}
                                                            </CardTitle>
                                                            {response && (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {isAnswered && (
                                                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                            Answered
                                                                        </Badge>
                                                                    )}
                                                                    {response.isCorrect === true && (
                                                                        <Badge className="bg-green-50 text-green-700 border-green-200">
                                                                            Correct
                                                                        </Badge>
                                                                    )}
                                                                    {response.isCorrect === false && (
                                                                        <Badge className="bg-red-50 text-red-700 border-red-200">
                                                                            Incorrect
                                                                        </Badge>
                                                                    )}
                                                                    {response.humanReviewRequired && (
                                                                        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                                            Needs Review
                                                                        </Badge>
                                                                    )}
                                                                    {response.humanReviewed && (
                                                                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                                                            Human Reviewed
                                                                        </Badge>
                                                                    )}
                                                                    {isAudio && (
                                                                        <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                                                                            <Headphones className="h-3 w-3 mr-1" />
                                                                            Audio Response
                                                                        </Badge>
                                                                    )}
                                                                    {isVideo && (
                                                                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                                                            <Video className="h-3 w-3 mr-1" />
                                                                            Video Response
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            {response?.aiScore !== null && response?.aiScore !== undefined && (
                                                                <div className="text-center">
                                                                    <div className="text-2xl font-black text-blue-600">
                                                                        {Math.round(response.aiScore)}
                                                                    </div>
                                                                    <div className="text-xs font-semibold text-gray-500">AI Score</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                {/* Response Content */}
                                                {response && (
                                                    <CardContent className="space-y-4">
                                                        {/* Audio Response */}
                                                        {isAudio && response.responseData?.audioUrl && (
                                                            <AudioResponseViewer
                                                                audioUrl={response.responseData.audioUrl}
                                                                transcript={response.responseData?.transcript}
                                                                duration={response.responseData?.duration}
                                                            />
                                                        )}

                                                        {/* Video Response */}
                                                        {isVideo && response.responseData?.videoUrl && (
                                                            <VideoResponseViewer
                                                                videoUrl={response.responseData.videoUrl}
                                                                thumbnail={response.responseData?.thumbnail}
                                                                duration={response.responseData?.duration}
                                                            />
                                                        )}

                                                        {/* Text/Multiple Choice Response */}
                                                        {(isText || !responseType) && (
                                                            <ResponseDetailViewer
                                                                question={question}
                                                                response={response}
                                                            />
                                                        )}

                                                        {/* AI Evaluation */}
                                                        {response.aiEvaluation && (
                                                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <BrainCircuit className="h-4 w-4 text-indigo-600" />
                                                                    <h4 className="font-semibold text-indigo-900">AI Evaluation</h4>
                                                                </div>
                                                                <p className="text-sm text-indigo-800 whitespace-pre-wrap">
                                                                    {typeof response.aiEvaluation === "string"
                                                                        ? response.aiEvaluation
                                                                        : JSON.stringify(response.aiEvaluation, null, 2)}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Human Feedback */}
                                                        {response.humanFeedback && (
                                                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                                                    <h4 className="font-semibold text-blue-900">Human Feedback</h4>
                                                                    {response.humanReviewedAt && (
                                                                        <span className="text-xs text-blue-600 font-mono ml-auto">
                                                                            Reviewed {formatDate(response.humanReviewedAt)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                                                    {response.humanFeedback}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Metadata */}
                                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 border-t pt-3">
                                                            <div>
                                                                <span className="font-semibold">Time Spent:</span> {
                                                                    (() => {
                                                                        const seconds = response.timeSpent || 0;
                                                                        if (!seconds || seconds <= 0) return "0s";
                                                                        const hours = Math.floor(seconds / 3600);
                                                                        const minutes = Math.floor((seconds % 3600) / 60);
                                                                        const secs = seconds % 60;
                                                                        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
                                                                        if (minutes > 0) return `${minutes}m ${secs}s`;
                                                                        return `${secs}s`;
                                                                    })()
                                                                }
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">Points:</span> {response.pointsAwardded || 0} / {response.maxPoints}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">Answered:</span> {formatDate(response.createdAt)}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                )}

                                                {!response && (
                                                    <CardContent>
                                                        <div className="text-center py-4 text-gray-400">
                                                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                                            <p className="text-sm">Not answered</p>
                                                        </div>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error fetching assessment response:", error);
        notFound();
    }
}

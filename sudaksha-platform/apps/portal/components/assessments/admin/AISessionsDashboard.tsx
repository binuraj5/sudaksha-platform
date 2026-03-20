"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Brain,
    Mic,
    Video,
    TrendingUp,
    TrendingDown,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    Activity,
    Star,
    BarChart3,
} from "lucide-react";

interface AdaptiveSessionData {
    id: string;
    status: string;
    questionsAsked: number;
    questionsCorrect: number;
    currentAbility: number;
    initialAbility: number;
    finalScore: number | null;
    abilityEstimate: number | null;
    startedAt: string;
    completedAt: string | null;
    targetLevel: string;
    member: { name: string; email: string } | null;
    competency: { name: string } | null;
    questions: {
        sequenceNumber: number;
        difficulty: number;
        isCorrect: boolean | null;
        timeTakenSeconds: number | null;
        questionType: string;
    }[];
}

interface AIResponseData {
    id: string;
    createdAt: string;
    responseData: any;
    question: { questionType: string };
    userComponent: {
        component: { componentType: string };
    };
}

interface Props {
    adaptiveSessions: AdaptiveSessionData[];
    aiResponses: AIResponseData[];
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
        COMPLETED: "bg-green-100 text-green-700 border-green-200",
        ABANDONED: "bg-gray-100 text-gray-600 border-gray-200",
        FAILED: "bg-red-100 text-red-700 border-red-200",
    };
    return (
        <Badge variant="outline" className={colors[status] || "bg-gray-100"}>
            {status.replace("_", " ")}
        </Badge>
    );
}

function ScoreGauge({ score, max = 100 }: { score: number; max?: number }) {
    const pct = Math.min((score / max) * 100, 100);
    const color = pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600";
    return (
        <span className={`font-bold text-lg tabular-nums ${color}`}>
            {Math.round(score)}{max === 100 ? "%" : ""}
        </span>
    );
}

function AbilityDelta({ initial, current }: { initial: number; current: number }) {
    const delta = current - initial;
    if (delta > 0.05) return (
        <span className="inline-flex items-center gap-0.5 text-green-600 text-xs font-bold">
            <TrendingUp className="h-3.5 w-3.5" />+{delta.toFixed(2)}
        </span>
    );
    if (delta < -0.05) return (
        <span className="inline-flex items-center gap-0.5 text-red-600 text-xs font-bold">
            <TrendingDown className="h-3.5 w-3.5" />{delta.toFixed(2)}
        </span>
    );
    return <span className="text-gray-400 text-xs">±0</span>;
}

function AdaptiveSessionCard({ s }: { s: AdaptiveSessionData }) {
    const accuracy = s.questionsAsked > 0
        ? Math.round((s.questionsCorrect / s.questionsAsked) * 100)
        : 0;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">
                            {s.member?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{s.member?.email}</p>
                    </div>
                    <StatusBadge status={s.status} />
                </div>

                {/* Competency + target */}
                <div className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4 text-purple-600 shrink-0" />
                    <span className="font-medium text-gray-700">{s.competency?.name ?? "—"}</span>
                    <Badge variant="secondary" className="text-xs">{s.targetLevel}</Badge>
                </div>

                {/* Score grid */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-2xs text-gray-500 uppercase tracking-widest text-[10px]">Score</p>
                        <ScoreGauge score={s.finalScore ?? accuracy} />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-2xs text-gray-500 uppercase tracking-widest text-[10px]">Questions</p>
                        <span className="font-bold text-lg text-gray-900">
                            {s.questionsCorrect}/{s.questionsAsked}
                        </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-2xs text-gray-500 uppercase tracking-widest text-[10px]">Ability</p>
                        <div className="text-sm font-bold text-gray-900">
                            {s.currentAbility.toFixed(2)}
                            <AbilityDelta initial={s.initialAbility} current={s.currentAbility} />
                        </div>
                    </div>
                </div>

                {/* Difficulty trail */}
                {s.questions.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Question trail</p>
                        <div className="flex gap-1 flex-wrap">
                            {s.questions.map((q, idx) => (
                                <div
                                    key={`${s.id}-q${idx}-seq${q.sequenceNumber}`}
                                    title={`Q${q.sequenceNumber}: diff=${q.difficulty.toFixed(1)}`}
                                    className={`h-2 w-5 rounded-sm transition-colors ${q.isCorrect === true
                                        ? "bg-green-400"
                                        : q.isCorrect === false
                                            ? "bg-red-400"
                                            : "bg-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Q1</span>
                            <span>
                                Avg difficulty: {(s.questions.reduce((a, q) => a + q.difficulty, 0) / s.questions.length).toFixed(1)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Time */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(s.startedAt).toLocaleString()}
                    {s.completedAt && (
                        <span>→ {new Date(s.completedAt).toLocaleTimeString()}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function VoiceResultCard({ r }: { r: AIResponseData }) {
    const data = r.responseData as any;
    const scores = [
        { label: "Content", value: data.content_quality ?? data.content_score, color: "bg-blue-500" },
        { label: "Clarity", value: data.communication_clarity, color: "bg-indigo-500" },
        { label: "Confidence", value: data.confidence, color: "bg-purple-500" },
        { label: "Professional", value: data.professionalism, color: "bg-pink-500" },
    ].filter(s => s.value != null);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                            <Mic className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">
                                {r.userComponent?.component?.componentType ?? "Voice Interview"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(r.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <ScoreGauge score={data.overall_score ?? 0} />
                        <p className="text-xs text-gray-500">overall</p>
                    </div>
                </div>

                {/* Score bars */}
                <div className="space-y-2">
                    {scores.map((s) => (
                        <div key={s.label} className="space-y-0.5">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{s.label}</span>
                                <span className="font-medium">{Math.round(s.value)}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${s.color}`}
                                    style={{ width: `${Math.min(s.value, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Feedback */}
                {data.feedback && (
                    <p className="text-xs text-gray-600 italic border-l-2 border-blue-200 pl-2">
                        {data.feedback}
                    </p>
                )}

                {/* Strengths / Weaknesses */}
                {(data.strengths?.length > 0 || data.weaknesses?.length > 0) && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {data.strengths?.length > 0 && (
                            <div>
                                <p className="text-green-700 font-semibold mb-1 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Strengths
                                </p>
                                <ul className="space-y-0.5 text-gray-600">
                                    {data.strengths.slice(0, 2).map((s: string, i: number) => (
                                        <li key={i} className="truncate">• {s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {data.weaknesses?.length > 0 && (
                            <div>
                                <p className="text-red-700 font-semibold mb-1 flex items-center gap-1">
                                    <XCircle className="h-3 w-3" /> Improve
                                </p>
                                <ul className="space-y-0.5 text-gray-600">
                                    {data.weaknesses.slice(0, 2).map((w: string, i: number) => (
                                        <li key={i} className="truncate">• {w}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function VideoResultCard({ r }: { r: AIResponseData }) {
    const data = r.responseData as any;
    const dimensions = [
        { label: "Content", value: data.content_score, icon: "📝" },
        { label: "Delivery", value: data.delivery_score, icon: "🎤" },
        { label: "Presence", value: data.visual_presence_score, icon: "👁️" },
        { label: "Professional", value: data.professionalism_score, icon: "💼" },
    ].filter((d) => d.value != null);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-red-100 rounded-lg">
                            <Video className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">
                                {r.userComponent?.component?.componentType ?? "Video Interview"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(r.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <ScoreGauge score={data.overall_score ?? 0} />
                        <p className="text-xs text-gray-500">overall</p>
                    </div>
                </div>

                {/* Dimension grid */}
                <div className="grid grid-cols-2 gap-2">
                    {dimensions.map((d) => (
                        <div key={d.label} className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{d.icon} {d.label}</p>
                            <ScoreGauge score={d.value} />
                        </div>
                    ))}
                </div>

                {/* Transcript snippet */}
                {data.transcript && (
                    <div className="text-xs bg-gray-50 rounded-lg p-2 max-h-20 overflow-hidden">
                        <p className="text-gray-400 font-medium mb-1">Transcript</p>
                        <p className="text-gray-600 line-clamp-3">{data.transcript}</p>
                    </div>
                )}

                {/* Feedback */}
                {data.feedback && (
                    <p className="text-xs text-gray-600 italic border-l-2 border-red-200 pl-2">
                        {data.feedback}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export function AISessionsDashboard({ adaptiveSessions, aiResponses }: Props) {
    const [activeTab, setActiveTab] = useState("overview");

    const voiceResponses = aiResponses.filter(
        (r) => r.question?.questionType === "VOICE_RESPONSE" ||
            (r.responseData as any)?.type === "VOICE_INTERVIEW"
    );
    const videoResponses = aiResponses.filter(
        (r) => r.question?.questionType === "VIDEO_RESPONSE" ||
            (r.responseData as any)?.type === "VIDEO_INTERVIEW"
    );

    const completedAdaptive = adaptiveSessions.filter((s) => s.status === "COMPLETED");
    const inProgressAdaptive = adaptiveSessions.filter((s) => s.status === "IN_PROGRESS");

    const avgAdaptiveScore = completedAdaptive.length > 0
        ? completedAdaptive.reduce((a, s) => a + (s.finalScore ?? 0), 0) / completedAdaptive.length
        : null;

    const avgVoiceScore = voiceResponses.length > 0
        ? voiceResponses.reduce((a, r) => a + ((r.responseData as any)?.overall_score ?? 0), 0) / voiceResponses.length
        : null;

    const avgVideoScore = videoResponses.length > 0
        ? videoResponses.reduce((a, r) => a + ((r.responseData as any)?.overall_score ?? 0), 0) / videoResponses.length
        : null;

    return (
        <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-purple-100 rounded-xl">
                            <Brain className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{adaptiveSessions.length}</p>
                            <p className="text-xs text-gray-500 font-medium">Adaptive Sessions</p>
                            {inProgressAdaptive.length > 0 && (
                                <Badge className="mt-1 text-[9px] bg-blue-100 text-blue-700 border-none">
                                    {inProgressAdaptive.length} live
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-blue-100 rounded-xl">
                            <Mic className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{voiceResponses.length}</p>
                            <p className="text-xs text-gray-500 font-medium">Voice Interviews</p>
                            {avgVoiceScore != null && (
                                <p className="text-xs font-bold text-blue-600">
                                    avg {Math.round(avgVoiceScore)}%
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-red-100 rounded-xl">
                            <Video className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{videoResponses.length}</p>
                            <p className="text-xs text-gray-500 font-medium">Video Interviews</p>
                            {avgVideoScore != null && (
                                <p className="text-xs font-bold text-red-600">
                                    avg {Math.round(avgVideoScore)}%
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-green-100 rounded-xl">
                            <Star className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">
                                {avgAdaptiveScore != null ? `${Math.round(avgAdaptiveScore)}%` : "—"}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">Avg Adaptive Score</p>
                            <p className="text-xs text-gray-400">{completedAdaptive.length} completed</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabbed content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-gray-100 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BarChart3 className="h-4 w-4 mr-1.5" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="adaptive" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Brain className="h-4 w-4 mr-1.5" />
                        Adaptive ({adaptiveSessions.length})
                    </TabsTrigger>
                    <TabsTrigger value="voice" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Mic className="h-4 w-4 mr-1.5" />
                        Voice ({voiceResponses.length})
                    </TabsTrigger>
                    <TabsTrigger value="video" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Video className="h-4 w-4 mr-1.5" />
                        Video ({videoResponses.length})
                    </TabsTrigger>
                </TabsList>

                {/* Overview tab */}
                <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Recent adaptive */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                <Brain className="h-4 w-4 text-purple-600" />
                                Recent Adaptive
                            </h3>
                            {adaptiveSessions.slice(0, 3).map((s) => (
                                <AdaptiveSessionCard key={s.id} s={s} />
                            ))}
                            {adaptiveSessions.length === 0 && (
                                <Card className="border-dashed">
                                    <CardContent className="py-8 text-center text-gray-400">
                                        <Brain className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No adaptive sessions yet</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Recent voice */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                <Mic className="h-4 w-4 text-blue-600" />
                                Recent Voice
                            </h3>
                            {voiceResponses.slice(0, 3).map((r) => (
                                <VoiceResultCard key={r.id} r={r} />
                            ))}
                            {voiceResponses.length === 0 && (
                                <Card className="border-dashed">
                                    <CardContent className="py-8 text-center text-gray-400">
                                        <Mic className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No voice interviews yet</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Recent video */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                <Video className="h-4 w-4 text-red-600" />
                                Recent Video
                            </h3>
                            {videoResponses.slice(0, 3).map((r) => (
                                <VideoResultCard key={r.id} r={r} />
                            ))}
                            {videoResponses.length === 0 && (
                                <Card className="border-dashed">
                                    <CardContent className="py-8 text-center text-gray-400">
                                        <Video className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No video interviews yet</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Adaptive tab */}
                <TabsContent value="adaptive" className="mt-6">
                    {adaptiveSessions.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="py-16 text-center">
                                <Brain className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600">No adaptive sessions yet</h3>
                                <p className="text-gray-400 text-sm mt-2">
                                    When candidates take adaptive AI assessments, results will appear here.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {adaptiveSessions.map((s) => (
                                <AdaptiveSessionCard key={s.id} s={s} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Voice tab */}
                <TabsContent value="voice" className="mt-6">
                    {voiceResponses.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="py-16 text-center">
                                <Mic className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600">No voice interviews yet</h3>
                                <p className="text-gray-400 text-sm mt-2">
                                    Voice interview evaluations will appear here after candidates complete them.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {voiceResponses.map((r) => (
                                <VoiceResultCard key={r.id} r={r} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Video tab */}
                <TabsContent value="video" className="mt-6">
                    {videoResponses.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="py-16 text-center">
                                <Video className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600">No video interviews yet</h3>
                                <p className="text-gray-400 text-sm mt-2">
                                    AI video analysis results will appear here after candidates complete interviews.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {videoResponses.map((r) => (
                                <VideoResultCard key={r.id} r={r} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

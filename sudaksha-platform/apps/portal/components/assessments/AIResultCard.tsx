"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Mic, Video, CheckCircle2, XCircle, TrendingUp, MessageSquare } from "lucide-react";

interface AIResultCardProps {
    responseData: Record<string, unknown>;
    componentType?: string;
}

function ScoreBar({ label, score, color = "bg-blue-500" }: { label: string; score: number; color?: string }) {
    const pct = Math.min(Math.max(score, 0), 100);
    const textColor = pct >= 70 ? "text-green-700" : pct >= 50 ? "text-amber-700" : "text-red-700";
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">{label}</span>
                <span className={`font-bold tabular-nums ${textColor}`}>{Math.round(pct)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function AdaptiveAIResult({ data }: { data: Record<string, unknown> }) {
    const finalScore = Number(data.finalScore ?? data.percentage ?? 0);
    const accuracy = Number(data.accuracy ?? 0);
    const questionsAsked = Number(data.questionsAsked ?? 0);
    const questionsCorrect = Number(data.questionsCorrect ?? 0);
    const abilityEstimate = Number(data.abilityEstimate ?? data.finalAbility ?? 0);

    const difficultyLabel =
        abilityEstimate <= 3 ? "Foundational" :
            abilityEstimate <= 6 ? "Intermediate" :
                abilityEstimate <= 8 ? "Advanced" : "Expert";

    return (
        <Card className="border-purple-100 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Brain className="h-4 w-4 text-purple-600" />
                    </div>
                    Adaptive AI Assessment
                    <Badge variant="outline" className="ml-auto text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {difficultyLabel} Level
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-2xl font-black text-gray-900">{Math.round(finalScore)}%</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Final Score</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-2xl font-black text-gray-900">{questionsCorrect}/{questionsAsked}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Correct</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-2xl font-black text-gray-900">{abilityEstimate.toFixed(1)}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">IRT Ability</p>
                    </div>
                </div>
                <ScoreBar label="Accuracy Rate" score={accuracy * 100} color="bg-purple-500" />
                <p className="text-xs text-gray-500 bg-purple-50 rounded-lg p-3 leading-relaxed">
                    <strong className="text-purple-700">About this score:</strong> The IRT (Item Response Theory) adaptive
                    engine calibrated question difficulty in real-time based on your responses. Your ability estimate of{" "}
                    <strong>{abilityEstimate.toFixed(2)}</strong>/10 reflects {difficultyLabel.toLowerCase()}-level proficiency.
                </p>
            </CardContent>
        </Card>
    );
}

function VoiceInterviewResult({ data }: { data: Record<string, unknown> }) {
    const overallScore = Number(data.overall_score ?? 0);
    const contentQuality = Number(data.content_quality ?? data.content_score ?? 0);
    const commClarity = Number(data.communication_clarity ?? data.delivery_score ?? 0);
    const confidence = Number(data.confidence ?? data.visual_presence_score ?? 0);
    const professionalism = Number(data.professionalism ?? data.professionalism_score ?? 0);
    const feedback = data.feedback as string ?? "";
    const strengths = (data.strengths as string[]) ?? [];
    const weaknesses = (data.weaknesses as string[] | undefined) ?? (data.improvements as string[] | undefined) ?? [];
    const questionAsked = data.question_asked as string ?? "";
    const transcript = data.transcript as string ?? "";
    const questionNumber = data.question_number as number ?? 1;

    return (
        <Card className="border-blue-100 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Mic className="h-4 w-4 text-blue-600" />
                    </div>
                    AI Voice Interview
                    {questionNumber > 0 && (
                        <Badge variant="outline" className="ml-auto text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Question {questionNumber}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Overall + bars */}
                <div className="flex items-center gap-4">
                    <div className="text-center bg-blue-50 rounded-xl p-3 min-w-[80px]">
                        <p className="text-3xl font-black text-blue-700">{Math.round(overallScore)}%</p>
                        <p className="text-[10px] text-gray-400 uppercase">Overall</p>
                    </div>
                    <div className="flex-1 space-y-2">
                        {contentQuality > 0 && <ScoreBar label="Content Quality" score={contentQuality} color="bg-blue-500" />}
                        {commClarity > 0 && <ScoreBar label="Communication" score={commClarity} color="bg-indigo-500" />}
                        {confidence > 0 && <ScoreBar label="Confidence" score={confidence} color="bg-purple-500" />}
                        {professionalism > 0 && <ScoreBar label="Professionalism" score={professionalism} color="bg-pink-500" />}
                    </div>
                </div>

                {/* Question asked */}
                {questionAsked && (
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Question Asked</p>
                        <p className="text-sm text-gray-700 italic">"{questionAsked}"</p>
                    </div>
                )}

                {/* Feedback */}
                {feedback && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> AI Feedback
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
                    </div>
                )}

                {/* Transcript snippet */}
                {transcript && (
                    <div className="bg-gray-50 rounded-lg p-3 max-h-24 overflow-hidden">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Transcript</p>
                        <p className="text-xs text-gray-600 line-clamp-3">{transcript}</p>
                    </div>
                )}

                {/* Strengths / Weaknesses */}
                {(strengths.length > 0 || weaknesses.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        {strengths.length > 0 && (
                            <div className="bg-green-50 rounded-lg p-3">
                                <p className="font-bold text-green-700 mb-2 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Strengths
                                </p>
                                <ul className="space-y-1 text-gray-600">
                                    {strengths.slice(0, 3).map((s, i) => (
                                        <li key={i} className="leading-snug">• {s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {weaknesses.length > 0 && (
                            <div className="bg-amber-50 rounded-lg p-3">
                                <p className="font-bold text-amber-700 mb-2 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> To Improve
                                </p>
                                <ul className="space-y-1 text-gray-600">
                                    {weaknesses.slice(0, 3).map((w, i) => (
                                        <li key={i} className="leading-snug">• {w}</li>
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

function VideoInterviewResult({ data }: { data: Record<string, unknown> }) {
    const overallScore = Number(data.overall_score ?? 0);
    const contentScore = Number(data.content_score ?? 0);
    const deliveryScore = Number(data.delivery_score ?? 0);
    const presenceScore = Number(data.visual_presence_score ?? 0);
    const professionalismScore = Number(data.professionalism_score ?? 0);
    const feedback = data.feedback as string ?? "";
    const transcript = data.transcript as string ?? "";
    const strengths = (data.strengths as string[] | undefined) ?? [];
    const improvements = (data.improvements as string[] | undefined) ?? [];
    const questionCount = Number(data.questionCount ?? 0);

    const dimensions = [
        { label: "Content Quality", score: contentScore, color: "bg-red-500" },
        { label: "Delivery", score: deliveryScore, color: "bg-orange-500" },
        { label: "Visual Presence", score: presenceScore, color: "bg-amber-500" },
        { label: "Professionalism", score: professionalismScore, color: "bg-yellow-600" },
    ].filter((d) => d.score > 0);

    return (
        <Card className="border-red-100 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100">
                <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                        <Video className="h-4 w-4 text-red-600" />
                    </div>
                    AI Video Interview
                    {questionCount > 0 && (
                        <Badge variant="outline" className="ml-auto text-xs bg-red-50 text-red-700 border-red-200">
                            {questionCount} questions
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Score grid */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <div className="col-span-2 sm:col-span-1 text-center bg-red-50 rounded-xl p-3">
                        <p className="text-3xl font-black text-red-700">{Math.round(overallScore)}%</p>
                        <p className="text-[10px] text-gray-400 uppercase">Overall</p>
                    </div>
                    {dimensions.map((d) => (
                        <div key={d.label} className="text-center bg-gray-50 rounded-xl p-2">
                            <p className="text-lg font-black text-gray-900">{Math.round(d.score)}%</p>
                            <p className="text-[9px] text-gray-400 uppercase leading-tight">{d.label}</p>
                        </div>
                    ))}
                </div>

                {/* Score bars */}
                {dimensions.length > 0 && (
                    <div className="space-y-2">
                        {dimensions.map((d) => (
                            <ScoreBar key={d.label} label={d.label} score={d.score} color={d.color} />
                        ))}
                    </div>
                )}

                {/* Feedback */}
                {feedback && (
                    <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-3">
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> AI Feedback
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
                    </div>
                )}

                {/* Transcript snippet */}
                {transcript && (
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Transcript Snippet</p>
                        <p className="text-xs text-gray-600 line-clamp-3">{transcript}</p>
                    </div>
                )}

                {/* Strengths / Improvements */}
                {(strengths.length > 0 || improvements.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        {strengths.length > 0 && (
                            <div className="bg-green-50 rounded-lg p-3">
                                <p className="font-bold text-green-700 mb-2 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Strengths
                                </p>
                                <ul className="space-y-1 text-gray-600">
                                    {strengths.slice(0, 3).map((s, i) => (
                                        <li key={i} className="leading-snug">• {s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {improvements.length > 0 && (
                            <div className="bg-amber-50 rounded-lg p-3">
                                <p className="font-bold text-amber-700 mb-2 flex items-center gap-1">
                                    <XCircle className="h-3 w-3" /> To Improve
                                </p>
                                <ul className="space-y-1 text-gray-600">
                                    {improvements.slice(0, 3).map((imp, i) => (
                                        <li key={i} className="leading-snug">• {imp}</li>
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

export function AIResultCard({ responseData, componentType }: AIResultCardProps) {
    const type = (responseData.type as string) ?? "";

    if (type === "ADAPTIVE_INTERVIEW" || componentType === "ADAPTIVE_AI" || componentType === "ADAPTIVE_QUESTIONNAIRE") {
        return <AdaptiveAIResult data={responseData} />;
    }
    if (type === "VOICE_INTERVIEW" || componentType === "VOICE") {
        return <VoiceInterviewResult data={responseData} />;
    }
    if (type === "VIDEO_INTERVIEW" || componentType === "VIDEO") {
        return <VideoInterviewResult data={responseData} />;
    }

    // Unknown AI type — show generic
    return (
        <Card className="border-gray-100">
            <CardContent className="p-4">
                <p className="text-sm text-gray-500">AI assessment result recorded.</p>
                <pre className="text-xs text-gray-400 mt-2 overflow-x-auto max-h-32">
                    {JSON.stringify(responseData, null, 2)}
                </pre>
            </CardContent>
        </Card>
    );
}

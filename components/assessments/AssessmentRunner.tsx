"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
    Clock,
    AlertCircle,
    CheckCircle2,
    Play,
    ChevronRight,
    Loader2,
    ShieldCheck,
    Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ComponentQuestionRenderer, type RunnerQuestion } from "./ComponentQuestionRenderer";
import { VoiceInterviewRunner } from "./VoiceInterviewRunner";
import { VideoInterviewRunner } from "./VideoInterviewRunner";
import { AdaptiveAssessmentRunner } from "./AdaptiveAssessmentRunner";

interface AssessmentRunnerProps {
    userAssessment: any; // Type should be properly defined based on Prisma include
}

type RunnerStep = 'INSTRUCTIONS' | 'COMPONENT_INTRO' | 'COMPONENT_RUNNING' | 'FINISHED';

// Support both ProjectUserAssessment (projectAssignment.model) and MemberAssessment (assessmentModel)
const getModel = (ua: any) => ua.projectAssignment?.model ?? ua.assessmentModel;

export function AssessmentRunner({ userAssessment }: AssessmentRunnerProps) {
    const model = getModel(userAssessment);
    const isNotStarted = ['NOT_STARTED', 'DRAFT'].includes(userAssessment.status);
    const [step, setStep] = useState<RunnerStep>(
        isNotStarted ? 'INSTRUCTIONS' : 'COMPONENT_INTRO'
    );
    const [activeComponentIndex, setActiveComponentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [runnerState, setRunnerState] = useState<{
        userComponentId: string;
        questions: RunnerQuestion[];
        maxScore: number;
        useRuntimeAI?: boolean;
        totalRuntimeQuestions?: number;
        useVoiceInterview?: boolean;
        voiceConfig?: { questionCount: number; maxDurationPerQuestion: number; competencyName: string; targetLevel: string };
        voiceQuestionId?: string | null;
        useVideoInterview?: boolean;
        videoConfig?: { questionCount: number; maxDurationPerQuestion: number; retakesAllowed: number; competencyName: string; targetLevel: string };
        videoQuestionId?: string | null;
        useAdaptiveAI?: boolean;
        adaptiveConfig?: Record<string, unknown>;
        performanceHistory?: { recent: { isCorrect: boolean }[]; total: number; correct: number; streak: number; userId: string | null };
    } | null>(null);
    const [answers, setAnswers] = useState<Record<string, unknown>>({});
    const [componentStartTime, setComponentStartTime] = useState<number>(Date.now());
    const [componentDurationSeconds, setComponentDurationSeconds] = useState(900); // 15 min default
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [timerTick, setTimerTick] = useState(0);
    const timeUpSubmittedRef = useRef(false);
    const router = useRouter();

    const components = (model?.components || []) as any[];
    const activeComponent = components[activeComponentIndex];

    useEffect(() => {
        if (step === "COMPONENT_RUNNING") setCurrentQIndex(0);
    }, [step]);

    useEffect(() => {
        if (step !== "COMPONENT_RUNNING") return;
        const id = setInterval(() => setTimerTick((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, [step]);

    useEffect(() => {
        if (step !== "COMPONENT_RUNNING" || !activeComponent?.id || !runnerState?.userComponentId) return;
        const timeLeft = componentDurationSeconds - timerTick;
        if (timeLeft > 0 || timeUpSubmittedRef.current) return;
        timeUpSubmittedRef.current = true;
        (async () => {
            try {
                const res = await fetch(
                    `/api/assessments/runner/${userAssessment.id}/component/${activeComponent.id}/complete`,
                    { method: "POST" }
                );
                const data = await res.json();
                if (res.ok) {
                    toast.info("Time's up! Section submitted.");
                    setRunnerState(null);
                    if (data.isLastSection) {
                        setStep("FINISHED");
                        router.push(`/assessments/results/${userAssessment.id}`);
                    } else {
                        setActiveComponentIndex((i) => i + 1);
                        setStep("COMPONENT_INTRO");
                    }
                }
            } catch {
                toast.error("Auto-submit failed");
            } finally {
                timeUpSubmittedRef.current = false;
            }
        })();
    }, [step, activeComponent?.id, runnerState?.userComponentId, componentDurationSeconds, timerTick, userAssessment.id, router]);

    const handleStartAssessment = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/assessments/${userAssessment.id}/start`, {
                method: 'POST'
            });
            if (res.ok) {
                setStep('COMPONENT_INTRO');
            } else {
                toast.error("Failed to start assessment. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const saveResponse = useCallback(
        async (questionId: string, responseData: unknown) => {
            if (!runnerState?.userComponentId) return;
            try {
                await fetch("/api/assessments/runner/response", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userComponentId: runnerState.userComponentId,
                        questionId,
                        responseData,
                        maxPoints: 1,
                    }),
                });
            } catch (e) {
                console.error("Save response failed", e);
            }
        },
        [runnerState?.userComponentId]
    );

    const fetchRuntimeQuestion = useCallback(async (
        answeredCount: number,
        performanceHistory: { recent: { isCorrect: boolean }[]; total: number; correct: number; streak: number; userId: string | null },
        totalQuestionsOverride?: number
    ) => {
        if (!activeComponent?.id) return null;
        const totalQuestions = totalQuestionsOverride ?? runnerState?.totalRuntimeQuestions ?? 5;
        const res = await fetch("/api/assessments/runtime/generate-next-question", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: userAssessment.id,
                componentId: activeComponent.id,
                performanceHistory,
                answeredCount,
                runtimeConfig: {
                    enabled: true,
                    totalQuestions,
                    initialContext: (activeComponent as { name?: string })?.name ?? "Assessment",
                },
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to generate question");
        }
        const data = await res.json();
        const q = data.question;
        const runnerQ: RunnerQuestion = {
            id: `runtime-${answeredCount}-${Date.now()}`,
            questionText: q.text ?? q.questionText ?? "",
            questionType: (q.type === "multiple_choice" ? "MULTIPLE_CHOICE" : (q.type ?? "MULTIPLE_CHOICE").toString().toUpperCase().replace(/-/g, "_")),
            options: q.options ?? [],
            correctAnswer: q.correctAnswer ?? null,
            points: q.points ?? 1,
        };
        return runnerQ;
    }, [userAssessment.id, activeComponent?.id, runnerState?.totalRuntimeQuestions]);

    const handleStartComponent = async () => {
        if (!activeComponent?.id) return;
        setLoading(true);
        setAnswers({});
        try {
            const res = await fetch(
                `/api/assessments/runner/${userAssessment.id}/component/${activeComponent.id}/start`,
                { method: "POST" }
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to start section");
                return;
            }
            const data = await res.json();
            const useRuntimeAI = data.useRuntimeAI === true;
            const totalRuntimeQuestions = data.totalRuntimeQuestions ?? 5;
            setRunnerState({
                userComponentId: data.userComponentId,
                questions: data.questions ?? [],
                maxScore: data.maxScore ?? 0,
                ...(data.useVoiceInterview && data.voiceConfig && data.voiceQuestionId && {
                    useVoiceInterview: true,
                    voiceConfig: data.voiceConfig,
                    voiceQuestionId: data.voiceQuestionId,
                }),
                ...(data.useVideoInterview && data.videoConfig && data.videoQuestionId && {
                    useVideoInterview: true,
                    videoConfig: data.videoConfig,
                    videoQuestionId: data.videoQuestionId,
                }),
                ...(data.useAdaptiveAI && data.adaptiveConfig && {
                    useAdaptiveAI: true,
                    adaptiveConfig: data.adaptiveConfig,
                }),
                ...(useRuntimeAI && {
                    useRuntimeAI: true,
                    totalRuntimeQuestions,
                    performanceHistory: { recent: [], total: 0, correct: 0, streak: 0, userId: null },
                }),
            });
            const duration = activeComponent.customDuration ?? 15;
            setComponentDurationSeconds(duration * 60);
            setComponentStartTime(Date.now());
            timeUpSubmittedRef.current = false;
            setStep("COMPONENT_RUNNING");
            if (useRuntimeAI && (data.questions?.length ?? 0) === 0) {
                try {
                    const firstQ = await fetchRuntimeQuestion(0, { recent: [], total: 0, correct: 0, streak: 0, userId: null }, totalRuntimeQuestions);
                    if (firstQ) {
                        setRunnerState((prev) => prev ? { ...prev, questions: [firstQ] } : null);
                    }
                } catch (e) {
                    toast.error("Could not load first question. You can continue with static questions or try again.");
                }
            }
        } catch (e) {
            toast.error("Failed to start section");
        } finally {
            setLoading(false);
        }
    };

    // Instruction View
    if (step === 'INSTRUCTIONS') {
        return (
            <div className="max-w-4xl mx-auto space-y-8 py-12 px-4">
                <div className="text-center space-y-4">
                    <div className="inline-flex p-3 bg-red-50 rounded-2xl">
                        <ShieldCheck className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">{model?.name}</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Please read the following instructions carefully before starting your assessment.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white shadow-sm border-gray-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Duration
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold">{(model?.totalDuration ?? model?.durationMinutes ?? 30)} Minutes</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm border-gray-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2">
                                <Layers className="h-3 w-3" /> Sections
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold">{components.length} Components</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm border-gray-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" /> Mode
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold">Proctored</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-gray-50 border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Info className="h-5 w-5 text-blue-600" />
                            Rules & Regulations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-gray-600">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Ensure you have a stable internet connection throughout the assessment.</li>
                            <li>Do not refresh or close the browser window once the assessment has started.</li>
                            <li>Your progress is saved automatically at each step.</li>
                            <li>The assessment will auto-submit if the timer runs out.</li>
                            <li>Switching tabs or windows may be flagged as a violation.</li>
                        </ul>
                    </CardContent>
                    <CardFooter className="bg-white border-t rounded-b-lg p-6 flex justify-center">
                        <Button
                            className="bg-red-600 hover:bg-red-700 h-12 px-8 text-lg font-bold min-w-[200px]"
                            onClick={handleStartAssessment}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
                            I'm Ready, Start
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Component Transition View
    if (step === 'COMPONENT_INTRO') {
        if (!activeComponent) {
            setStep('FINISHED');
            return null;
        }

        return (
            <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-8">
                <div className="space-y-2">
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                        Section {activeComponentIndex + 1} of {components.length}
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900">{(activeComponent as { name?: string }).name ?? `Section ${activeComponentIndex + 1}`}</h2>
                    <p className="text-gray-500 max-w-md mx-auto">{(activeComponent as { description?: string }).description ?? "Answer the following questions."}</p>
                </div>

                <Card className="bg-white border-blue-100 shadow-lg">
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Type</p>
                                <p className="font-bold text-gray-900 capitalize">{(activeComponent as { type?: string }).type?.toLowerCase().replace('_', ' ') ?? 'questions'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Time Limit</p>
                                <p className="font-bold text-gray-900">{activeComponent.customDuration ?? 15} Minutes</p>
                            </div>
                        </div>

                        <div className="text-left bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                            <p className="text-xs text-blue-800 leading-relaxed">
                                Once you start this section, the timer will begin. You cannot go back to previous sections once a section is submitted.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0 flex justify-center">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-bold"
                            onClick={handleStartComponent}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChevronRight className="ml-2 h-5 w-5" />}
                            Start This Section
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Component running: questions with timer and submit
    if (step === "COMPONENT_RUNNING") {
        const questions = runnerState?.questions ?? [];
        const timeLeft = Math.max(0, componentDurationSeconds - timerTick);
        const formatTime = (s: number) => {
            const m = Math.floor(s / 60);
            const sec = s % 60;
            return `${m}:${sec < 10 ? "0" : ""}${sec}`;
        };

        const handleNextSection = async () => {
            if (!activeComponent?.id) return;
            const unanswered = questions.filter((q) => {
                const v = answers[q.id];
                return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
            }).length;
            if (unanswered > 0) {
                toast.info(`${unanswered} unanswered question(s). Submitting section anyway.`);
            }
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/assessments/runner/${userAssessment.id}/component/${activeComponent.id}/complete`,
                    { method: "POST" }
                );
                const data = await res.json();
                if (!res.ok) {
                    toast.error(data.error || "Failed to submit section");
                    return;
                }
                setRunnerState(null);
                if (data.isLastSection) {
                    setStep("FINISHED");
                    router.push(`/assessments/results/${userAssessment.id}`);
                } else {
                    setActiveComponentIndex((i) => i + 1);
                    setStep("COMPONENT_INTRO");
                }
            } catch (e) {
                toast.error("Failed to submit section");
            } finally {
                setLoading(false);
            }
        };

        const sectionName = (activeComponent as { name?: string })?.name ?? `Section ${activeComponentIndex + 1}`;

        // Voice interview: full AI conversation flow
        if (runnerState?.useVoiceInterview && runnerState?.voiceConfig && runnerState?.voiceQuestionId) {
            return (
                <div className="min-h-[80vh] flex flex-col">
                    <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-20">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-50 p-2 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{sectionName}</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{model?.name}</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg bg-gray-900 text-white`}>
                            <Clock className="h-5 w-5 text-red-400" />
                            {formatTime(Math.max(0, componentDurationSeconds - timerTick))}
                        </div>
                    </div>
                    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
                        <VoiceInterviewRunner
                            userComponentId={runnerState.userComponentId}
                            questionId={runnerState.voiceQuestionId}
                            voiceConfig={runnerState.voiceConfig}
                            sectionName={sectionName}
                            onComplete={handleNextSection}
                        />
                    </div>
                </div>
            );
        }

        // Adaptive AI: runtime question generation
        if (runnerState?.useAdaptiveAI && runnerState?.adaptiveConfig) {
            return (
                <div className="min-h-[80vh] flex flex-col">
                    <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-20">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-50 p-2 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{sectionName}</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{model?.name}</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg bg-gray-900 text-white`}>
                            <Clock className="h-5 w-5 text-red-400" />
                            {formatTime(Math.max(0, componentDurationSeconds - timerTick))}
                        </div>
                    </div>
                    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
                        <AdaptiveAssessmentRunner
                            assessmentId={userAssessment.id}
                            componentId={activeComponent.id}
                            adaptiveConfig={runnerState.adaptiveConfig as { min_questions?: number; max_questions?: number }}
                            sectionName={sectionName}
                            onComplete={handleNextSection}
                        />
                    </div>
                </div>
            );
        }

        // Video interview: record, upload, analyze
        if (runnerState?.useVideoInterview && runnerState?.videoConfig && runnerState?.videoQuestionId) {
            return (
                <div className="min-h-[80vh] flex flex-col">
                    <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-20">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-50 p-2 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{sectionName}</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{model?.name}</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg bg-gray-900 text-white`}>
                            <Clock className="h-5 w-5 text-red-400" />
                            {formatTime(Math.max(0, componentDurationSeconds - timerTick))}
                        </div>
                    </div>
                    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
                        <VideoInterviewRunner
                            userComponentId={runnerState.userComponentId}
                            questionId={runnerState.videoQuestionId}
                            videoConfig={runnerState.videoConfig}
                            sectionName={sectionName}
                            onComplete={handleNextSection}
                        />
                    </div>
                </div>
            );
        }

        if (questions.length === 0) {
            return (
                <div className="min-h-[80vh] flex flex-col">
                    <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-20">
                        <h3 className="font-bold text-gray-900">{sectionName}</h3>
                        <Button onClick={handleNextSection}>Continue</Button>
                    </div>
                    <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
                        <Card className="max-w-md p-8 text-center">
                            <p className="text-gray-600">This section has no questions.</p>
                            <Button className="mt-4" onClick={handleNextSection}>
                                Continue to next section
                            </Button>
                        </Card>
                    </div>
                </div>
            );
        }

        const currentQ = questions[currentQIndex];
        return (
            <div className="min-h-[80vh] flex flex-col">
                <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-50 p-2 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900">{sectionName}</h3>
                                <Badge variant="secondary" className="text-xs font-normal">
                                    Section {activeComponentIndex + 1} of {components.length}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{model?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg ${timeLeft < 120 ? "bg-red-900 text-white" : "bg-gray-900 text-white"}`}>
                            <Clock className="h-5 w-5 text-red-400" />
                            {formatTime(timeLeft)}
                        </div>
                        <Button variant="ghost" className="text-gray-500" asChild>
                            <Link href="/assessments/individuals/dashboard">Save & Exit</Link>
                        </Button>
                    </div>
                </div>

                <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <Badge variant="outline">
                                Question {currentQIndex + 1} of {questions.length}
                            </Badge>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentQIndex === 0}
                                    onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    size="sm"
                                    disabled={currentQIndex >= questions.length - 1}
                                    onClick={() => setCurrentQIndex((i) => Math.min(questions.length - 1, i + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>

                        <ComponentQuestionRenderer
                            question={currentQ}
                            value={answers[currentQ.id]}
                            onChange={(v) => setAnswers((prev) => ({ ...prev, [currentQ.id]: v }))}
                            onSave={saveResponse}
                        />

                        <div className="flex justify-between pt-6 border-t pt-6">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
                                disabled={currentQIndex === 0}
                            >
                                Previous
                            </Button>
                            {currentQIndex >= questions.length - 1 ? (
                                <Button onClick={handleNextSection} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Submit section
                                </Button>
                            ) : (
                                <Button onClick={() => setCurrentQIndex((i) => i + 1)}>
                                    Next question
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Finish View
    if (step === 'FINISHED') {
        return (
            <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-8">
                <div className="bg-green-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900">Assessment Completed!</h1>
                    <p className="text-lg text-gray-500">Congratulations {(userAssessment.user || userAssessment.member)?.name}, you have successfully finished the assessment.</p>
                </div>

                <Card className="bg-white shadow-sm border-gray-100">
                    <CardContent className="p-8 space-y-4">
                        <p className="text-sm text-gray-600">
                            Your responses have been securely submitted. The results will be shared with your project administrator. You can view your progress on the dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button className="bg-gray-900 hover:bg-gray-800 flex-1" asChild>
                                <Link href={`/assessments/results/${userAssessment.id}`}>View results</Link>
                            </Button>
                            <Button variant="outline" className="flex-1" asChild>
                                <Link href="/assessments/individuals/dashboard">Return to Dashboard</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
}

function Layers({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
            <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
            <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
        </svg>
    );
}

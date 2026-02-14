"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface VoiceConfig {
    questionCount: number;
    maxDurationPerQuestion: number;
    competencyName: string;
    targetLevel: string;
}

interface VoiceInterviewRunnerProps {
    userComponentId: string;
    questionId: string;
    voiceConfig: VoiceConfig;
    sectionName: string;
    onComplete: () => void;
}

export function VoiceInterviewRunner({
    userComponentId,
    questionId,
    voiceConfig,
    sectionName,
    onComplete,
}: VoiceInterviewRunnerProps) {
    const { competencyName, targetLevel, questionCount } = voiceConfig;
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [fullTranscript, setFullTranscript] = useState<string[]>([]);
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mediaRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Start interview on mount
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/voice/start-interview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        competencyName,
                        targetLevel,
                        questionCount,
                    }),
                });
                if (cancelled) return;
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || "Failed to start interview");
                }
                const data = await res.json();
                setSessionId(data.session_id);
                setCurrentQuestion(data.initial_question);
                setQuestionNumber(data.question_number ?? 1);
            } catch (e) {
                if (!cancelled) {
                    setError((e as Error).message);
                    toast.error("Could not start voice interview");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [competencyName, targetLevel, questionCount]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            mediaRef.current = recorder;
            chunksRef.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.start();
            setRecording(true);
        } catch {
            toast.error("Microphone access denied");
        }
    };

    const stopRecordingAndSubmit = () => {
        if (!mediaRef.current || !recording) return;
        setRecording(false);
        setProcessing(true);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        mediaRef.current.onstop = async () => {
            try {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                const fd = new FormData();
                fd.append("audio", blob);

                const transcribeRes = await fetch("/api/voice/transcribe", { method: "POST", body: fd });
                if (!transcribeRes.ok) {
                    const err = await transcribeRes.json().catch(() => ({}));
                    throw new Error(err.error || "Transcription failed");
                }
                const transcribeData = await transcribeRes.json();
                const transcript = transcribeData.text ?? transcribeData.transcript ?? "";

                if (!transcript.trim()) {
                    toast.error("No speech detected. Please try again.");
                    setProcessing(false);
                    return;
                }

                setFullTranscript((prev) => [...prev, `Q${questionNumber}: ${currentQuestion}`, `A: ${transcript}`]);

                if (questionNumber >= questionCount) {
                    // Interview complete - evaluate and save
                    const fullText = [...fullTranscript, `Q${questionNumber}: ${currentQuestion}`, `A: ${transcript}`].join("\n\n");
                    const evalRes = await fetch("/api/voice/evaluate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            competencyName,
                            targetLevel,
                            transcript: fullText,
                        }),
                    });
                    if (!evalRes.ok) {
                        const err = await evalRes.json().catch(() => ({}));
                        throw new Error(err.error || "Evaluation failed");
                    }
                    const evalData = await evalRes.json();

                    await fetch("/api/assessments/runner/response", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userComponentId,
                            questionId,
                            responseData: {
                                transcript: fullText,
                                overall_score: evalData.overall_score,
                                content_quality: evalData.content_quality,
                                communication_clarity: evalData.communication_clarity,
                                confidence: evalData.confidence,
                                professionalism: evalData.professionalism,
                                feedback: evalData.feedback,
                                strengths: evalData.strengths,
                                weaknesses: evalData.weaknesses,
                                type: "VOICE_INTERVIEW",
                            },
                            maxPoints: 100,
                        }),
                    });

                    toast.success("Voice interview completed!");
                    onComplete();
                    return;
                }

                // Get next question
                const respondRes = await fetch("/api/voice/respond", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId,
                        question: currentQuestion,
                        transcript,
                        questionNumber,
                    }),
                });
                if (!respondRes.ok) {
                    const err = await respondRes.json().catch(() => ({}));
                    throw new Error(err.error || "Failed to get next question");
                }
                const respondData = await respondRes.json();

                if (respondData.is_complete || !respondData.follow_up_question) {
                    // Evaluate with current transcript
                    const fullText = [...fullTranscript, `Q${questionNumber}: ${currentQuestion}`, `A: ${transcript}`].join("\n\n");
                    const evalRes = await fetch("/api/voice/evaluate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ competencyName, targetLevel, transcript: fullText }),
                    });
                    if (!evalRes.ok) throw new Error("Evaluation failed");
                    const evalData = await evalRes.json();

                    await fetch("/api/assessments/runner/response", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userComponentId,
                            questionId,
                            responseData: {
                                transcript: fullText,
                                overall_score: evalData.overall_score,
                                type: "VOICE_INTERVIEW",
                                ...evalData,
                            },
                            maxPoints: 100,
                        }),
                    });
                    toast.success("Voice interview completed!");
                    onComplete();
                    return;
                }

                setCurrentQuestion(respondData.follow_up_question);
                setQuestionNumber(respondData.next_question_number);
            } catch (e) {
                toast.error((e as Error).message || "Something went wrong");
            } finally {
                setProcessing(false);
            }
        };
        mediaRef.current.stop();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-navy-600 mb-4" />
                <p className="text-muted-foreground">Starting AI voice interview...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-red-600">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mic className="h-5 w-5" />
                        {sectionName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Question {questionNumber} of {questionCount}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="font-medium text-gray-900">{currentQuestion}</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={recording ? stopRecordingAndSubmit : startRecording}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : recording ? (
                                <>
                                    <Mic className="h-5 w-5 mr-2 text-red-600 animate-pulse" />
                                    Stop & Submit
                                </>
                            ) : (
                                <>
                                    <Mic className="h-5 w-5 mr-2" />
                                    Record your answer
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            {recording
                                ? "Recording... Click Stop & Submit when done."
                                : "Click to start recording your response."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

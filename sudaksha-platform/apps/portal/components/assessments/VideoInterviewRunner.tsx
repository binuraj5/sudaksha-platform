"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Video, VideoOff, Loader2, AlertCircle, CheckCircle2, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

export interface VideoConfig {
    questionCount: number;
    maxDurationPerQuestion: number;
    retakesAllowed: number;
    competencyName: string;
    targetLevel: string;
}

interface VideoInterviewRunnerProps {
    userComponentId: string;
    questionId: string;
    videoConfig: VideoConfig;
    sectionName: string;
    onComplete: () => void;
}

type RecordingState = "idle" | "recording" | "processing" | "done";

export function VideoInterviewRunner({
    userComponentId,
    questionId,
    videoConfig,
    sectionName,
    onComplete,
}: VideoInterviewRunnerProps) {
    const { competencyName, targetLevel, questionCount, maxDurationPerQuestion, retakesAllowed } = videoConfig;

    // Session state
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Per-question state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [recordingState, setRecordingState] = useState<RecordingState>("idle");
    const [retakesUsed, setRetakesUsed] = useState(0);
    const [scores, setScores] = useState<Array<{ overall_score: number; feedback: string }>>([]);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // TTS state
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Media refs
    const mediaRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const isLastQuestion = currentQuestionIndex >= questionCount - 1;
    const currentQuestion = questions[currentQuestionIndex] ?? "";

    // Load AI-generated questions on mount
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/video/start-interview", {
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
                    const err = await res.json().catch(() => ({}));
                    throw new Error((err as { error?: string }).error || "Failed to load questions");
                }
                const data = await res.json();
                setSessionId(data.session_id);
                setQuestions(data.questions || []);
            } catch (e) {
                if (!cancelled) {
                    setError((e as Error).message);
                    toast.error("Could not load interview questions");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [competencyName, targetLevel, questionCount]);

    // Recording timer
    useEffect(() => {
        if (recordingState === "recording") {
            timerRef.current = setInterval(() => {
                setElapsedSeconds((s) => {
                    if (s >= maxDurationPerQuestion - 1) {
                        // Auto-stop at max duration
                        stopRecordingAndSubmit();
                        return s;
                    }
                    return s + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [recordingState]);

    // ── TTS helpers ──────────────────────────────────────────────────────────
    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    const speakText = useCallback(async (text: string) => {
        if (!text) return;
        stopAudio();
        setIsSpeaking(true);
        try {
            const res = await fetch("/api/ai/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();
            if (!data.audio) { setIsSpeaking(false); return; }
            const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
            audioRef.current = audio;
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => setIsSpeaking(false);
            await audio.play().catch(() => setIsSpeaking(false));
        } catch {
            setIsSpeaking(false);
        }
    }, [stopAudio]);

    // Auto-speak current question whenever it changes (and questions are loaded)
    useEffect(() => {
        if (loading || questions.length === 0) return;
        const q = questions[currentQuestionIndex];
        if (q) speakText(q);
        return stopAudio;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestionIndex, loading, questions.length]);

    const startRecording = useCallback(async () => {
        stopAudio(); // stop TTS before recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;

            // Show live preview
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
                videoPreviewRef.current.play();
            }

            const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" });
            mediaRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.start(1000); // Collect data every second
            setElapsedSeconds(0);
            setRecordingState("recording");
        } catch {
            toast.error("Camera/microphone access denied. Please allow access and try again.");
        }
    }, []);

    const stopRecordingAndSubmit = useCallback(() => {
        if (!mediaRef.current || recordingState !== "recording") return;

        setRecordingState("processing");

        if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }

        mediaRef.current.onstop = async () => {
            try {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });
                const fd = new FormData();
                fd.append("video", blob, "response.webm");
                fd.append("competencyName", competencyName);
                fd.append("targetLevel", targetLevel);

                const res = await fetch(`/api/video/analyze?competency_name=${encodeURIComponent(competencyName)}&target_level=${encodeURIComponent(targetLevel)}`, {
                    method: "POST",
                    body: fd,
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error((err as { error?: string }).error || "Video analysis failed");
                }
                const data = await res.json();

                const newScores = [
                    ...scores,
                    { overall_score: data.overall_score ?? 0, feedback: data.feedback ?? "" },
                ];
                setScores(newScores);

                if (isLastQuestion) {
                    const avgScore = newScores.reduce((sum, s) => sum + s.overall_score, 0) / newScores.length;

                    await fetch("/api/assessments/runner/response", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userComponentId,
                            questionId,
                            responseData: {
                                type: "VIDEO_INTERVIEW",
                                session_id: sessionId,
                                overall_score: avgScore,
                                content_score: data.content_score,
                                delivery_score: data.delivery_score,
                                visual_presence_score: data.visual_presence_score,
                                professionalism_score: data.professionalism_score,
                                feedback: data.feedback,
                                transcript: data.transcript,
                                questionCount,
                                strengths: data.strengths,
                                improvements: data.improvements,
                            },
                            maxPoints: 100,
                        }),
                    });

                    setRecordingState("done");
                    toast.success("Video interview completed! Great work.");
                    setTimeout(onComplete, 1500);
                } else {
                    setRecordingState("idle");
                    setRetakesUsed(0);
                    setCurrentQuestionIndex((i) => i + 1);
                    toast.success(`Question ${currentQuestionIndex + 1} submitted!`);
                }
            } catch (e) {
                toast.error((e as Error).message || "Video analysis failed. You can retake the recording.");
                setRecordingState("idle");
            }
        };

        mediaRef.current.stop();
    }, [recordingState, scores, isLastQuestion, userComponentId, questionId, sessionId, competencyName, targetLevel, questionCount, currentQuestionIndex, onComplete]);

    const handleRetake = () => {
        if (retakesUsed >= retakesAllowed) {
            toast.error(`No retakes remaining (${retakesAllowed} allowed)`);
            return;
        }
        setRetakesUsed((r) => r + 1);
        setRecordingState("idle");
        chunksRef.current = [];
    };

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? "0" : ""}${sec}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-muted-foreground font-medium">Setting up your video interview...</p>
                <p className="text-xs text-muted-foreground">AI is generating personalized questions</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">{error}</p>
                    </div>
                    <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (recordingState === "done") {
        return (
            <div className="max-w-2xl mx-auto py-8 space-y-6 text-center">
                <div className="inline-flex p-6 bg-green-100 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Interview Complete!</h2>
                <p className="text-muted-foreground">
                    Your responses have been analyzed. Results will be reviewed by the assessment team.
                </p>
            </div>
        );
    }

    const maxSecs = maxDurationPerQuestion;
    const progressPct = (elapsedSeconds / maxSecs) * 100;
    const timeRemaining = Math.max(0, maxSecs - elapsedSeconds);
    const isNearEnd = timeRemaining < 30 && recordingState === "recording";

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Question {currentQuestionIndex + 1} of {questionCount}</span>
                <div className="flex gap-1">
                    {Array.from({ length: questionCount }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 w-8 rounded-full transition-colors ${i < currentQuestionIndex
                                    ? "bg-green-500"
                                    : i === currentQuestionIndex
                                        ? "bg-blue-500"
                                        : "bg-gray-200"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Main question card */}
            <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Video className="h-5 w-5 text-blue-600" />
                        {sectionName}
                    </CardTitle>
                    {retakesAllowed > 0 && (
                        <Badge variant="outline" className="w-fit text-xs">
                            {Math.max(0, retakesAllowed - retakesUsed)} retake(s) remaining
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* Question */}
                    <div className="p-4 bg-white border-2 border-blue-100 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                                Interview Question
                            </p>
                            <button
                                onClick={() => isSpeaking ? stopAudio() : speakText(currentQuestion)}
                                className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
                                title={isSpeaking ? "Stop" : "Replay question"}
                                disabled={recordingState !== "idle"}
                            >
                                {isSpeaking ? (
                                    <><VolumeX className="h-4 w-4" /> Stop</>
                                ) : (
                                    <><Volume2 className="h-4 w-4" /> Replay</>
                                )}
                            </button>
                        </div>
                        {isSpeaking && (
                            <div className="flex items-center gap-1.5 mb-2">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-blue-400 rounded-full animate-bounce"
                                        style={{ height: "12px", animationDelay: `${i * 100}ms` }}
                                    />
                                ))}
                                <span className="text-xs text-blue-500 ml-1">Speaking...</span>
                            </div>
                        )}
                        <p className="font-semibold text-gray-900 text-lg leading-relaxed">
                            {currentQuestion}
                        </p>
                    </div>

                    {/* Live video preview */}
                    <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                        <video
                            ref={videoPreviewRef}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            autoPlay
                        />
                        {recordingState !== "recording" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                                <VideoOff className="h-12 w-12 mb-3" />
                                <p className="text-sm font-medium">
                                    {recordingState === "processing" ? "Processing your response..." : "Camera preview will appear when recording starts"}
                                </p>
                            </div>
                        )}
                        {recordingState === "recording" && (
                            <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                                REC {formatDuration(elapsedSeconds)}
                            </div>
                        )}
                        {recordingState === "processing" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                <div className="text-center space-y-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
                                    <p className="text-white font-medium">Analyzing your response...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timer progress */}
                    {recordingState === "recording" && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Recording time</span>
                                <span className={isNearEnd ? "text-red-600 font-bold" : ""}>
                                    {formatDuration(timeRemaining)} remaining
                                </span>
                            </div>
                            <Progress
                                value={progressPct}
                                className={`h-2 ${isNearEnd ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-500"}`}
                            />
                        </div>
                    )}

                    {/* Guidelines */}
                    {recordingState === "idle" && (
                        <div className="text-sm text-muted-foreground bg-blue-50 rounded-lg p-3 space-y-1">
                            <p className="font-medium text-blue-900">Before recording:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>The interviewer will read the question aloud — listen carefully</li>
                                <li>Find a quiet, well-lit environment</li>
                                <li>Ensure your camera and microphone are working</li>
                                <li>You have {formatDuration(maxSecs)} per response</li>
                                <li>Speak clearly and look at the camera</li>
                            </ul>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        {recordingState === "idle" && (
                            <Button size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={startRecording}>
                                <Video className="h-5 w-5 mr-2" />
                                Start Recording
                            </Button>
                        )}
                        {recordingState === "recording" && (
                            <>
                                <Button
                                    size="lg"
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={stopRecordingAndSubmit}
                                >
                                    <VideoOff className="h-5 w-5 mr-2" />
                                    Stop & Submit Answer
                                </Button>
                                {retakesUsed < retakesAllowed && (
                                    <Button size="lg" variant="outline" onClick={handleRetake}>
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                )}
                            </>
                        )}
                        {recordingState === "processing" && (
                            <Button size="lg" disabled className="flex-1">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Analyzing...
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

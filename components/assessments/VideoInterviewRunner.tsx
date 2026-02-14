"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Loader2 } from "lucide-react";
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

function getQuestionPrompt(competencyName: string, targetLevel: string, index: number): string {
    const prompts = [
        `Describe your experience with ${competencyName} at ${targetLevel} level.`,
        `Tell us about a specific situation where you demonstrated ${competencyName}.`,
        `How do you approach ${competencyName} in your work?`,
        `What challenges have you faced with ${competencyName}, and how did you overcome them?`,
        `Share an example of how you've grown in ${competencyName}.`,
    ];
    return prompts[index % prompts.length];
}

export function VideoInterviewRunner({
    userComponentId,
    questionId,
    videoConfig,
    sectionName,
    onComplete,
}: VideoInterviewRunnerProps) {
    const { competencyName, targetLevel, questionCount, maxDurationPerQuestion } = videoConfig;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [scores, setScores] = useState<Array<{ overall_score: number; feedback: string }>>([]);
    const mediaRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const currentQuestion = getQuestionPrompt(competencyName, targetLevel, currentQuestionIndex);
    const isLastQuestion = currentQuestionIndex >= questionCount - 1;

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
            toast.error("Camera/microphone access denied");
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
                const blob = new Blob(chunksRef.current, { type: "video/webm" });
                const fd = new FormData();
                fd.append("video", blob);
                fd.append("competencyName", competencyName);
                fd.append("targetLevel", targetLevel);

                const res = await fetch("/api/video/analyze", { method: "POST", body: fd });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || "Video analysis failed");
                }
                const data = await res.json();

                const newScores = [...scores, { overall_score: data.overall_score ?? 0, feedback: data.feedback ?? "" }];
                setScores(newScores);

                if (isLastQuestion) {
                    const avgScore = newScores.reduce((sum, s) => sum + s.overall_score, 0) / questionCount;

                    await fetch("/api/assessments/runner/response", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userComponentId,
                            questionId,
                            responseData: {
                                type: "VIDEO_INTERVIEW",
                                overall_score: avgScore,
                                content_score: data.content_score,
                                delivery_score: data.delivery_score,
                                visual_presence_score: data.visual_presence_score,
                                professionalism_score: data.professionalism_score,
                                feedback: data.feedback,
                                questionCount,
                            },
                            maxPoints: 100,
                        }),
                    });
                    toast.success("Video interview completed!");
                    onComplete();
                } else {
                    setCurrentQuestionIndex((i) => i + 1);
                }
            } catch (e) {
                toast.error((e as Error).message || "Video analysis failed. You can try recording again.");
            } finally {
                setProcessing(false);
            }
        };
        mediaRef.current.stop();
    };

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        {sectionName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Question {currentQuestionIndex + 1} of {questionCount}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="font-medium text-gray-900">{currentQuestion}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Max {Math.floor(maxDurationPerQuestion / 60)} min per response. Ensure good lighting and a quiet environment.
                    </p>
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
                                    Analyzing...
                                </>
                            ) : recording ? (
                                <>
                                    <Video className="h-5 w-5 mr-2 text-red-600 animate-pulse" />
                                    Stop & Submit
                                </>
                            ) : (
                                <>
                                    <Video className="h-5 w-5 mr-2" />
                                    Start recording
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

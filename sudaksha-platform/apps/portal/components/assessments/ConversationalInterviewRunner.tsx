"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, BrainCircuit, Loader2, PhoneOff } from "lucide-react";
import { toast } from "sonner";

export interface ConversationalConfig {
    questionCount: number;
    competencyName: string;
    targetLevel: string;
}

interface ConversationalInterviewRunnerProps {
    userComponentId: string;
    questionId: string;
    conversationalConfig: ConversationalConfig;
    sectionName: string;
    onComplete: () => void;
}

type ChatMessage = { speaker: "AI" | "USER"; text: string };
type AIMessage = { role: string; content: string };
type Phase = "loading" | "ready" | "listening" | "processing" | "evaluating" | "done" | "error";

export function ConversationalInterviewRunner({
    userComponentId,
    questionId,
    conversationalConfig,
    sectionName,
    onComplete,
}: ConversationalInterviewRunnerProps) {
    const { competencyName, targetLevel, questionCount } = conversationalConfig;

    // Conversation state
    const [phase, setPhase] = useState<Phase>("loading");
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [turnCount, setTurnCount] = useState(0); // number of completed user turns
    const [errorMsg, setErrorMsg] = useState("");

    // Recording refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Auto-scroll
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chat, phase]);

    // ── Step 1: On mount, fetch greeting + play it ──────────────────────────
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/ai/interview/start", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ competencyName, targetLevel, questionCount }),
                });
                if (cancelled) return;
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || "Failed to start interview");
                }
                const data = await res.json();
                setMessages(data.messages);
                setChat([{ speaker: "AI", text: data.greeting }]);
                await playAudio(data.audio);
                if (!cancelled) setPhase("ready");
            } catch (e) {
                if (!cancelled) {
                    setErrorMsg((e as Error).message);
                    setPhase("error");
                }
            }
        })();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Audio playback helper ────────────────────────────────────────────────
    const playAudio = (base64: string): Promise<void> =>
        new Promise((resolve) => {
            const audio = new Audio(`data:audio/mp3;base64,${base64}`);
            audio.onended = () => resolve();
            audio.onerror = () => resolve(); // don't block on audio errors
            audio.play().catch(() => resolve());
        });

    // ── Recording controls ───────────────────────────────────────────────────
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.start();
            setPhase("listening");
        } catch {
            toast.error("Microphone access denied. Please allow microphone access and try again.");
        }
    };

    const stopRecording = useCallback(() => {
        if (!mediaRecorderRef.current || phase !== "listening") return;
        setPhase("processing");

        mediaRecorderRef.current.onstop = handleUserAudio;
        mediaRecorderRef.current.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, messages, turnCount]);

    // ── Process user audio → AI response ────────────────────────────────────
    const handleUserAudio = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];

        try {
            const fd = new FormData();
            fd.append("audio", blob);
            fd.append("messages", JSON.stringify(messages));

            const res = await fetch("/api/ai/interview/process", { method: "POST", body: fd });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to process response");
            }
            const data = await res.json();
            const { userText, aiText, audio } = data;

            const newMessages: AIMessage[] = [
                ...messages,
                { role: "user", content: userText },
                { role: "assistant", content: aiText },
            ];
            setMessages(newMessages);
            setChat((prev) => [
                ...prev,
                { speaker: "USER", text: userText },
                { speaker: "AI", text: aiText },
            ]);

            const newTurn = turnCount + 1;
            setTurnCount(newTurn);

            // Play the AI response, then decide what's next
            await playAudio(audio);

            if (newTurn >= questionCount) {
                // All turns done — evaluate
                await evaluateAndSave(newMessages);
            } else {
                setPhase("ready");
            }
        } catch (e) {
            toast.error((e as Error).message || "Something went wrong. Please try again.");
            setPhase("ready");
        }
    };

    // ── Final evaluation + save ──────────────────────────────────────────────
    const evaluateAndSave = async (finalMessages: AIMessage[]) => {
        setPhase("evaluating");
        try {
            const evalRes = await fetch("/api/ai/interview/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ competencyName, targetLevel, transcript: finalMessages }),
            });
            const evalData = evalRes.ok
                ? await evalRes.json()
                : { overall_score: 70, content_quality: 70, communication_clarity: 70, confidence: 70, professionalism: 70, feedback: "Interview completed.", strengths: [], weaknesses: [] };

            // Build a readable transcript for storage
            const readableTranscript = finalMessages
                .filter((m) => m.role !== "system")
                .map((m) => `${m.role === "assistant" ? "INTERVIEWER" : "CANDIDATE"}: ${m.content}`)
                .join("\n\n");

            await fetch("/api/assessments/runner/response", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userComponentId,
                    questionId,
                    responseData: {
                        type: "CONVERSATIONAL_INTERVIEW",
                        transcript: readableTranscript,
                        overall_score: evalData.overall_score,
                        content_quality: evalData.content_quality,
                        communication_clarity: evalData.communication_clarity,
                        confidence: evalData.confidence,
                        professionalism: evalData.professionalism,
                        feedback: evalData.feedback,
                        strengths: evalData.strengths,
                        weaknesses: evalData.weaknesses,
                    },
                    maxPoints: 100,
                }),
            });

            setPhase("done");
            toast.success("Interview completed! Great job.");
            setTimeout(() => onComplete(), 1800);
        } catch (e) {
            toast.error("Failed to save results. Please contact support.");
            setPhase("ready");
        }
    };

    // ── Early-exit handler ───────────────────────────────────────────────────
    const handleEndEarly = async () => {
        if (turnCount === 0) {
            toast.error("Please answer at least one question before ending the interview.");
            return;
        }
        await evaluateAndSave(messages);
    };

    // ── Render ───────────────────────────────────────────────────────────────
    if (phase === "error") {
        return (
            <Card className="max-w-2xl mx-auto mt-8">
                <CardContent className="pt-6 space-y-4">
                    <p className="text-red-600 font-medium">{errorMsg}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
                </CardContent>
            </Card>
        );
    }

    const progressPercent = Math.round((turnCount / questionCount) * 100);

    return (
        <div className="max-w-3xl mx-auto py-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-200">
                        <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">{sectionName}</h2>
                        <p className="text-xs text-muted-foreground">
                            {competencyName} · {targetLevel}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <p className="text-sm font-semibold">{turnCount}/{questionCount} questions</p>
                    </div>
                    {phase === "loading" && <Badge className="bg-yellow-500 animate-pulse">Connecting...</Badge>}
                    {phase === "listening" && <Badge className="bg-red-500 animate-pulse">Recording</Badge>}
                    {(phase === "processing" || phase === "evaluating") && <Badge className="bg-blue-500 animate-pulse">AI Thinking...</Badge>}
                    {phase === "ready" && <Badge className="bg-green-500">Live</Badge>}
                    {phase === "done" && <Badge className="bg-gray-500">Complete</Badge>}
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Chat area */}
            <Card className="border-indigo-100 bg-gray-50/30">
                <CardContent className="p-0">
                    <ScrollArea className="h-[380px] px-6 py-4" ref={scrollRef}>
                        <div className="space-y-4">
                            {chat.map((msg, i) => (
                                <div key={i} className={`flex ${msg.speaker === "AI" ? "justify-start" : "justify-end"}`}>
                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                        msg.speaker === "AI"
                                            ? "bg-white border border-indigo-50 text-gray-900 rounded-tl-none"
                                            : "bg-indigo-600 text-white rounded-tr-none"
                                    }`}>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">
                                            {msg.speaker === "AI" ? "Interviewer" : "You"}
                                        </p>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {/* AI thinking dots */}
                            {(phase === "processing" || phase === "evaluating") && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-indigo-50 flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            )}

                            {/* Loading state */}
                            {phase === "loading" && chat.length === 0 && (
                                <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm">Preparing your interviewer...</span>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Controls */}
            <Card>
                <CardContent className="py-5 flex flex-col items-center gap-4">
                    {/* Audio visualizer */}
                    <div className="flex items-end gap-0.5 h-10">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-1 rounded-full transition-all duration-150 ${
                                    phase === "listening" ? "bg-red-400" : "bg-indigo-300"
                                }`}
                                style={{
                                    height: phase === "listening"
                                        ? `${Math.sin(i * 0.7 + Date.now() * 0.01) * 15 + 20}px`
                                        : "4px",
                                    opacity: phase === "listening" ? 1 : 0.3,
                                }}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Main mic button */}
                        <Button
                            size="lg"
                            className={`w-16 h-16 rounded-full shadow-lg transition-all duration-200 ${
                                phase === "listening"
                                    ? "bg-red-500 hover:bg-red-600 scale-110 ring-4 ring-red-200"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                            onClick={phase === "listening" ? stopRecording : startRecording}
                            disabled={phase !== "ready" && phase !== "listening"}
                        >
                            {phase === "listening" ? (
                                <MicOff className="h-6 w-6" />
                            ) : (
                                <Mic className="h-6 w-6" />
                            )}
                        </Button>

                        {/* End early */}
                        {phase !== "loading" && phase !== "done" && turnCount > 0 && (
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-12 w-12 rounded-full border-2 border-red-200 text-red-500 hover:bg-red-50"
                                onClick={handleEndEarly}
                                disabled={phase === "processing" || phase === "evaluating"}
                                title="End interview early"
                            >
                                <PhoneOff className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        {phase === "loading" && "Setting up your interview..."}
                        {phase === "ready" && "Click the microphone to speak your answer"}
                        {phase === "listening" && "Listening... Click to stop when finished"}
                        {phase === "processing" && "Processing your response..."}
                        {phase === "evaluating" && "Evaluating your interview results..."}
                        {phase === "done" && "Interview complete! Saving your results..."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

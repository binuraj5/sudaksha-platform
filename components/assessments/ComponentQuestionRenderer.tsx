"use client";

import React, { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mic, Loader2, Play, Terminal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface RunnerQuestion {
    id: string;
    questionText: string;
    questionType: string;
    options?: unknown;
    correctAnswer?: string | null;
    points?: number;
    timeLimit?: number | null;
    metadata?: Record<string, unknown> | null;
}

interface ComponentQuestionRendererProps {
    question: RunnerQuestion;
    value: unknown;
    onChange: (value: unknown) => void;
    onSave?: (questionId: string, responseData: unknown) => void;
    disabled?: boolean;
}

function parseOptions(opts: unknown): { text: string; isCorrect?: boolean; order?: number }[] {
    if (Array.isArray(opts)) {
        return opts.map((o) =>
            typeof o === "string" ? { text: o } : { text: (o as { text?: string }).text ?? String(o), isCorrect: (o as { isCorrect?: boolean }).isCorrect, order: (o as { order?: number }).order }
        );
    }
    if (opts && typeof opts === "object" && "options" in (opts as object)) {
        return parseOptions((opts as { options: unknown }).options);
    }
    return [];
}

export function ComponentQuestionRenderer({
    question,
    value,
    onChange,
    onSave,
    disabled = false,
}: ComponentQuestionRendererProps) {
    const handleChange = useCallback(
        (v: unknown) => {
            onChange(v);
            onSave?.(question.id, v);
        },
        [onChange, onSave, question.id]
    );

    const options = parseOptions(question.options ?? []);

    if (question.questionType === "SCENARIO_BASED") {
        const scenarioText =
            (question.metadata as { scenario?: string } | null)?.scenario ?? question.questionText;
        const scenarioOptions = options.length ? options : parseOptions((question.metadata as { options?: unknown })?.options ?? []);
        return (
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit text-blue-600 border-blue-200 bg-blue-50">
                        Scenario
                    </Badge>
                    <CardTitle className="text-base font-normal text-gray-700 whitespace-pre-wrap">
                        {scenarioText}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    <p className="text-sm font-medium text-gray-600 mb-3">How would you respond?</p>
                    <RadioGroup
                        value={value as string}
                        onValueChange={(v) => handleChange(v)}
                        className="space-y-3"
                        disabled={disabled}
                    >
                        {scenarioOptions.map((opt, idx) => (
                            <div
                                key={idx}
                                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <RadioGroupItem value={opt.text} id={`q-${question.id}-${idx}`} />
                                <Label
                                    htmlFor={`q-${question.id}-${idx}`}
                                    className="flex-1 cursor-pointer font-normal text-base"
                                >
                                    {opt.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>
        );
    }

    if (question.questionType === "MULTIPLE_CHOICE" || question.questionType === "MULTIPLE_SELECT") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-normal">{question.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={value as string}
                        onValueChange={(v) => handleChange(v)}
                        className="space-y-3"
                        disabled={disabled}
                    >
                        {options.map((opt, idx) => (
                            <div
                                key={idx}
                                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <RadioGroupItem value={opt.text} id={`q-${question.id}-${idx}`} />
                                <Label
                                    htmlFor={`q-${question.id}-${idx}`}
                                    className="flex-1 cursor-pointer font-normal text-base"
                                >
                                    {opt.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>
        );
    }

    if (question.questionType === "TRUE_FALSE") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-normal">{question.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={value as string}
                        onValueChange={(v) => handleChange(v)}
                        className="space-y-3"
                        disabled={disabled}
                    >
                        <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 cursor-pointer">
                            <RadioGroupItem value="true" id={`q-${question.id}-true`} />
                            <Label htmlFor={`q-${question.id}-true`} className="flex-1 cursor-pointer font-normal">
                                True
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 cursor-pointer">
                            <RadioGroupItem value="false" id={`q-${question.id}-false`} />
                            <Label htmlFor={`q-${question.id}-false`} className="flex-1 cursor-pointer font-normal">
                                False
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
        );
    }

    if (question.questionType === "ESSAY" || question.questionType === "SHORT_ANSWER") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-normal">{question.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Type your answer here..."
                        className="min-h-[120px] resize-none"
                        value={(value as string) ?? ""}
                        onChange={(e) => handleChange(e.target.value)}
                        disabled={disabled}
                    />
                </CardContent>
            </Card>
        );
    }

    if (question.questionType === "CODING_CHALLENGE") {
        return (
            <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                    <Badge variant="outline" className="w-fit text-amber-600 border-amber-200 bg-amber-50">
                        Coding
                    </Badge>
                    <CardTitle className="text-base font-normal">{question.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CodingChallengeBlock
                        questionId={question.id}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        metadata={question.metadata}
                    />
                </CardContent>
            </Card>
        );
    }

    if (question.questionType === "VOICE_RESPONSE" || question.questionType === "VIDEO_RESPONSE") {
        return (
            <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                    <Badge variant="outline" className="w-fit text-purple-600 border-purple-200 bg-purple-50">
                        {question.questionType === "VIDEO_RESPONSE" ? "Video" : "Voice"} response
                    </Badge>
                    <CardTitle className="text-base font-normal">{question.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                    <VoiceResponseBlock
                        questionId={question.id}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-normal">{question.questionText}</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Your answer..."
                    className="min-h-[100px] resize-none"
                    value={(value as string) ?? ""}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={disabled}
                />
            </CardContent>
        </Card>
    );
}

function CodingChallengeBlock({
    questionId,
    value,
    onChange,
    disabled,
    metadata,
}: {
    questionId: string;
    value: unknown;
    onChange: (v: unknown) => void;
    disabled?: boolean;
    metadata?: Record<string, unknown> | null;
}) {
    const stored = (value && typeof value === "object" && "code" in value) ? (value as { code?: string; language?: string; runResult?: unknown }) : null;
    const [code, setCode] = React.useState(stored?.code ?? (metadata as { starterCode?: string })?.starterCode ?? "// Write your solution here\n");
    const [language, setLanguage] = React.useState(stored?.language ?? "javascript");
    const [runResult, setRunResult] = React.useState<unknown>(stored?.runResult ?? null);
    const [running, setRunning] = React.useState(false);

    const persist = React.useCallback(
        (c: string, lang: string, result: unknown) => {
            const payload = { code: c, language: lang, runResult: result };
            onChange(payload);
        },
        [onChange]
    );

    const handleRun = async () => {
        setRunning(true);
        try {
            const res = await fetch("/api/assessments/code/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language, problemId: questionId }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setRunResult(data);
            persist(code, language, data);
            const passed = data.allPassed ?? (data.passed === (data.testCases?.length ?? 0));
            toast.info(passed ? "All tests passed" : "Some tests failed");
        } catch (e) {
            toast.error("Run failed");
            setRunResult({ error: String(e) });
            persist(code, language, { error: String(e) });
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
                <Select value={language} onValueChange={(v) => { setLanguage(v); persist(code, v, runResult); }}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                    </SelectContent>
                </Select>
                <Button type="button" size="sm" variant="outline" onClick={handleRun} disabled={disabled || running}>
                    {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Run tests
                </Button>
            </div>
            <textarea
                className="w-full min-h-[200px] p-4 font-mono text-sm bg-slate-900 text-slate-200 rounded-lg border border-slate-700 resize-y"
                value={code}
                onChange={(e) => {
                    setCode(e.target.value);
                    persist(e.target.value, language, runResult);
                }}
                disabled={disabled}
                spellCheck={false}
            />
            {runResult && typeof runResult === "object" && !("error" in runResult) ? (
                <div className="rounded-lg border bg-slate-50 p-3 space-y-2">
                    <div className="flex items-center gap-2 font-medium text-sm">
                        <Terminal className="h-4 w-4" />
                        Test results
                    </div>
                    <div className="text-xs space-y-1">
                        {"passed" in (runResult as object) && (
                            <p>
                                Passed: {(runResult as { passed?: number }).passed} / {(runResult as { testCases?: unknown[] }).testCases?.length ?? 0}
                            </p>
                        )}
                        {Array.isArray((runResult as { testCases?: unknown[] }).testCases) &&
                            (runResult as { testCases: { passed?: boolean; input?: string; output?: string }[] }).testCases.map((tc: { passed?: boolean; input?: string; output?: string }, i: number) => (
                                <div
                                    key={i}
                                    className={`p-2 rounded ${tc.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                    Case {i + 1}: {tc.passed ? "Passed" : "Failed"}
                                    {tc.output != null && ` — ${String(tc.output).slice(0, 60)}`}
                                </div>
                            ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function VoiceResponseBlock({
    questionId,
    value,
    onChange,
    disabled,
}: {
    questionId: string;
    value: unknown;
    onChange: (v: unknown) => void;
    disabled?: boolean;
}) {
    const [recording, setRecording] = React.useState(false);
    const [processing, setProcessing] = React.useState(false);
    const mediaRef = React.useRef<MediaRecorder | null>(null);
    const chunksRef = React.useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRef.current = recorder;
            chunksRef.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                setProcessing(true);
                try {
                    const fd = new FormData();
                    fd.append("audio", blob);
                    const res = await fetch("/api/ai/transcribe", { method: "POST", body: fd });
                    const data = await res.json();
                    const transcript = data.text ?? data.transcript ?? (data.error ? "" : "[Transcription unavailable]");
                    if (data.error && !transcript) {
                        toast.error("Transcription failed. Ensure OPENAI_API_KEY is set for voice.");
                    }
                    onChange({ transcript, recordedAt: new Date().toISOString() });
                } catch (e) {
                    toast.error("Transcription failed. You can type your answer instead.");
                    onChange({ transcript: "", error: "Transcription failed" });
                } finally {
                    setProcessing(false);
                }
            };
            recorder.start();
            setRecording(true);
        } catch (e) {
            toast.error("Microphone access denied");
        }
    };

    const stopRecording = () => {
        if (mediaRef.current && recording) {
            mediaRef.current.stop();
            setRecording(false);
        }
    };

    const transcript = (value && typeof value === "object" && "transcript" in value)
        ? (value as { transcript?: string }).transcript
        : "";

    return (
        <div className="space-y-3">
            {!transcript ? (
                <div className="flex flex-col gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-fit"
                        onClick={recording ? stopRecording : startRecording}
                        disabled={disabled || processing}
                    >
                        {processing ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Mic className={`h-4 w-4 mr-2 ${recording ? "text-red-600" : ""}`} />
                        )}
                        {recording ? "Stop recording" : "Record your answer"}
                    </Button>
                    <p className="text-xs text-gray-500">Record your voice; we will transcribe it for scoring.</p>
                </div>
            ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    <p className="font-medium text-gray-500 mb-1">Transcription:</p>
                    <p className="whitespace-pre-wrap">{transcript}</p>
                </div>
            )}
        </div>
    );
}

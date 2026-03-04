
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, MicOff, PhoneOff, Shield, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export const AIInterviewInterface: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState<{ speaker: 'AI' | 'USER', text: string }[]>([
        { speaker: 'AI', text: "Hello! I'm your AI interviewer today. Are you ready to begin the behavioral assessment for the Senior Software Engineer role?" }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // AI Context
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([
        { role: "system", content: "You are an expert technical interviewer for a Senior Software Engineer role. Conduct a behavioral interview. Be professional, concise, and probing. Keep responses relatively short (under 3 sentences) to maintain a conversational flow." },
        { role: "assistant", content: "Hello! I'm your AI interviewer today. Are you ready to begin the behavioral assessment for the Senior Software Engineer role?" }
    ]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = handleRecordingStop;
            mediaRecorder.start();
            setIsListening(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Could not access microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleRecordingStop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processInterviewInteraction(audioBlob);
    };

    const processInterviewInteraction = async (audioBlob: Blob) => {
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append("audio", audioBlob);
            formData.append("messages", JSON.stringify(messages));

            const response = await fetch("/api/ai/interview/process", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to process interview");
            }

            const data = await response.json();
            const { userText, aiText, audio } = data;

            // Update UI with User text
            setTranscript(prev => [...prev, { speaker: 'USER', text: userText }]);

            // Update Context
            const newMessages = [
                ...messages,
                { role: "user", content: userText },
                { role: "assistant", content: aiText }
            ];
            setMessages(newMessages);

            // Update UI with AI text and play audio
            setTranscript(prev => [...prev, { speaker: 'AI', text: aiText }]);

            // Play Audio
            const audioObj = new Audio(`data:audio/mp3;base64,${audio}`);
            audioObj.play();

        } catch (error) {
            console.error("Interview processing error:", error);
            toast.error("Failed to process your response. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const endInterview = () => {
        toast.success("Interview completed! Generating analysis...");
        // Logic to save final state can go here
    };

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex gap-6">
            {/* Left: Interview Area */}
            <div className="flex-1 flex flex-col gap-6">
                <Card className="flex-1 flex flex-col bg-gray-50/50 overflow-hidden relative border-2 border-indigo-100">
                    <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-red-500 animate-pulse">LIVE SESSION</Badge>
                    </div>

                    <CardHeader className="bg-white border-b">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <BrainCircuit className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle>AI Behavioral Interview</CardTitle>
                                <CardDescription>Behavioral Assessment \u2022 Senior Software Engineer</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-6 flex flex-col">
                        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                            <div className="space-y-6">
                                {transcript.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.speaker === 'AI'
                                            ? 'bg-white border border-indigo-50 text-indigo-900 rounded-tl-none'
                                            : 'bg-indigo-600 text-white rounded-tr-none'
                                            }`}>
                                            <p className="text-sm font-semibold mb-1 opacity-70 uppercase tracking-wider">{msg.speaker}</p>
                                            <p className="text-base leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isProcessing && (
                                    <div className="flex justify-start">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50 flex gap-2">
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="mt-6 flex flex-col items-center gap-6">
                            {/* Visualizer Mock */}
                            <div className="flex items-center gap-1 h-12">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1].map((h, i) => (
                                    <div key={i}
                                        className={`w-1 rounded-full bg-indigo-400 transition-all duration-300 ${isListening ? 'animate-pulse' : 'opacity-20'}`}
                                        style={{ height: isListening ? `${Math.random() * 40 + 10}px` : '4px' }}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    size="lg"
                                    className={`w-20 h-20 rounded-full shadow-xl transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    onClick={toggleListening}
                                >
                                    {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                                </Button>
                                <Button size="lg" variant="outline" className="h-16 w-16 rounded-full border-2 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={endInterview}>
                                    <PhoneOff className="h-6 w-6" />
                                </Button>
                            </div>
                            <p className="text-sm font-medium text-gray-400">
                                {isListening ? 'I am listening... speak now' : 'Click the microphone to answer'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Technical/Status Info */}
            <div className="w-80 flex flex-col gap-6">
                <Card className="border-indigo-100 bg-indigo-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Shield className="h-4 w-4 text-indigo-600" />
                            Security & Integrity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Camera Access</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">Verifed</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Audio Quality</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">Stable</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Identity Check</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">SudakPass OK</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex-1 overflow-hidden">
                    <CardHeader className="bg-gray-50 py-3 border-b">
                        <CardTitle className="text-sm">Competencies Evaluated</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {[
                                { name: 'Leadership', progress: 40 },
                                { name: 'Conflict Resolution', progress: 10 },
                                { name: 'Systems Design', progress: 0 },
                                { name: 'Tech Communication', progress: 60 }
                            ].map((c, i) => (
                                <div key={i} className="p-4 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold">{c.name}</span>
                                        <span className="text-gray-400">{c.progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 transition-all" style={{ width: `${c.progress}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

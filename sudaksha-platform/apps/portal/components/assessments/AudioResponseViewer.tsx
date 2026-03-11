"use client";

import { Card } from "@/components/ui/card";
import { Headphones } from "lucide-react";

interface AudioResponseViewerProps {
    audioUrl: string;
    transcript?: string;
    duration?: number;
}

export function AudioResponseViewer({ audioUrl, transcript, duration }: AudioResponseViewerProps) {
    if (!audioUrl) return null;

    const formatSeconds = (seconds?: number) => {
        if (!seconds) return "—";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <Headphones className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Audio Response</h4>
                {duration && <span className="text-xs text-gray-500 ml-auto">{formatSeconds(duration)}</span>}
            </div>

            {/* Audio Player */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <audio
                    src={audioUrl}
                    controls
                    className="w-full h-9"
                    controlsList="nodownload"
                />
                <div className="mt-2 text-xs text-purple-600 text-center">
                    Audio playback available
                </div>
            </div>

            {/* Transcript */}
            {transcript && (
                <div className="space-y-2">
                    <h5 className="text-sm font-semibold text-gray-900">Transcript</h5>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm max-h-48 overflow-auto">
                        <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

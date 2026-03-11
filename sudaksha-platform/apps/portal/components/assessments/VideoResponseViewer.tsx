"use client";

import { Card } from "@/components/ui/card";
import { Video } from "lucide-react";
import { useState } from "react";

interface VideoResponseViewerProps {
    videoUrl: string;
    thumbnail?: string;
    duration?: number;
}

export function VideoResponseViewer({ videoUrl, thumbnail, duration }: VideoResponseViewerProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    if (!videoUrl) return null;

    const formatSeconds = (seconds?: number) => {
        if (!seconds) return "—";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <Video className="h-4 w-4 text-indigo-600" />
                <h4 className="font-semibold text-gray-900">Video Response</h4>
                {duration && <span className="text-xs text-gray-500 ml-auto">{formatSeconds(duration)}</span>}
            </div>

            {/* Video Player */}
            <div className="bg-indigo-50 rounded-lg overflow-hidden border border-indigo-200">
                <video
                    src={videoUrl}
                    controls
                    poster={thumbnail}
                    className="w-full max-h-96"
                    controlsList="nodownload"
                />
                <div className="p-4 text-xs text-indigo-600 text-center bg-indigo-50">
                    Video playback available • Interview recording
                </div>
            </div>

            {/* Video Info */}
            <div className="text-xs text-gray-500">
                <p>Interview responses can be reviewed for behavioral assessment, communication skills, and other qualitative measures.</p>
            </div>
        </div>
    );
}

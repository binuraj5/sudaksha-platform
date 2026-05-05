"use client";

import { useEffect, useState } from "react";
import { Radar, Loader2, ArrowRight } from "lucide-react";

interface Signal {
    timeframe: "6 months" | "18 months" | "3 years" | string;
    urgency: "opportunity" | "caution" | "watch" | string;
    headline: string;
    insight: string;
}

const borderColors: Record<string, string> = {
    opportunity: "border-l-green-500",
    caution: "border-l-amber-500",
    watch: "border-l-violet-500"
};

const bgColors: Record<string, string> = {
    opportunity: "bg-green-50 text-green-700",
    caution: "bg-amber-50 text-amber-700",
    watch: "bg-violet-50 text-violet-700"
};

export function FutureIntelligence({ memberId }: { memberId: string }) {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!memberId) return;

        fetch("/api/career/future-signals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId })
        })
            .then(res => res.json())
            .then(data => {
                if (data.signals && Array.isArray(data.signals)) {
                    setSignals(data.signals);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [memberId]);

    if (loading) {
        return <FutureIntelligenceSkeleton />;
    }

    if (signals.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Radar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 leading-none">Future Intelligence</h3>
                    <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wider mt-1">Market Signals</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {signals.map((signal, idx) => {
                    const normalizedUrgency = signal.urgency.toLowerCase();
                    const borderClass = borderColors[normalizedUrgency] || "border-l-gray-500";
                    const bgClass = bgColors[normalizedUrgency] || "bg-gray-50 text-gray-700";

                    return (
                        <div key={idx} className={`border border-gray-100 rounded-lg p-4 border-l-4 ${borderClass} bg-white shadow-sm flex flex-col justify-between`}>
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${bgClass}`}>
                                        {signal.urgency}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">{signal.timeframe}</span>
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{signal.headline}</h4>
                                <p className="text-xs text-gray-600 line-clamp-3 mb-3">{signal.insight}</p>
                            </div>
                            
                            <button className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors self-start">
                                Learn more <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function FutureIntelligenceSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 animate-pulse">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="border border-gray-100 rounded-lg p-4 h-32 bg-gray-50" />
                ))}
            </div>
        </div>
    );
}

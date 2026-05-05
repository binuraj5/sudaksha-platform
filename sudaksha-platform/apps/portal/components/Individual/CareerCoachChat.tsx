"use client";

/**
 * CareerCoachChat — AI career coach chat panel
 * SEPL/INT/2026/IMPL-STEPS-01 Step 21
 *
 * Provides contextual AI career coaching utilizing the Anthropic Claude API.
 * Token guard: restricts to 3 exchanges before requiring a reset.
 */

import { useState } from "react";
import { Send, Sparkles, Loader2, RefreshCw } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const SUGGESTED_PROMPTS = [
    "What should I focus on learning next?",
    "How can I improve my lowest competency?",
    "Which career path fits me best?",
];

export function CareerCoachChat({ memberId }: { memberId: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm your AI career coach. Based on your assessment profile, how can I help you grow today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Limit exchanges to 3 to prevent runaway token usage
    const userMessageCount = messages.filter(m => m.role === "user").length;
    const maxExchangesReached = userMessageCount >= 3;

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading || maxExchangesReached) return;

        const newMessages = [...messages, { role: "user" as const, content: text }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`/api/career/coach`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    memberId,
                    message: text,
                    // Pass history excluding the initial greeting, limited to last 4
                    conversationHistory: newMessages.slice(1, -1),
                })
            });
            const data = await res.json();
            
            if (data.response) {
                setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
            } else if (data.error) {
                 setMessages(prev => [...prev, { role: "assistant", content: "I encountered an error connecting to the coaching system." }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: "assistant", content: "I encountered a network error. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    const resetChat = () => {
        setMessages([{ role: "assistant", content: "Hi! I'm your AI career coach. Let's start a new conversation. What's on your mind?" }]);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-indigo-600 rounded-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-indigo-900 leading-none">AI Career Coach</h3>
                    <p className="text-[10px] text-indigo-600 font-medium uppercase tracking-wider mt-1">Beta</p>
                </div>
            </div>

            <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
                {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`text-sm px-4 py-2.5 rounded-2xl max-w-[85%] ${
                            m.role === "user" 
                                ? "bg-indigo-600 text-white rounded-tr-sm" 
                                : "bg-white border border-indigo-100 text-gray-800 rounded-tl-sm shadow-sm"
                        }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-indigo-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                        </div>
                    </div>
                )}
            </div>

            {messages.length === 1 && !loading && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => sendMessage(prompt)}
                            className="text-xs bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors text-left"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {maxExchangesReached ? (
                <div className="flex flex-col items-center justify-center p-3 border-t border-indigo-100/50 mt-2">
                    <p className="text-xs text-indigo-400 mb-3">Conversation limit reached for this session.</p>
                    <button 
                        onClick={resetChat} 
                        className="flex items-center gap-2 text-xs font-medium border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
                    >
                        <RefreshCw className="h-3 w-3" /> Start a new conversation
                    </button>
                </div>
            ) : (
                <form 
                    onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                    className="flex items-center gap-2 relative mt-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your career progression..."
                        disabled={loading}
                        className="flex-1 bg-white border border-indigo-200 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 transition-shadow"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || loading}
                        className="absolute right-1 top-1 bottom-1 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </form>
            )}
        </div>
    );
}

export function CareerCoachChatSkeleton() {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm p-5 animate-pulse">
            <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 bg-indigo-200 rounded-lg" />
                <div className="h-5 w-32 bg-indigo-200 rounded" />
            </div>
            <div className="space-y-4 mb-4">
                <div className="flex justify-start"><div className="h-10 w-2/3 bg-white rounded-2xl" /></div>
            </div>
            <div className="h-10 w-full bg-white rounded-full mt-6" />
        </div>
    );
}

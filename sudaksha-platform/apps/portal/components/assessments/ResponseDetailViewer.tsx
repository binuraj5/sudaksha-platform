"use client";

import { Badge } from "@/components/ui/badge";

interface ResponseDetailViewerProps {
    question: any;
    response: any;
}

export function ResponseDetailViewer({ question, response }: ResponseDetailViewerProps) {
    const responseData = response?.responseData;
    const questionType = question?.questionType || "TEXT";

    if (!responseData) {
        return null;
    }

    return (
        <div className="space-y-3">
            {/* Multiple Choice */}
            {(questionType === "MULTIPLE_CHOICE" || questionType === "SINGLE_SELECT") && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Options</h4>
                    {Array.isArray(question?.options) && (
                        <div className="space-y-2">
                            {question.options.map((option: any, idx: number) => {
                                const isSelected = Array.isArray(responseData.selectedOptions)
                                    ? responseData.selectedOptions.includes(option)
                                    : responseData.selectedOptions === option;
                                const isCorrect = Array.isArray(question?.correctAnswer)
                                    ? question.correctAnswer.includes(option)
                                    : question.correctAnswer === option;

                                return (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div
                                            className={`flex-shrink-0 h-5 w-5 mt-1 rounded border flex items-center justify-center font-bold text-sm ${
                                                isSelected
                                                    ? isCorrect
                                                        ? "bg-green-500 border-green-500 text-white"
                                                        : "bg-red-500 border-red-500 text-white"
                                                    : isCorrect
                                                      ? "bg-green-50 border-green-300"
                                                      : "border-gray-300"
                                            }`}
                                        >
                                            {isSelected && "✓"}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700">{option}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Short Text / Essay */}
            {(questionType === "TEXT" || questionType === "ESSAY") && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Answer</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 font-mono text-sm max-h-48 overflow-auto">
                        <p className="text-gray-800 whitespace-pre-wrap">{responseData.answer || responseData.text || "—"}</p>
                    </div>
                </div>
            )}

            {/* Matching */}
            {questionType === "MATCHING" && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Matches</h4>
                    <div className="space-y-1 text-sm">
                        {responseData.matches &&
                            Object.entries(responseData.matches).map(([key, value]: [string, any]) => (
                                <div key={key} className="flex justify-between gap-4 p-2 bg-gray-50 rounded">
                                    <span className="font-mono text-gray-700">{key}</span>
                                    <span className="text-gray-600">→</span>
                                    <span className="font-mono text-gray-700">{value}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Fill in the Blank */}
            {questionType === "FILL_IN_BLANK" && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Answer</h4>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm font-mono">
                        {responseData.answer || "—"}
                    </div>
                </div>
            )}

            {/* Ranking */}
            {questionType === "RANKING" && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Ranking</h4>
                    <ol className="space-y-1">
                        {responseData.ranking &&
                            responseData.ranking.map((item: string, idx: number) => (
                                <li key={idx} className="flex gap-3 items-center text-sm">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-1 font-bold">
                                        {idx + 1}
                                    </span>
                                    <span className="text-gray-700">{item}</span>
                                </li>
                            ))}
                    </ol>
                </div>
            )}

            {/* Rating */}
            {questionType === "RATING" && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Rating</h4>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((idx) => (
                            <div
                                key={idx}
                                className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                                    idx <= (responseData.rating || 0)
                                        ? "bg-yellow-400 text-white"
                                        : "bg-gray-100 text-gray-300"
                                }`}
                            >
                                ★
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600">
                        {responseData.rating} out of {responseData.maxRating || 5}
                    </p>
                </div>
            )}
        </div>
    );
}

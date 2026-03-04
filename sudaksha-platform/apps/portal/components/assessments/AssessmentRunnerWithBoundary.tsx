"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AssessmentRunner } from "./AssessmentRunner";

interface Props {
    userAssessment: unknown;
}

export function AssessmentRunnerWithBoundary({ userAssessment }: Props) {
    return (
        <ErrorBoundary
            fallback={({ error, reset }) => (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment error</h2>
                        <p className="text-gray-600 mb-6">
                            {error?.message || "Something went wrong. You can try again or return to the dashboard."}
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={reset}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Try again
                            </button>
                            <a
                                href="/assessments/individuals/dashboard"
                                className="text-sm text-gray-600 hover:underline"
                            >
                                Return to dashboard
                            </a>
                        </div>
                    </div>
                </div>
            )}
        >
            <AssessmentRunner userAssessment={userAssessment} />
        </ErrorBoundary>
    );
}

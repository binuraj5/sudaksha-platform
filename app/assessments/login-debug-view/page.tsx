"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft } from "lucide-react";

export default function LoginDebugViewPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/login-debug")
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-gray-600">Loading debug data…</p>
      </div>
    );
  }

  const isSuccess = data && typeof data.success === "boolean" && data.success;
  const hasMessage = data && "message" in data && data.message;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/assessments/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div
          className={`rounded-xl border-2 p-6 ${
            isSuccess
              ? "border-green-500 bg-green-50"
              : hasMessage && (data?.message as string)?.includes("No debug")
                ? "border-gray-300 bg-white"
                : "border-red-500 bg-red-50"
          }`}
        >
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Login debug result
          </h1>
          {typeof data?.message === "string" && (
            <p className="text-gray-700 mb-4">{data.message}</p>
          )}
          {data && "success" in data && (
            <p
              className={`font-semibold mb-4 ${
                data.success ? "text-green-700" : "text-red-700"
              }`}
            >
              Auth: {data.success ? "SUCCESS" : "FAILURE"}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Full payload
          </h2>
          <pre className="text-xs md:text-sm text-left overflow-auto max-h-[70vh] p-4 bg-gray-900 text-gray-100 rounded-lg font-mono whitespace-pre-wrap break-all">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

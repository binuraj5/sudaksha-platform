"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
    ssr: false,
    loading: () => (
        <div className="w-full min-h-[200px] p-4 font-mono text-sm bg-slate-900 text-slate-200 rounded-lg border border-slate-700 animate-pulse">
            Loading editor...
        </div>
    ),
});

const LANGUAGE_MAP: Record<string, string> = {
    javascript: "javascript",
    python: "python",
    cpp: "cpp",
    "c++": "cpp",
    java: "java",
    typescript: "typescript",
};

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    disabled?: boolean;
    height?: string | number;
}

export function CodeEditor({
    value,
    onChange,
    language = "javascript",
    disabled = false,
    height = 240,
}: CodeEditorProps) {
    const monacoLang = LANGUAGE_MAP[language.toLowerCase()] ?? "plaintext";

    const handleChange = useCallback(
        (val: string | undefined) => {
            onChange(val ?? "");
        },
        [onChange]
    );

    return (
        <MonacoEditor
            height={height}
            language={monacoLang}
            value={value}
            onChange={handleChange}
            theme="vs-dark"
            options={{
                readOnly: disabled,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 12 },
            }}
            loading={null}
        />
    );
}

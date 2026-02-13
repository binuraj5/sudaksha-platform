import { NextRequest, NextResponse } from "next/server";

const PISTON_EXECUTE_URL = "https://emkc.org/api/v2/piston/execute";

// Map UI language identifiers to Piston runtime names and file extensions
const LANGUAGE_MAP: Record<string, { name: string; version: string; ext: string }> = {
    javascript: { name: "javascript", version: "*", ext: "js" },
    js: { name: "javascript", version: "*", ext: "js" },
    typescript: { name: "typescript", version: "*", ext: "ts" },
    python: { name: "python", version: "*", ext: "py" },
    python3: { name: "python", version: "*", ext: "py" },
    cpp: { name: "c++", version: "*", ext: "cpp" },
    "c++": { name: "c++", version: "*", ext: "cpp" },
    java: { name: "java", version: "*", ext: "java" },
    csharp: { name: "csharp", version: "*", ext: "cs" },
    go: { name: "go", version: "*", ext: "go" },
    ruby: { name: "ruby", version: "*", ext: "rb" },
    rust: { name: "rust", version: "*", ext: "rs" },
};

export interface TestCaseInput {
    input?: string;
    expectedOutput?: string;
    expected?: string;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            code,
            language = "javascript",
            problemId,
            testCases = [] as TestCaseInput[],
        } = body;

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid 'code'" },
                { status: 400 }
            );
        }

        const langKey = language.toLowerCase().replace(/\s+/g, "");
        const runtime = LANGUAGE_MAP[langKey] ?? LANGUAGE_MAP.javascript;
        const fileName = `main.${runtime.ext}`;

        // If no test cases provided, run once with no stdin (simulation-style behavior)
        const casesToRun =
            testCases.length > 0
                ? testCases.map((tc: TestCaseInput) => ({
                      input: (tc.input ?? "").trim(),
                      expected: (tc.expectedOutput ?? tc.expected ?? "").trim(),
                  }))
                : [{ input: "", expected: "" }];

        const results: { input: string; output: string; expected: string; passed: boolean }[] = [];
        let allPassed = true;

        for (const tc of casesToRun) {
            const res = await fetch(PISTON_EXECUTE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: runtime.name,
                    version: runtime.version,
                    files: [{ name: fileName, content: code }],
                    stdin: tc.input,
                    run_timeout: 5000,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                results.push({
                    input: tc.input,
                    output: (err.message || `Execution error: ${res.status}`).slice(0, 200),
                    expected: tc.expected,
                    passed: false,
                });
                allPassed = false;
                continue;
            }

            const data = await res.json();
            const stdout = (data.run?.stdout ?? "").trim().replace(/\r\n/g, "\n");
            const stderr = data.run?.stderr?.trim() ?? "";
            const exitCode = data.run?.code ?? -1;
            const status = data.run?.status ?? null; // RE, SG, TO, etc.

            const output = stdout || (stderr ? `stderr: ${stderr}` : "") || (status ? `Exit: ${status}` : `Exit code: ${exitCode}`);
            const normalizedExpected = tc.expected.replace(/\r\n/g, "\n").trim();
            const passed = normalizedExpected ? stdout === normalizedExpected : exitCode === 0 && !status;

            results.push({
                input: tc.input,
                output: output.slice(0, 500),
                expected: tc.expected,
                passed: !!passed,
            });
            if (!passed) allPassed = false;
        }

        const passedCount = results.filter((r) => r.passed).length;
        const failedCount = results.length - passedCount;

        return NextResponse.json({
            status: "COMPLETED",
            passed: passedCount,
            failed: failedCount,
            testCases: results,
            allPassed,
        });
    } catch (error) {
        console.error("Code run error:", error);
        return NextResponse.json(
            { error: "Execution failed", details: String(error) },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

const PISTON_EXECUTE_URL = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_MAP: Record<string, { name: string; version: string; ext: string }> = {
    javascript: { name: "javascript", version: "*", ext: "js" },
    js: { name: "javascript", version: "*", ext: "js" },
    typescript: { name: "typescript", version: "*", ext: "ts" },
    python: { name: "python", version: "*", ext: "py" },
    python3: { name: "python", version: "*", ext: "py" },
    cpp: { name: "c++", version: "*", ext: "cpp" },
    java: { name: "java", version: "*", ext: "java" },
    csharp: { name: "csharp", version: "*", ext: "cs" },
    go: { name: "go", version: "*", ext: "go" },
    ruby: { name: "ruby", version: "*", ext: "rb" },
    rust: { name: "rust", version: "*", ext: "rs" },
};

export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { code, language = "javascript", userComponentId, problemId, testCases = [] } = body;

        if (!code) {
            return NextResponse.json({ error: "Missing code" }, { status: 400 });
        }

        // Fetch test cases from question metadata if problemId provided
        let finalTestCases: { input: string; expected: string }[] = testCases;
        if (finalTestCases.length === 0 && problemId) {
            const question = await prisma.componentQuestion.findUnique({
                where: { id: problemId },
                select: { metadata: true },
            });
            const meta = question?.metadata as { testCases?: { input: string; expectedOutput?: string; expected?: string }[] } | null;
            if (meta?.testCases?.length) {
                finalTestCases = meta.testCases.map((tc) => ({
                    input: (tc.input ?? "").trim(),
                    expected: (tc.expectedOutput ?? tc.expected ?? "").trim(),
                }));
            }
        }

        const langKey = language.toLowerCase().replace(/\s+/g, "");
        const runtime = LANGUAGE_MAP[langKey] ?? LANGUAGE_MAP.javascript;

        const casesToRun = finalTestCases.length > 0 ? finalTestCases : [{ input: "", expected: "" }];
        const results: { input: string; output: string; expected: string; passed: boolean }[] = [];
        let passed = 0;

        for (const tc of casesToRun) {
            try {
                const res = await fetch(PISTON_EXECUTE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        language: runtime.name,
                        version: runtime.version,
                        files: [{ name: `main.${runtime.ext}`, content: code }],
                        stdin: tc.input,
                        run_timeout: 5000,
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    const stdout = (data.run?.stdout ?? "").trim();
                    const normalizedExpected = (tc.expected ?? "").trim();
                    const tcPassed = normalizedExpected ? stdout === normalizedExpected : (data.run?.code ?? -1) === 0;
                    results.push({ input: tc.input, output: stdout.slice(0, 500), expected: tc.expected, passed: !!tcPassed });
                    if (tcPassed) passed++;
                } else {
                    results.push({ input: tc.input, output: "Execution error", expected: tc.expected, passed: false });
                }
            } catch {
                results.push({ input: tc.input, output: "Piston unavailable", expected: tc.expected, passed: false });
            }
        }

        const total = casesToRun.length;
        const score = Math.round((passed / total) * 100);
        const allPassed = passed === total;

        // Persist score to UserAssessmentComponent if provided
        if (userComponentId) {
            try {
                await prisma.userAssessmentComponent.update({
                    where: { id: userComponentId },
                    data: {
                        score,
                        status: "COMPLETED",
                        completedAt: new Date(),
                        aiEvaluationResults: {
                            type: "CODE_CHALLENGE",
                            passed,
                            total,
                            allPassed,
                            language,
                        },
                    },
                });
            } catch (dbErr) {
                console.warn("Could not persist code score:", dbErr);
            }
        }

        return NextResponse.json({ success: true, score, passed, total, allPassed, results });

    } catch (error) {
        console.error("Code submit error:", error);
        return NextResponse.json({ success: true, score: 0, passed: 0, total: 0, allPassed: false, mock: true });
    }
}

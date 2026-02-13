
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Play, Send, CheckCircle2, XCircle, Loader2, Code2, Terminal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const CodeChallengeRunner: React.FC = () => {
    const [code, setCode] = useState('// Write your solution here\nfunction solution(input) {\n    return input;\n}');
    const [language, setLanguage] = useState('javascript');
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<any>(null);

    const problem = {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
        starterCode: {
            javascript: "function twoSum(nums, target) {\n    // Your code here\n}",
            python: "def two_sum(nums, target):\n    # Your code here\n    pass"
        }
    };

    const handleRunTests = async () => {
        setRunning(true);
        try {
            const res = await fetch('/api/assessments/code/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    problemId: 'mock',
                    testCases: [
                        { input: '2\n7\n11\n15\n9', expectedOutput: '[0,1]' },
                        { input: '3\n2\n4\n6\n6', expectedOutput: '[1,2]' },
                        { input: '2\n3\n3\n6', expectedOutput: '[0,1]' }
                    ]
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResults(data);
            const total = (data.testCases?.length ?? 0) || 1;
            const passed = data.passed ?? 0;
            toast.info(`Tests: ${passed}/${total} passed`);
        } catch (error) {
            toast.error("Execution failed");
            setResults(null);
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const allPassed = results?.allPassed ?? (results?.testCases?.length ? results.passed === results.testCases.length : false);
            const res = await fetch('/api/assessments/code/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    challengeId: 'mock_challenge_id',
                    problemId: 'mock',
                    passed: allPassed
                })
            });
            if (!res.ok) throw new Error("Submit failed");
            toast.success("Solution submitted successfully!");
        } catch (error) {
            toast.error("Submission failed");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
            {/* Left: Problem Statement */}
            <div className="space-y-6 overflow-y-auto pr-2">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center mb-2">
                            <Badge variant="outline" className="text-orange-600 bg-orange-50">Medium</Badge>
                            <span className="text-sm text-gray-500">Points: 100</span>
                        </div>
                        <CardTitle className="text-2xl">{problem.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 leading-relaxed text-base">{problem.description}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Example Case
                            </h4>
                            <pre className="text-xs bg-white p-3 border rounded font-mono">{problem.example}</pre>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-bold">Constraints</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                <li>2 \u2264 nums.length \u2264 104</li>
                                <li>-109 \u2264 nums[i] \u2264 109</li>
                                <li>-109 \u2264 target \u2264 109</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {results && (
                    <Card className={results.failed === 0 ? 'border-green-200' : 'border-red-200'}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Terminal className="h-5 w-5" />
                                Test Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {results.testCases.map((tc: { input?: string; output?: string; expected?: string; passed?: boolean }, i: number) => (
                                    <div key={i} className={`p-3 rounded border ${tc.passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-mono text-gray-500">Case {i + 1}: {tc.input || '(no input)'}</span>
                                            {tc.passed ? (
                                                <Badge variant="outline" className="bg-white text-green-600 border-green-200">Passed</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-white text-red-600 border-red-200">Failed</Badge>
                                            )}
                                        </div>
                                        {!tc.passed && (tc.output != null || tc.expected != null) && (
                                            <div className="text-xs font-mono mt-2 space-y-1">
                                                {tc.expected != null && <div><span className="text-gray-500">Expected:</span> {String(tc.expected).slice(0, 80)}</div>}
                                                {tc.output != null && <div><span className="text-gray-500">Got:</span> {String(tc.output).slice(0, 80)}</div>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right: Code Editor */}
            <div className="flex flex-col gap-4">
                <Card className="flex-1 flex flex-col bg-slate-900 overflow-hidden border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between py-3 border-b border-slate-800 bg-slate-950">
                        <div className="flex items-center gap-4">
                            <Code2 className="h-5 w-5 text-blue-400" />
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[140px] bg-slate-800 text-slate-200 border-slate-700 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 text-slate-200 border-slate-700">
                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                    <SelectItem value="python">Python 3</SelectItem>
                                    <SelectItem value="cpp">C++</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">
                                Reset
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <textarea
                            className="w-full h-full p-6 bg-slate-900 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:ring-0 leading-relaxed"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck={false}
                        />
                    </CardContent>
                    <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3 rotate-0">
                        <Button
                            variant="outline"
                            className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                            onClick={handleRunTests}
                            disabled={running}
                        >
                            {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                            Run Tests
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleSubmit}
                            disabled={running}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Submit Solution
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

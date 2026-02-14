"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = ["python", "javascript", "java", "cpp", "sql", "typescript"];

interface TestCase {
    input: string;
    expectedOutput: string;
}

export interface CodeConfig {
    language: string;
    testCases: TestCase[];
    competencyName: string;
    targetLevel: string;
}

interface CodeComponentBuilderProps {
    componentId: string;
    modelId: string;
    competencyName: string;
    targetLevel: string;
    indicators?: { id: string; text: string; level: string }[];
    initialConfig?: CodeConfig | null;
    onComplete: () => void;
    onCancel: () => void;
}

export function CodeComponentBuilder({
    componentId,
    modelId,
    competencyName,
    targetLevel,
    initialConfig,
    onComplete,
    onCancel,
}: CodeComponentBuilderProps) {
    const [problemStatement, setProblemStatement] = useState("");
    const [language, setLanguage] = useState(initialConfig?.language ?? "python");
    const [testCases, setTestCases] = useState<TestCase[]>(
        initialConfig?.testCases?.length ? initialConfig.testCases : [{ input: "", expectedOutput: "" }]
    );
    const [saving, setSaving] = useState(false);

    const addTestCase = () => setTestCases((prev) => [...prev, { input: "", expectedOutput: "" }]);
    const removeTestCase = (i: number) => setTestCases((prev) => prev.filter((_, idx) => idx !== i));
    const updateTestCase = (i: number, field: "input" | "expectedOutput", value: string) => {
        setTestCases((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], [field]: value };
            return next;
        });
    };

    const handleSave = async () => {
        if (!problemStatement.trim()) {
            toast.error("Problem statement is required");
            return;
        }
        const validCases = testCases.filter((t) => t.input.trim() || t.expectedOutput.trim());
        if (validCases.length === 0) {
            toast.error("Add at least one test case");
            return;
        }
        setSaving(true);
        try {
            const config: CodeConfig = {
                language,
                testCases: validCases,
                competencyName,
                targetLevel,
            };

            const patchRes = await fetch(
                `/api/assessments/admin/models/${modelId}/components/${componentId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ config }),
                }
            );
            if (!patchRes.ok) {
                const err = await patchRes.json();
                toast.error(err.error || "Failed to save config");
                return;
            }

            const bulkRes = await fetch(
                `/api/assessments/admin/components/${componentId}/questions/bulk-json`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        questions: [
                            {
                                questionText: problemStatement,
                                questionType: "CODING_CHALLENGE",
                                points: 100,
                                linkedIndicators: [],
                                metadata: { ...config, type: "CODE_PROBLEM_CONFIG" },
                            },
                        ],
                    }),
                }
            );
            if (!bulkRes.ok) {
                const err = await bulkRes.json();
                toast.error(err.error || "Failed to save questions");
                return;
            }
            toast.success("Code test configured");
            onComplete();
        } catch {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Code className="w-6 h-6 text-navy-600" />
                        <CardTitle>Code Test Configuration</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Define the coding problem for {competencyName}. Uses Python backend (Piston API) for
                        execution.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Problem statement</Label>
                        <Textarea
                            placeholder="Describe the coding challenge..."
                            value={problemStatement}
                            onChange={(e) => setProblemStatement(e.target.value)}
                            rows={6}
                            className="resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LANGUAGES.map((lang) => (
                                    <SelectItem key={lang} value={lang}>
                                        {lang}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Test cases</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {testCases.map((tc, i) => (
                                <div key={i} className="flex gap-2 items-start p-3 border rounded-lg">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="Input"
                                            value={tc.input}
                                            onChange={(e) => updateTestCase(i, "input", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Expected output"
                                            value={tc.expectedOutput}
                                            onChange={(e) => updateTestCase(i, "expectedOutput", e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeTestCase(i)}
                                        disabled={testCases.length <= 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={onCancel} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Code Test
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Settings2, Upload, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface SurveyQuestion {
    id: string;
    questionText?: string;
    text?: string;
    questionType?: string;
    type?: string;
    options?: string[] | null;
    isRequired?: boolean;
    order?: number;
}

const TYPE_TO_BUILDER: Record<string, string> = {
    TEXT: 'SHORT_TEXT', MCQ: 'MULTIPLE_CHOICE', MSQ: 'MULTIPLE_CHOICE', RATING: 'RATING', LIKERT: 'LIKERT_SCALE'
};

const CSV_TEMPLATE = `questionText,questionType,options,isRequired
"What is your primary role?",MCQ,"Option 1|Option 2|Option 3",true
"How would you rate this experience (1-5)?",RATING,,true
"Any additional comments?",TEXT,,false`;

export function SurveyQuestionEditor({
    clientId,
    surveyId,
    surveyName,
    initialQuestions,
    onSaved,
}: {
    clientId: string;
    surveyId: string;
    surveyName: string;
    initialQuestions: SurveyQuestion[];
    onSaved?: () => void;
}) {
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const mapped = (initialQuestions || []).map((q, i) => ({
            id: q.id,
            text: q.questionText || q.text || '',
            type: (TYPE_TO_BUILDER[q.questionType || q.type || 'TEXT'] || 'SHORT_TEXT') as 'SHORT_TEXT' | 'LONG_TEXT' | 'MULTIPLE_CHOICE' | 'RATING' | 'LIKERT_SCALE',
            options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? [q.options] : ['Option 1']),
            isRequired: q.isRequired ?? true,
            order: q.order ?? i + 1,
        }));
        setQuestions(mapped);
    }, [initialQuestions]);

    const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const addQuestion = (type: 'SHORT_TEXT' | 'LONG_TEXT' | 'MULTIPLE_CHOICE' | 'RATING' | 'LIKERT_SCALE') => {
        const newQuestion: any = {
            id: 'new_' + Math.random().toString(36).substr(2, 9),
            text: '',
            type,
            isRequired: true,
            options: type === 'MULTIPLE_CHOICE' || type === 'LIKERT_SCALE' ? ['Option 1'] : undefined,
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
        setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    };

    const removeSelectedQuestions = () => {
        if (selectedIds.size === 0) return;
        setQuestions(questions.filter(q => !selectedIds.has(q.id)));
        setSelectedIds(new Set());
        toast.success(`Removed ${selectedIds.size} question(s)`);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const s = new Set(prev);
            if (s.has(id)) s.delete(id);
            else s.add(id);
            return s;
        });
    };

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'survey_questions_template.csv';
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success("Template downloaded");
    };

    const parseCsvRow = (row: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
            const c = row[i];
            if (c === '"') inQuotes = !inQuotes;
            else if (c === ',' && !inQuotes) {
                result.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else if (c !== '"') current += c;
        }
        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
    };

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const text = (ev.target?.result as string) || '';
                const lines = text.split(/\r?\n/).filter(l => l.trim());
                if (lines.length < 2) { toast.error("CSV must have header and at least one row"); return; }
                const typeMap: Record<string, 'SHORT_TEXT' | 'MULTIPLE_CHOICE' | 'RATING' | 'LIKERT_SCALE'> = {
                    text: 'SHORT_TEXT', mcq: 'MULTIPLE_CHOICE', msq: 'MULTIPLE_CHOICE',
                    rating: 'RATING', likert: 'LIKERT_SCALE'
                };
                const newQs: any[] = [];
                for (let i = 1; i < lines.length; i++) {
                    const parts = parseCsvRow(lines[i]);
                    if (parts.length < 2) continue;
                    const questionText = parts[0] || '';
                    const qType = (parts[1] || 'TEXT').toUpperCase();
                    const type = typeMap[qType] || 'SHORT_TEXT';
                    const optsStr = parts[2] || '';
                    const options = optsStr ? optsStr.split('|').map(o => o.trim()).filter(Boolean) : undefined;
                    if ((type === 'MULTIPLE_CHOICE' || type === 'LIKERT_SCALE') && (!options || options.length === 0)) continue;
                    newQs.push({
                        id: 'new_' + Math.random().toString(36).substr(2, 9),
                        text: questionText,
                        type,
                        options: type === 'MULTIPLE_CHOICE' || type === 'LIKERT_SCALE' ? (options || ['Option 1']) : undefined,
                        isRequired: (parts[3] || 'true').toLowerCase() !== 'false',
                    });
                }
                setQuestions(prev => [...prev, ...newQs]);
                toast.success(`Imported ${newQs.length} question(s)`);
            } catch {
                toast.error("Failed to parse CSV");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const typeToApi = (t: string) => ({ SHORT_TEXT: 'TEXT', LONG_TEXT: 'TEXT', MULTIPLE_CHOICE: 'MCQ', RATING: 'RATING', LIKERT_SCALE: 'LIKERT' }[t] || 'TEXT');

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/surveys/${surveyId}/questions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questions: questions.map((q, i) => ({
                        id: q.id.startsWith('new_') ? undefined : q.id,
                        questionText: q.text,
                        questionType: typeToApi(q.type || 'SHORT_TEXT'),
                        options: q.options || null,
                        isRequired: q.isRequired ?? true,
                        order: i + 1,
                    })),
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to save');
            }
            toast.success("Questions saved");
            onSaved?.();
        } catch (e: any) {
            toast.error(e.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Questions ({questions.length})</h3>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => addQuestion('SHORT_TEXT')}><Plus className="h-4 w-4 mr-1" /> Short Text</Button>
                    <Button variant="outline" size="sm" onClick={() => addQuestion('MULTIPLE_CHOICE')}><Plus className="h-4 w-4 mr-1" /> Multiple Choice</Button>
                    <Button variant="outline" size="sm" onClick={() => addQuestion('RATING')}><Plus className="h-4 w-4 mr-1" /> Rating</Button>
                    <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="h-4 w-4 mr-1" /> Download CSV Template</Button>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-1" /> Upload CSV</Button>
                    <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                    {selectedIds.size > 0 && (
                        <Button variant="destructive" size="sm" onClick={removeSelectedQuestions}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete selected ({selectedIds.size})
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={saving}>Save Changes</Button>
                </div>
            </div>
            {questions.map((q, index) => (
                <Card key={q.id} className="relative group">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div className="flex-1 space-y-4">
                            <div className="flex gap-4 items-center">
                                <Checkbox checked={selectedIds.has(q.id)} onCheckedChange={() => toggleSelect(q.id)} />
                                <Badge variant="secondary">Q{index + 1}</Badge>
                                <Input
                                    className="text-lg font-semibold border-none bg-transparent p-0 focus-visible:ring-0"
                                    placeholder="Enter your question here..."
                                    value={q.text || ''}
                                    onChange={e => updateQuestion(q.id, { text: e.target.value })}
                                />
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}>
                            <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Select value={q.type} onValueChange={(val: any) => updateQuestion(q.id, { type: val })}>
                                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SHORT_TEXT">Short Text</SelectItem>
                                    <SelectItem value="LONG_TEXT">Long Text</SelectItem>
                                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                    <SelectItem value="RATING">Rating (1-5)</SelectItem>
                                    <SelectItem value="LIKERT_SCALE">Likert Scale</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                                <Switch checked={q.isRequired ?? true} onCheckedChange={val => updateQuestion(q.id, { isRequired: val })} />
                                <Label className="text-xs">Required</Label>
                            </div>
                        </div>
                        {(q.type === 'MULTIPLE_CHOICE' || q.type === 'LIKERT_SCALE') && (
                            <div className="space-y-2 pl-6 border-l-2 border-gray-100 ml-2">
                                {(q.options || []).map((opt: string, optIdx: number) => (
                                    <div key={optIdx} className="flex gap-2">
                                        <Input className="h-8 text-sm" value={opt}
                                            onChange={e => {
                                                const newOpts = [...(q.options || [])];
                                                newOpts[optIdx] = e.target.value;
                                                updateQuestion(q.id, { options: newOpts });
                                            }}
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8"
                                            onClick={() => updateQuestion(q.id, { options: (q.options || []).filter((_: any, i: number) => i !== optIdx) })}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" className="text-xs h-8"
                                    onClick={() => updateQuestion(q.id, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] })}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Option
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
            {questions.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-gray-50">
                    <Settings2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900">No questions yet</h4>
                    <p className="text-gray-500 mb-6">Add questions or upload a CSV.</p>
                    <Button onClick={() => addQuestion('SHORT_TEXT')}><Plus className="mr-2 h-4 w-4" /> Add First Question</Button>
                </div>
            )}
        </div>
    );
}

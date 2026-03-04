'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, RefreshCw, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIGenerateQuestionsDialogProps {
    componentId: string;
    onSuccess: () => void;
    defaultTopic?: string;
}

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Manufacturing", "Education", "Generic"];
const BLOOMS_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const PITFALLS = ["Trick questions", "Double negatives", "Ambiguous wording", "Cultural bias"];
const QUESTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "CODING_CHALLENGE", "ESSAY", "SCENARIO_BASED"];

const MODELS = [
    { label: "Google Gemini 1.5 Flash", value: "gemini-1.5-flash" },
    { label: "OpenAI GPT-4o", value: "gpt-4o" },
    { label: "Anthropic Claude 3.5 Sonnet", value: "claude-3-5-sonnet" },
    { label: "xAI Grok-2", value: "grok-2" }
];

export function AIGenerateQuestionsDialog({ componentId, onSuccess, defaultTopic }: AIGenerateQuestionsDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'config' | 'generating' | 'review'>('config');
    const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());

    // Form State
    const [config, setConfig] = useState({
        model: "gemini-1.5-flash",
        topic: defaultTopic || "",
        difficulty: "Intermediate",
        questionTypes: ["MULTIPLE_CHOICE"],
        count: 5,

        learningObjectives: "",
        keyConcepts: "", // Comma separated
        industry: "Generic",
        realWorldContext: "",

        includeCode: false,
        programmingLanguage: "",
        bloomsLevel: ["Understand", "Apply"],
        points: 1,
        timeLimit: 60,

        avoidPitfalls: ["Ambiguous wording"],
        tone: "Formal"
    });

    const handleGenerate = async () => {
        setStep('generating');
        try {
            const response = await fetch(`/api/admin/assessment-components/${componentId}/questions/ai-generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...config,
                    keyConcepts: config.keyConcepts.split(',').map(s => s.trim()).filter(Boolean)
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Generation failed");
            }

            const data = await response.json();
            const questions = data.questions || [];

            if (questions.length === 0) {
                throw new Error("AI returned no questions. Please try refining your topic or specifications.");
            }

            setGeneratedQuestions(questions);
            // Select all by default
            setSelectedQuestions(new Set(questions.map((_: any, i: number) => i)));
            setStep('review');
        } catch (error: any) {
            toast.error(error.message);
            setStep('config');
        }
    };

    const handleSave = async () => {
        if (selectedQuestions.size === 0) return;

        setStep('generating'); // Reuse loading state
        try {
            const questionsToSave = generatedQuestions.filter((_, i) => selectedQuestions.has(i));

            // Save individually or bulk. Using bulk logic or iterating. 
            // We will assume iterating for now as per existing pattern or bulk if API supports.
            // The previous pattern was iterating. I'll stick to iteration for safety.

            let savedCount = 0;
            for (const q of questionsToSave) {
                await fetch(`/api/admin/assessment-components/${componentId}/questions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        questionText: q.questionText,
                        questionType: q.questionType,
                        points: q.points || config.points,
                        timeLimit: q.estimatedTime || config.timeLimit,
                        options: q.options,
                        correctAnswer: q.correctAnswer, // Middleware might handle this
                        programmingLanguage: q.programmingLanguage,
                        starterCode: q.starterCode,
                        testCases: q.testCases,
                        evaluationCriteria: q.evaluationCriteria,
                        explanation: q.explanation,
                        order: 999 // auto-managed by backend usually or append
                    }),
                });
                savedCount++;
            }

            toast.success(`Saved ${savedCount} questions!`);
            onSuccess();
            setOpen(false);
            setStep('config');
            setGeneratedQuestions([]);
        } catch (error: any) {
            toast.error("Error saving questions: " + error.message);
            setStep('review');
        }
    };

    const toggleQuestionType = (type: string) => {
        setConfig(prev => {
            const exists = prev.questionTypes.includes(type);
            if (exists) return { ...prev, questionTypes: prev.questionTypes.filter(t => t !== type) };
            return { ...prev, questionTypes: [...prev.questionTypes, type] };
        });
    };

    const toggleBlooms = (level: string) => {
        setConfig(prev => {
            const exists = prev.bloomsLevel.includes(level);
            if (exists) return { ...prev, bloomsLevel: prev.bloomsLevel.filter(t => t !== level) };
            return { ...prev, bloomsLevel: [...prev.bloomsLevel, level] };
        });
    };

    const togglePitfall = (pf: string) => {
        setConfig(prev => {
            const exists = prev.avoidPitfalls.includes(pf);
            if (exists) return { ...prev, avoidPitfalls: prev.avoidPitfalls.filter(t => t !== pf) };
            return { ...prev, avoidPitfalls: [...prev.avoidPitfalls, pf] };
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transition-all">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI Question Generator
                    </DialogTitle>
                </DialogHeader>

                {step === 'config' && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <Tabs defaultValue="context" className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-6 pt-2">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="context">1. Context</TabsTrigger>
                                    <TabsTrigger value="additional">2. Deep Context</TabsTrigger>
                                    <TabsTrigger value="specs">3. Specs</TabsTrigger>
                                    <TabsTrigger value="quality">4. Quality</TabsTrigger>
                                </TabsList>
                            </div>

                            <ScrollArea className="flex-1 p-6">
                                <TabsContent value="context" className="space-y-6 mt-0">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label>Topic / Subject</Label>
                                            <Input
                                                placeholder="e.g. JavaScript Promises, Conflict Resolution"
                                                value={config.topic}
                                                onChange={e => setConfig({ ...config, topic: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Difficulty</Label>
                                                <Select value={config.difficulty} onValueChange={v => setConfig({ ...config, difficulty: v })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>AI Model Provider</Label>
                                                <Select value={config.model} onValueChange={v => setConfig({ ...config, model: v })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Number of Questions: {config.count}</Label>
                                                <Slider
                                                    value={[config.count]}
                                                    min={1} max={50} step={1}
                                                    onValueChange={v => setConfig({ ...config, count: v[0] })}
                                                    className="py-4"
                                                />
                                            </div>
                                            <div className="pt-8">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Recommended: 5-10 per request</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label>Question Types</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {QUESTION_TYPES.map(type => (
                                                    <div key={type} className="flex items-center space-x-2 border p-2 rounded hover:bg-slate-50">
                                                        <Checkbox
                                                            checked={config.questionTypes.includes(type)}
                                                            onCheckedChange={() => toggleQuestionType(type)}
                                                        />
                                                        <span className="text-sm font-medium">{type.replace(/_/g, ' ')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="additional" className="space-y-6 mt-0">
                                    <div className="space-y-2">
                                        <Label>Learning Objectives</Label>
                                        <Textarea
                                            placeholder="What should the candidate be able to do?"
                                            value={config.learningObjectives}
                                            onChange={e => setConfig({ ...config, learningObjectives: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Key Concepts (comma separated)</Label>
                                        <Input
                                            placeholder="async/await, error handling, try-catch"
                                            value={config.keyConcepts}
                                            onChange={e => setConfig({ ...config, keyConcepts: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Industry Context</Label>
                                        <Select value={config.industry} onValueChange={v => setConfig({ ...config, industry: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Real-world Application Scenario</Label>
                                        <Textarea
                                            placeholder="Describe a practical situation..."
                                            value={config.realWorldContext}
                                            onChange={e => setConfig({ ...config, realWorldContext: e.target.value })}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="specs" className="space-y-6 mt-0">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={config.includeCode}
                                            onCheckedChange={(c) => setConfig({ ...config, includeCode: !!c })}
                                        />
                                        <Label>Include Code Snippets</Label>
                                    </div>
                                    {config.includeCode && (
                                        <div className="pl-6">
                                            <Label>Programming Language</Label>
                                            <Input
                                                placeholder="Python, JavaScript, etc."
                                                value={config.programmingLanguage}
                                                onChange={e => setConfig({ ...config, programmingLanguage: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Target Bloom's Taxonomy Levels</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {BLOOMS_LEVELS.map(level => (
                                                <Badge
                                                    key={level}
                                                    variant={config.bloomsLevel.includes(level) ? "default" : "outline"}
                                                    className="cursor-pointer"
                                                    onClick={() => toggleBlooms(level)}
                                                >
                                                    {level}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Default Points</Label>
                                            <Input
                                                type="number"
                                                value={config.points}
                                                onChange={e => setConfig({ ...config, points: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Time Limit (seconds)</Label>
                                            <Input
                                                type="number"
                                                value={config.timeLimit}
                                                onChange={e => setConfig({ ...config, timeLimit: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="quality" className="space-y-6 mt-0">
                                    <div className="space-y-2">
                                        <Label>Tone</Label>
                                        <Select value={config.tone} onValueChange={v => setConfig({ ...config, tone: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {["Formal", "Conversational", "Technical", "Simple"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Avoid Pitfalls</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {PITFALLS.map(pf => (
                                                <div key={pf} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={config.avoidPitfalls.includes(pf)}
                                                        onCheckedChange={() => togglePitfall(pf)}
                                                    />
                                                    <span className="text-sm">{pf}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>

                        <div className="p-4 border-t flex justify-between bg-gray-50">
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700 text-white">
                                Generate Questions
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                        <h3 className="text-xl font-semibold">Generating Questions...</h3>
                        <p className="text-gray-500 text-center max-w-md">
                            Our AI is crafting {config.count} questions based on your detailed specifications.
                            This usually takes 10-20 seconds.
                        </p>
                    </div>
                )}

                {step === 'review' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 py-2 bg-purple-50 border-b flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-purple-900">Review Generated Questions</h3>
                                <p className="text-xs text-purple-700">Select questions to add to your bank.</p>
                            </div>
                            <div className="text-sm font-medium">
                                Selected: {selectedQuestions.size} / {generatedQuestions.length}
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-6 bg-gray-50">
                            <div className="space-y-4">
                                {generatedQuestions.map((q, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg border-2 transition-all ${selectedQuestions.has(idx) ? 'border-purple-500 bg-white shadow-sm' : 'border-transparent bg-gray-100 opacity-70'}`}>
                                        <div className="flex gap-3">
                                            <Checkbox
                                                checked={selectedQuestions.has(idx)}
                                                onCheckedChange={(checked) => {
                                                    const next = new Set(selectedQuestions);
                                                    if (checked) next.add(idx);
                                                    else next.delete(idx);
                                                    setSelectedQuestions(next);
                                                }}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between">
                                                    <Badge variant="outline">{q.questionType}</Badge>
                                                    <Badge className="bg-purple-100 text-purple-800 border-0">{q.difficulty || config.difficulty}</Badge>
                                                </div>
                                                <p className="font-medium text-gray-900">{q.questionText}</p>

                                                {/* Options Preview */}
                                                {q.options && (
                                                    <div className="pl-4 border-l-2 border-gray-200 space-y-1 mt-2">
                                                        {Array.isArray(q.options) && q.options.map((opt: any, i: number) => (
                                                            <div key={i} className="text-sm text-gray-600 flex items-center">
                                                                {typeof opt === 'string' ? opt : opt.text}
                                                                {(q.correctAnswer === opt || opt.isCorrect) && <Check className="w-3 h-3 ml-2 text-green-600" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t flex justify-between bg-white">
                            <Button variant="ghost" onClick={() => setStep('config')}>Back to Config</Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleGenerate}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                                </Button>
                                <Button onClick={handleSave} disabled={selectedQuestions.size === 0} className="bg-green-600 hover:bg-green-700 text-white">
                                    Save {selectedQuestions.size} Questions
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

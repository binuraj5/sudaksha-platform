"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ArrowRight, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { RecommendationCard } from "@/components/assessments/RecommendationCard";
import { useEffect } from "react";

export function CreateSurveyWizard({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        purpose: "",
        scoringEnabled: false,
        questions: [] as any[]
    });

    const [recommendations, setRecommendations] = useState<{ id: string; category: string; recommendationText: string; rationale: string; autoApplyValues: Record<string, unknown> | null }[]>([]);

    useEffect(() => {
        if (!formData.purpose || formData.purpose.trim() === '') {
            setRecommendations([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetch(`/api/recommendations/survey?purpose=${encodeURIComponent(formData.purpose)}`)
                .then((r) => r.json())
                .then((data) => setRecommendations(data.recommendations || []))
                .catch(() => setRecommendations([]));
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [formData.purpose]);

    const router = useRouter();

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                {
                    id: Date.now(), // temp id
                    questionText: "",
                    questionType: "LIKERT",
                    isRequired: true
                }
            ]
        });
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setFormData({ ...formData, questions: newQuestions });
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...formData.questions];
        newQuestions.splice(index, 1);
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/surveys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Survey created successfully");
                setOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to create survey");
            }
        } catch (error) {
            toast.error("Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Survey
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Create New Survey (Step {step}/3)</DialogTitle>
                    <DialogDescription>
                        {step === 1 ? "Basic Information" : step === 2 ? "Add Questions" : "Review & Settings"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 px-1">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Survey Name <span className="text-red-500">*</span></Label>
                                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Employee Satisfaction Q1" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." />
                            </div>
                            <div className="grid gap-2">
                                <Label>Purpose</Label>
                                <Input value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} placeholder="e.g. Gather feedback on new policy" />
                            </div>

                            {/* Insert recommendations dynamically */}
                            {recommendations.length > 0 && (
                                <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-bottom-2">
                                    <Label className="text-xs text-muted-foreground">Smart Suggestions based on Purpose</Label>
                                    {recommendations.map((rec) => (
                                        <RecommendationCard
                                            key={rec.id}
                                            recommendation={rec}
                                            onApply={(values) => {
                                                if (values) {
                                                    setFormData(prev => ({ ...prev, ...values }));
                                                    toast.success("Applied intelligent recommendation template");
                                                }
                                            }}
                                            onDismiss={(id) => setRecommendations(prev => prev.filter(r => r.id !== id))}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            {formData.questions.map((q, idx) => (
                                <Card key={q.id}>
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold text-sm text-gray-500">Q{idx + 1}</div>
                                            <Button variant="ghost" size="sm" onClick={() => removeQuestion(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                        </div>
                                        <Input
                                            placeholder="Question Text"
                                            value={q.questionText}
                                            onChange={e => updateQuestion(idx, 'questionText', e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Select value={q.questionType} onValueChange={v => updateQuestion(idx, 'questionType', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LIKERT">Likert Scale</SelectItem>
                                                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                                    <SelectItem value="TEXT">Text Response</SelectItem>
                                                    <SelectItem value="RATING">Rating (1-5)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`req-${idx}`}
                                                    checked={q.isRequired}
                                                    onCheckedChange={(c) => updateQuestion(idx, 'isRequired', !!c)}
                                                />
                                                <Label htmlFor={`req-${idx}`}>Required</Label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={addQuestion}>
                                <Plus className="mr-2 h-4 w-4" /> Add Question
                            </Button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg">{formData.name}</h3>
                                <p className="text-gray-500 text-sm">{formData.description || "No description."}</p>
                                <div className="text-sm font-medium text-indigo-600">{formData.questions.length} Questions Configured</div>
                            </div>

                            <div className="border rounded-md p-4 bg-gray-50">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="scoring"
                                        checked={formData.scoringEnabled}
                                        onCheckedChange={(c) => setFormData({ ...formData, scoringEnabled: !!c })}
                                    />
                                    <Label htmlFor="scoring">Enable Scoring</Label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 ml-6">
                                    If enabled, questions can be assigned points and a total score will be calculated.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between items-center mt-4 border-t pt-4">
                    {step > 1 ? (
                        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)} disabled={!formData.name}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Create Survey
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
